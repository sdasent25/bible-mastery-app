"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import {
  BooksQuestPageShell,
  BooksQuestPanel,
  BooksQuestStatusBadge,
  BooksQuestTopBar,
} from "@/components/BooksQuestShell"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { createClient } from "@/lib/supabase/client"
import { isWhoSaidItBookUnlocked } from "@/lib/whoSaidItUnlock"

const SESSION_SIZE = 10
const allowedPlans = ["pro_plus", "family_pro_plus"]

type WhoSaidItQuestion = {
  id: string
  book: string
  speaker: string
  reference: string
  quote_text: string | null
  prompt_context: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  source_key: string
}

type BookMetaRow = {
  book: string
  book_order: number
}

function getLocalDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function hashString(input: string) {
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function selectDailyQuestions<T extends { source_key: string }>(
  items: T[],
  seed: string,
  limit: number,
) {
  return [...items]
    .sort((a, b) => {
      const aHash = hashString(`${seed}|${a.source_key}`)
      const bHash = hashString(`${seed}|${b.source_key}`)

      if (aHash !== bHash) {
        return aHash - bHash
      }

      return a.source_key.localeCompare(b.source_key)
    })
    .slice(0, Math.min(limit, items.length))
}

function ProgressPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="ba-card-soft rounded-[1.1rem] px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
    </div>
  )
}

export default function WhoSaidItPlayPage() {
  const searchParams = useSearchParams()
  const requestedBook = searchParams.get("book")?.trim() ?? ""

  const [plan, setPlan] = useState("free")
  const [planLoading, setPlanLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<WhoSaidItQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [bookExists, setBookExists] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const isSummary = questions.length > 0 && currentIndex >= questions.length
  const currentQuestion = !isSummary ? questions[currentIndex] : null
  const accuracy =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  const answerOptions = useMemo(() => {
    if (!currentQuestion) {
      return []
    }

    return [
      currentQuestion.option_a,
      currentQuestion.option_b,
      currentQuestion.option_c,
      currentQuestion.option_d,
    ]
  }, [currentQuestion])

  useEffect(() => {
    const resolvePlan = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const resolvedPlan = await getUserPlan()
      setUserId(user?.id ?? null)
      setPlan(resolvedPlan)
      setPlanLoading(false)
    }

    void resolvePlan()
  }, [])

  useEffect(() => {
    if (planLoading || !allowedPlans.includes(plan)) {
      return
    }

    if (!requestedBook) {
      setQuestions([])
      setLoadError("This drill is being prepared.")
      return
    }

    const loadQuestions = async () => {
      setLoadingQuestions(true)
      setLoadError(null)
      setBookExists(false)

      const supabase = createClient()
      const { data: bookMeta, error: bookMetaError } = await supabase
        .from("who_said_it_questions")
        .select("book, book_order")
        .eq("type", "who_said_it")
        .eq("book", requestedBook)
        .limit(1)
        .maybeSingle()

      if (bookMetaError) {
        setLoadError("This drill is being prepared.")
        setQuestions([])
        setLoadingQuestions(false)
        return
      }

      if (!bookMeta) {
        setLoadError("This drill is being prepared.")
        setQuestions([])
        setLoadingQuestions(false)
        return
      }

      const selectedBook = bookMeta as BookMetaRow
      const unlocked = isWhoSaidItBookUnlocked(selectedBook.book_order)
      setBookExists(true)

      if (!unlocked) {
        setLoadError("This drill is locked.")
        setQuestions([])
        setLoadingQuestions(false)
        return
      }

      const { data, error } = await supabase
        .from("who_said_it_questions")
        .select(
          "id, book, speaker, reference, quote_text, prompt_context, question, option_a, option_b, option_c, option_d, correct_answer, source_key"
        )
        .eq("type", "who_said_it")
        .eq("book", requestedBook)
        .order("source_key", { ascending: true })

      if (error) {
        setLoadError("This drill is being prepared.")
        setQuestions([])
        setLoadingQuestions(false)
        return
      }

      const validRows = (data ?? []) as WhoSaidItQuestion[]

      if (validRows.length === 0) {
        setLoadError("This drill is being prepared.")
        setQuestions([])
        setLoadingQuestions(false)
        return
      }

      const dateKey = getLocalDateKey()
      const resolvedUserId = userId ?? "anonymous"
      const nextDailySeed = `${resolvedUserId}|${requestedBook}|${dateKey}`
      const sessionQuestions = selectDailyQuestions(
        validRows,
        nextDailySeed,
        SESSION_SIZE
      )

      setQuestions(sessionQuestions)
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setSubmittedAnswer(null)
      setScore(0)
      setLoadingQuestions(false)
    }

    void loadQuestions()
  }, [plan, planLoading, requestedBook, userId])

  const handleSelectAnswer = (answer: string) => {
    if (submittedAnswer) {
      return
    }

    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !selectedAnswer || submittedAnswer) {
      return
    }

    setSubmittedAnswer(selectedAnswer)

    if (selectedAnswer === currentQuestion.correct_answer) {
      setScore((currentScore) => currentScore + 1)
    }
  }

  const handleContinue = () => {
    setCurrentIndex((index) => index + 1)
    setSelectedAnswer(null)
    setSubmittedAnswer(null)
  }

  const handlePracticeAgain = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setSubmittedAnswer(null)
    setScore(0)
  }

  if (planLoading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  if (!allowedPlans.includes(plan)) {
    return (
      <Paywall
        title="Quests Locked"
        message="Upgrade to Pro+ to unlock premium Bible skill challenges, focused practice modes, and deeper mastery paths."
      />
    )
  }

  if (loadingQuestions) {
    return (
      <BooksQuestPageShell maxWidth="max-w-3xl">
        <BooksQuestPanel>Preparing drill...</BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (loadError || questions.length === 0) {
    const isLockedState = loadError === "This drill is locked."

    return (
      <BooksQuestPageShell maxWidth="max-w-3xl">
        <BooksQuestPanel>
          <div className="ba-badge-gold">Daily Practice Set</div>
          <h1 className="mt-4 text-3xl font-black text-white">
            {isLockedState ? "This drill is locked." : "This drill is being prepared."}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {isLockedState
              ? `Reach ${requestedBook} in Journey to unlock this practice.`
              : requestedBook
                ? `We could not load a Who Said It practice set for ${requestedBook}.`
                : "Choose a book from the Who Said It hub to begin practice."}
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/quests/who-said-it"
              className="ba-button-primary px-5 py-4 text-center text-base font-black"
            >
              Back to Who Said It
            </Link>
            {isLockedState ? (
              <Link
                href="/journey"
                className="ba-button-secondary px-5 py-4 text-center font-semibold"
              >
                Go to Journey
              </Link>
            ) : null}
            <Link
              href="/quests"
              className="ba-button-secondary px-5 py-4 text-center font-semibold"
            >
              Back to Quests
            </Link>
          </div>
        </BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (isSummary) {
    return (
      <BooksQuestPageShell maxWidth="max-w-4xl">
        <BooksQuestPanel>
          <div className="ba-badge-gold">Practice Summary</div>
          <h1 className="mt-4 text-3xl font-black text-white">Training Complete</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Daily practice set complete. XP is still coming later for this mode.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ProgressPill label="Book" value={requestedBook} />
            <ProgressPill label="Score" value={`${score}/${questions.length}`} />
            <ProgressPill label="Accuracy" value={`${accuracy}%`} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handlePracticeAgain}
              className="ba-button-primary flex-1 px-5 py-4 text-base font-black"
            >
              Practice Again
            </button>
            <Link
              href="/quests/who-said-it"
              className="ba-button-secondary flex-1 px-5 py-4 text-center font-semibold"
            >
              Back to Who Said It
            </Link>
          </div>
        </BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (!currentQuestion) {
    return (
      <BooksQuestPageShell maxWidth="max-w-3xl">
        <BooksQuestPanel>
          <div className="ba-badge-gold">Daily Practice Set</div>
          <h1 className="mt-4 text-3xl font-black text-white">This drill is being prepared.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            We could not finish loading this practice question.
          </p>
          <Link
            href="/quests/who-said-it"
            className="ba-button-primary mt-5 inline-flex px-5 py-4 text-base font-black"
          >
            Back to Who Said It
          </Link>
        </BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  const isCorrect = submittedAnswer === currentQuestion.correct_answer

  return (
    <BooksQuestPageShell maxWidth="max-w-4xl">
      <BooksQuestPanel>
        <BooksQuestTopBar
          backHref="/quests/who-said-it"
          meta={
            <BooksQuestStatusBadge tone="practice">
              Question {currentIndex + 1} of {questions.length}
            </BooksQuestStatusBadge>
          }
        />

        <div className="flex flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="ba-badge-gold">Speaker Recognition Drill</div>
              <h1 className="mt-3 text-3xl font-black text-white">Who Said It?</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Daily practice set. 10 questions available today. XP is still coming later.
              </p>
            </div>
            <BooksQuestStatusBadge tone="practice">Practice Mode</BooksQuestStatusBadge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ProgressPill label="Book" value={currentQuestion.book} />
            <ProgressPill label="Reference" value={currentQuestion.reference} />
            <ProgressPill label="Today" value="10 Available" />
            <ProgressPill label="Score" value={`${score}/${questions.length}`} />
          </div>
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)] sm:p-6">
          <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Prompt Context
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              {currentQuestion.prompt_context}
            </p>
          </div>

          {currentQuestion.quote_text?.trim() ? (
            <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Quoted Words
              </div>
              <p className="mt-3 text-base font-medium leading-7 text-white">
                “{currentQuestion.quote_text.trim()}”
              </p>
            </div>
          ) : null}

          <h2 className="mt-5 text-2xl font-black leading-tight text-white">
            {currentQuestion.question}
          </h2>

          <div className="mt-5 grid gap-3">
            {answerOptions.map((answer) => {
              const isSelected = selectedAnswer === answer
              const showCorrect =
                submittedAnswer !== null &&
                answer === currentQuestion.correct_answer
              const showWrong =
                submittedAnswer === answer &&
                answer !== currentQuestion.correct_answer

              return (
                <button
                  key={`${currentQuestion.source_key}-${answer}`}
                  type="button"
                  onClick={() => handleSelectAnswer(answer)}
                  disabled={submittedAnswer !== null}
                  className={`w-full rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
                    showCorrect
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100"
                      : showWrong
                        ? "border-rose-400/50 bg-rose-500/15 text-rose-100"
                        : isSelected
                          ? "border-amber-300/45 bg-amber-400/10 text-white"
                          : "border-white/10 bg-white/5 text-zinc-100 hover:border-amber-300/25 hover:bg-white/10"
                  } ${submittedAnswer !== null ? "cursor-default" : "active:scale-[0.99]"}`}
                >
                  {answer}
                </button>
              )
            })}
          </div>

          {submittedAnswer === null ? (
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className={`mt-5 w-full rounded-2xl px-5 py-4 text-base font-black transition ${
                selectedAnswer
                  ? "ba-button-primary"
                  : "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-500"
              }`}
            >
              Check Answer
            </button>
          ) : (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div
                className={`text-base font-bold ${
                  isCorrect ? "text-emerald-300" : "text-amber-200"
                }`}
              >
                {isCorrect
                  ? "Correct."
                  : `The correct answer is: ${currentQuestion.correct_answer}`}
              </div>
              <button
                type="button"
                onClick={handleContinue}
                className="ba-button-primary mt-4 w-full px-5 py-4 text-base font-black"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </BooksQuestPanel>
    </BooksQuestPageShell>
  )
}
