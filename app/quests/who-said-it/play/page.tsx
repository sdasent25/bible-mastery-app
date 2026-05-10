"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { createClient } from "@/lib/supabase/client"

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

function shuffleQuestions<T>(items: T[]) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

function ProgressPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
    </div>
  )
}

export default function WhoSaidItPlayPage() {
  const searchParams = useSearchParams()
  const requestedBook = searchParams.get("book")

  const [plan, setPlan] = useState("free")
  const [planLoading, setPlanLoading] = useState(true)
  const [questions, setQuestions] = useState<WhoSaidItQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [sessionSeed, setSessionSeed] = useState(0)

  const isGenesis = requestedBook === "Genesis"
  const isSummary = questions.length > 0 && currentIndex >= questions.length
  const currentQuestion = !isSummary ? questions[currentIndex] : null
  const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

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
      const resolvedPlan = await getUserPlan()
      setPlan(resolvedPlan)
      setPlanLoading(false)
    }

    void resolvePlan()
  }, [])

  useEffect(() => {
    if (planLoading || !allowedPlans.includes(plan) || !isGenesis) {
      return
    }

    const loadQuestions = async () => {
      setLoadingQuestions(true)
      setLoadError(null)

      const supabase = createClient()
      const { data, error } = await supabase
        .from("who_said_it_questions")
        .select(
          "id, book, speaker, reference, quote_text, prompt_context, question, option_a, option_b, option_c, option_d, correct_answer, source_key"
        )
        .eq("type", "who_said_it")
        .eq("book", "Genesis")
        .order("source_key", { ascending: true })

      if (error) {
        setLoadError("This drill is being prepared.")
        setQuestions([])
        setLoadingQuestions(false)
        return
      }

      const shuffled = shuffleQuestions((data || []) as WhoSaidItQuestion[])
      const sessionQuestions = shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length))

      setQuestions(sessionQuestions)
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setSubmittedAnswer(null)
      setScore(0)
      setLoadingQuestions(false)
    }

    void loadQuestions()
  }, [isGenesis, plan, planLoading, sessionSeed])

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
    setSessionSeed((seed) => seed + 1)
  }

  if (planLoading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  if (!allowedPlans.includes(plan)) {
    return (
      <Paywall
        title="🔒 Quests Locked"
        message="Upgrade to Pro+ to unlock advanced quests and deep learning systems."
      />
    )
  }

  if (!isGenesis) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_32%),linear-gradient(180deg,#020617_0%,#09090b_42%,#000000_100%)] px-4 py-6 text-white">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
              Practice Preview
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white">
              This drill is being prepared.
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Genesis is the only active Who Said It practice drill right now.
            </p>
          </div>
          <Link
            href="/quests/who-said-it"
            className="rounded-2xl bg-amber-400 px-5 py-4 text-center text-base font-black text-slate-950"
          >
            Back to Who Said It
          </Link>
        </div>
      </div>
    )
  }

  if (loadingQuestions) {
    return <div className="p-6 text-white">Preparing drill...</div>
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_32%),linear-gradient(180deg,#020617_0%,#09090b_42%,#000000_100%)] px-4 py-6 text-white">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
              Practice Preview
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white">
              This drill is being prepared.
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              We could not load Genesis questions for this practice session yet.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/quests/who-said-it"
              className="rounded-2xl bg-amber-400 px-5 py-4 text-center text-base font-black text-slate-950"
            >
              Back to Who Said It
            </Link>
            <Link
              href="/quests"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center font-semibold text-white"
            >
              Back to Quests
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isSummary) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_34%),linear-gradient(180deg,#020617_0%,#09090b_45%,#000000_100%)] px-4 py-6 text-white">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <div className="rounded-[28px] border border-amber-400/15 bg-black/55 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Practice Summary
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white">
              Training Complete
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Genesis speaker recognition practice is complete. No XP was awarded in this preview.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ProgressPill label="Score" value={`${score}/${questions.length}`} />
            <ProgressPill label="Accuracy" value={`${accuracy}%`} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handlePracticeAgain}
              className="flex-1 rounded-2xl bg-amber-400 px-5 py-4 text-base font-black text-slate-950"
            >
              Practice Again
            </button>
            <Link
              href="/quests/who-said-it"
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center font-semibold text-white"
            >
              Back to Who Said It
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_32%),linear-gradient(180deg,#020617_0%,#09090b_42%,#000000_100%)] px-4 py-6 text-white">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
              Practice Preview
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white">
              This drill is being prepared.
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              We could not finish loading this practice question.
            </p>
          </div>
          <Link
            href="/quests/who-said-it"
            className="rounded-2xl bg-amber-400 px-5 py-4 text-center text-base font-black text-slate-950"
          >
            Back to Who Said It
          </Link>
        </div>
      </div>
    )
  }

  const isCorrect = submittedAnswer === currentQuestion.correct_answer

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_32%),linear-gradient(180deg,#020617_0%,#09090b_42%,#000000_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-[28px] border border-amber-400/15 bg-black/55 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                Speaker Recognition Drill
              </div>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Who Said It?
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Practice Mode • No XP awarded in this prototype
              </p>
            </div>
            <div className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ProgressPill label="Book" value={currentQuestion.book} />
            <ProgressPill label="Reference" value={currentQuestion.reference} />
            <ProgressPill label="Score" value={`${score}/${questions.length}`} />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-zinc-950/90 p-5 shadow-2xl sm:p-6">
          <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Prompt Context
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-200">
              {currentQuestion.prompt_context}
            </p>
          </div>

          {currentQuestion.quote_text?.trim() ? (
            <div className="mt-4 rounded-2xl border border-sky-300/15 bg-sky-400/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                Quoted Words
              </div>
              <p className="mt-3 text-base font-medium leading-7 text-white">
                “{currentQuestion.quote_text.trim()}”
              </p>
            </div>
          ) : null}

          <h2 className="mt-5 text-2xl font-bold leading-tight text-white">
            {currentQuestion.question}
          </h2>

          <div className="mt-5 grid gap-3">
            {answerOptions.map((answer) => {
              const isSelected = selectedAnswer === answer
              const showCorrect = submittedAnswer !== null && answer === currentQuestion.correct_answer
              const showWrong = submittedAnswer === answer && answer !== currentQuestion.correct_answer

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
                  ? "bg-amber-400 text-slate-950 active:scale-[0.99]"
                  : "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-500"
              }`}
            >
              Check Answer
            </button>
          ) : (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className={`text-base font-bold ${isCorrect ? "text-emerald-300" : "text-amber-200"}`}>
                {isCorrect ? "Correct." : `The correct answer is: ${currentQuestion.correct_answer}`}
              </div>
              <button
                type="button"
                onClick={handleContinue}
                className="mt-4 w-full rounded-2xl bg-amber-400 px-5 py-4 text-base font-black text-slate-950 active:scale-[0.99]"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
