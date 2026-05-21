"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"

import {
  BooksQuestPageShell,
  BooksQuestPanel,
} from "@/components/BooksQuestShell"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"
import { createClient } from "@/lib/supabase/client"
import { isWhoSaidItBookUnlocked } from "@/lib/whoSaidItUnlock"

const SESSION_SIZE = 10
const allowedPlans = ["pro_plus", "family_pro_plus"]
const optionLetters = ["A", "B", "C", "D"] as const

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

function WhoSaidItPlayStat({
  label,
  value,
  supporting,
  icon,
}: {
  label: string
  value: string
  supporting?: string
  icon: "quests" | "verse-memory" | "upgrade" | "home"
}) {
  return (
    <article className="ba-who-said-play-stat">
      <span className="ba-who-said-play-stat-icon">
        {renderNavIcon(icon, "h-4 w-4")}
      </span>
      <div className="min-w-0">
        <div className="ba-who-said-play-stat-label">{label}</div>
        <div className="ba-who-said-play-stat-value">{value}</div>
        {supporting ? (
          <div className="ba-who-said-play-stat-supporting">{supporting}</div>
        ) : null}
      </div>
    </article>
  )
}

function WhoSaidItSidePanel({
  title,
  icon,
  children,
  tone = "default",
}: {
  title: string
  icon: "quests" | "verse-memory" | "upgrade" | "home"
  children: ReactNode
  tone?: "default" | "accent"
}) {
  return (
    <section
      className={`ba-who-said-play-side-panel ${tone === "accent" ? "is-accent" : ""}`}
    >
      <div className="ba-who-said-play-side-panel-head">
        <span className="ba-who-said-play-side-panel-icon">
          {renderNavIcon(icon, "h-4 w-4")}
        </span>
        <span>{title}</span>
      </div>
      <div className="ba-who-said-play-side-panel-body">{children}</div>
    </section>
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

      const supabase = createClient()
      const { data: bookMeta, error: bookMetaError } = await supabase
        .from("who_said_it_questions")
        .select("book, book_order")
        .eq("type", "who_said_it")
        .eq("book", requestedBook)
        .limit(1)
        .maybeSingle()

      if (bookMetaError || !bookMeta) {
        setLoadError("This drill is being prepared.")
        setQuestions([])
        setLoadingQuestions(false)
        return
      }

      const selectedBook = bookMeta as BookMetaRow
      const unlocked = isWhoSaidItBookUnlocked(selectedBook.book_order)

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
        SESSION_SIZE,
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
      <BooksQuestPageShell maxWidth="max-w-4xl">
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
      <BooksQuestPageShell maxWidth="max-w-[95rem]">
        <div className="ba-who-said-play-page">
          <section className="ba-who-said-play-summary">
            <div className="ba-who-said-play-summary-art">
              <Image
                src="/quests/hero/who-said-it-hero.png"
                alt=""
                fill
                className="object-cover object-[72%_35%]"
                sizes="(max-width: 767px) 100vw, 1200px"
              />
            </div>
            <div className="ba-who-said-play-summary-overlay" />

            <div className="ba-who-said-play-summary-shell">
              <div className="ba-who-said-play-kicker">Practice Complete</div>
              <h1 className="ba-who-said-play-summary-title">Who Said It?</h1>
              <p className="ba-who-said-play-summary-copy">
                Daily practice set complete. No XP Yet. XP is coming later for this mode.
              </p>

              <div className="ba-who-said-play-summary-stats">
                <WhoSaidItPlayStat
                  label="Book"
                  value={requestedBook}
                  supporting="Speaker recognition drill"
                  icon="verse-memory"
                />
                <WhoSaidItPlayStat
                  label="Score"
                  value={`${score}/${questions.length}`}
                  supporting="Practice result"
                  icon="quests"
                />
                <WhoSaidItPlayStat
                  label="Accuracy"
                  value={`${accuracy}%`}
                  supporting="10-question daily set"
                  icon="home"
                />
                <WhoSaidItPlayStat
                  label="Reward"
                  value="No XP Yet"
                  supporting="Practice Only"
                  icon="upgrade"
                />
              </div>

              <div className="ba-who-said-play-summary-actions">
                <button
                  type="button"
                  onClick={handlePracticeAgain}
                  className="ba-who-said-play-primary"
                >
                  <span className="ba-hero-cta-medallion">
                    {renderNavIcon("quests", "h-[1rem] w-[1rem]")}
                  </span>
                  <span className="ba-hero-cta-label">Practice Again</span>
                  <span className="ba-quest-hero-cta-arrow">
                    {renderNavIcon("chevron-right", "h-4 w-4")}
                  </span>
                </button>
                <Link href="/quests/who-said-it" className="ba-who-said-play-secondary">
                  Back to Who Said It
                </Link>
                <Link href="/quests" className="ba-who-said-play-secondary">
                  Return to Quests
                </Link>
              </div>
            </div>
          </section>
        </div>
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
  const completedCount = submittedAnswer && isCorrect ? score : score

  return (
    <BooksQuestPageShell maxWidth="max-w-[95rem]">
      <div className="ba-who-said-play-page">
        <div className="ba-who-said-play-topbar">
          <Link href="/quests/who-said-it" className="ba-who-said-it-back">
            {renderNavIcon("chevron-right", "h-3.5 w-3.5 rotate-180")}
            Back to Challenge
          </Link>

          <div className="ba-who-said-play-progress-pill">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        <section className="ba-who-said-play-hero">
          <div className="ba-who-said-play-hero-art">
            <Image
              src="/quests/hero/who-said-it-hero.png"
              alt=""
              fill
              priority
              className="object-cover object-[72%_36%]"
              sizes="(max-width: 767px) 100vw, 1200px"
            />
          </div>
          <div className="ba-who-said-play-hero-overlay" />

          <div className="ba-who-said-play-hero-shell">
            <div className="ba-who-said-play-hero-copy">
              <div className="ba-who-said-play-kicker">Speaker Recognition Drill</div>
              <h1 className="ba-who-said-play-title">Who Said It?</h1>
              <div className="ba-who-said-play-hero-meta">
                <span className="ba-who-said-play-mode-pill">Practice Mode</span>
                <span className="ba-who-said-play-mode-copy">No XP Yet. XP is coming later.</span>
              </div>
            </div>

            <div className="ba-who-said-play-mobile-stats">
              <WhoSaidItPlayStat
                label="Question"
                value={`${currentIndex + 1}/${questions.length}`}
                icon="quests"
              />
              <WhoSaidItPlayStat
                label="Score"
                value={`${score}`}
                icon="upgrade"
              />
              <WhoSaidItPlayStat
                label="Book"
                value={currentQuestion.book}
                icon="verse-memory"
              />
            </div>
          </div>
        </section>

        <div className="ba-who-said-play-layout">
          <main className="ba-who-said-play-main">
            <section className="ba-who-said-play-info-card is-context">
              <div className="ba-who-said-play-section-kicker">
                {renderNavIcon("verse-memory", "h-4 w-4")}
                Prompt Context
              </div>
              <p className="ba-who-said-play-info-copy">{currentQuestion.prompt_context}</p>
            </section>

            {currentQuestion.quote_text?.trim() ? (
              <section className="ba-who-said-play-info-card is-quote">
                <div className="ba-who-said-play-section-kicker">
                  {renderNavIcon("upgrade", "h-4 w-4")}
                  Quoted Words
                </div>
                <p className="ba-who-said-play-quote">“{currentQuestion.quote_text.trim()}”</p>
              </section>
            ) : null}

            <section className="ba-who-said-play-question-card">
              <h2 className="ba-who-said-play-question">{currentQuestion.question}</h2>

              <div className="ba-who-said-play-options">
                {answerOptions.map((answer, index) => {
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
                      className={`ba-who-said-play-option ${
                        showCorrect
                          ? "is-correct"
                          : showWrong
                            ? "is-wrong"
                            : isSelected
                              ? "is-selected"
                              : ""
                      } ${submittedAnswer !== null ? "is-locked" : ""}`}
                    >
                      <span className="ba-who-said-play-option-letter">
                        {optionLetters[index] ?? "?"}
                      </span>
                      <span className="ba-who-said-play-option-text">{answer}</span>
                    </button>
                  )
                })}
              </div>

              {submittedAnswer === null ? (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className={`ba-who-said-play-primary mt-5 ${
                    !selectedAnswer ? "is-disabled" : ""
                  }`}
                >
                  <span className="ba-hero-cta-label">Check Answer</span>
                  <span className="ba-quest-hero-cta-arrow">
                    {renderNavIcon("chevron-right", "h-4 w-4")}
                  </span>
                </button>
              ) : (
                <div className="ba-who-said-play-feedback">
                  <div
                    className={`ba-who-said-play-feedback-title ${
                      isCorrect ? "is-correct" : "is-wrong"
                    }`}
                  >
                    {isCorrect
                      ? "Correct."
                      : `The correct answer is: ${currentQuestion.correct_answer}`}
                  </div>
                  <p className="ba-who-said-play-feedback-copy">
                    Practice Only. No XP Yet. Keep sharpening speaker recognition through context and quoted words.
                  </p>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="ba-who-said-play-primary mt-4"
                  >
                    <span className="ba-hero-cta-label">Continue</span>
                    <span className="ba-quest-hero-cta-arrow">
                      {renderNavIcon("chevron-right", "h-4 w-4")}
                    </span>
                  </button>
                </div>
              )}
            </section>
          </main>

          <aside className="ba-who-said-play-sidebar">
            <WhoSaidItSidePanel title="Question Progress" icon="quests">
              <div className="ba-who-said-play-progress-row">
                {questions.map((question, index) => {
                  const isCurrent = index === currentIndex
                  const isDone = index < currentIndex

                  return (
                    <span
                      key={question.source_key}
                      className={`ba-who-said-play-progress-dot ${
                        isCurrent ? "is-current" : isDone ? "is-done" : ""
                      }`}
                    />
                  )
                })}
              </div>
              <div className="ba-who-said-play-progress-scale">
                <span>1</span>
                <span>{questions.length}</span>
              </div>
            </WhoSaidItSidePanel>

            <WhoSaidItSidePanel title="Current Book" icon="verse-memory" tone="accent">
              <div className="ba-who-said-play-side-value">{currentQuestion.book}</div>
              <div className="ba-who-said-play-side-copy">{currentQuestion.reference}</div>
            </WhoSaidItSidePanel>

            <WhoSaidItSidePanel title="Session Info" icon="home">
              <div className="ba-who-said-play-side-list">
                <div className="ba-who-said-play-side-list-row">
                  <span>Score</span>
                  <strong>{completedCount}</strong>
                </div>
                <div className="ba-who-said-play-side-list-row">
                  <span>Questions</span>
                  <strong>{questions.length}</strong>
                </div>
                <div className="ba-who-said-play-side-list-row">
                  <span>Mode</span>
                  <strong>Practice Only</strong>
                </div>
                <div className="ba-who-said-play-side-list-row">
                  <span>Reward</span>
                  <strong>No XP Yet</strong>
                </div>
              </div>
            </WhoSaidItSidePanel>

            <WhoSaidItSidePanel title="Focus Tip" icon="upgrade" tone="accent">
              <p className="ba-who-said-play-side-copy">
                Listen for context clues in who is speaking, what was said, and why the moment matters.
              </p>
            </WhoSaidItSidePanel>
          </aside>
        </div>
      </div>
    </BooksQuestPageShell>
  )
}
