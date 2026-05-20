"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import {
  BooksQuestHero,
  BooksQuestPageShell,
  BooksQuestPanel,
  BooksQuestStatusBadge,
  BooksQuestTopBar,
} from "@/components/BooksQuestShell"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { isQuestPlan } from "@/lib/questAccess"
import { createClient } from "@/lib/supabase/client"
import { useXPStore } from "@/lib/xpStore"

type BookRow = {
  id: string
  book: string
  book_order: number
  category: string | null
}

type QuestionMode = "after" | "before" | "number" | "category"

type Question = {
  prompt: string
  correctAnswer: string
  choices: string[]
}

const TOTAL_QUESTIONS = 10

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }

  return next
}

function formatCategory(category: string | null) {
  if (!category) return "Unknown"

  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function createQuestion(sortedBooks: BookRow[]): Question | null {
  if (sortedBooks.length < 4) return null

  const categories = Array.from(
    new Set(
      sortedBooks
        .map((book) => book.category)
        .filter((category): category is string => Boolean(category))
    )
  )

  const modes: QuestionMode[] = ["after", "before", "number"]

  if (categories.length >= 4) {
    modes.push("category")
  }

  const mode = modes[Math.floor(Math.random() * modes.length)]

  if (mode === "after") {
    const index = Math.floor(Math.random() * (sortedBooks.length - 1))
    const baseBook = sortedBooks[index]
    const correctAnswer = sortedBooks[index + 1].book
    const wrongAnswers = shuffle(
      sortedBooks
        .filter((book) => book.book !== correctAnswer)
        .map((book) => book.book)
    ).slice(0, 3)

    return {
      prompt: `What comes AFTER ${baseBook.book}?`,
      correctAnswer,
      choices: shuffle([correctAnswer, ...wrongAnswers]),
    }
  }

  if (mode === "before") {
    const index = Math.floor(Math.random() * (sortedBooks.length - 1)) + 1
    const baseBook = sortedBooks[index]
    const correctAnswer = sortedBooks[index - 1].book
    const wrongAnswers = shuffle(
      sortedBooks
        .filter((book) => book.book !== correctAnswer)
        .map((book) => book.book)
    ).slice(0, 3)

    return {
      prompt: `What comes BEFORE ${baseBook.book}?`,
      correctAnswer,
      choices: shuffle([correctAnswer, ...wrongAnswers]),
    }
  }

  if (mode === "number") {
    const targetBook = sortedBooks[Math.floor(Math.random() * sortedBooks.length)]
    const correctAnswer = targetBook.book
    const wrongAnswers = shuffle(
      sortedBooks
        .filter((book) => book.book !== correctAnswer)
        .map((book) => book.book)
    ).slice(0, 3)

    return {
      prompt: `Which book is #${targetBook.book_order}?`,
      correctAnswer,
      choices: shuffle([correctAnswer, ...wrongAnswers]),
    }
  }

  const targetBook = sortedBooks[Math.floor(Math.random() * sortedBooks.length)]
  const correctAnswer = formatCategory(targetBook.category)
  const wrongAnswers = shuffle(
    categories.filter((category) => category !== targetBook.category).map(formatCategory)
  ).slice(0, 3)

  return {
    prompt: `Which category does ${targetBook.book} belong to?`,
    correctAnswer,
    choices: shuffle([correctAnswer, ...wrongAnswers]),
  }
}

export default function BooksTestModePage() {
  const today = new Date().toISOString().slice(0, 10)
  const seed = Number(today.replace(/-/g, ""))
  const testFocus = seed % 5
  let challengeLabel = ""

  if (testFocus === 0) challengeLabel = "Pentateuch"
  if (testFocus === 1) challengeLabel = "Historical books"
  if (testFocus === 2) challengeLabel = "Wisdom books"
  if (testFocus === 3) challengeLabel = "Prophets"
  if (testFocus === 4) challengeLabel = "Mixed challenge"

  const [plan, setPlan] = useState("free")
  const [planLoading, setPlanLoading] = useState(true)
  const [books, setBooks] = useState<BookRow[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [choices, setChoices] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [xpEarned, setXpEarned] = useState<number | null>(null)
  const [isPractice, setIsPractice] = useState(false)
  const incrementXP = useXPStore((s) => s.incrementXP)

  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => a.book_order - b.book_order),
    [books]
  )

  const focusedBooks = useMemo(() => {
    let filteredBooks = sortedBooks

    if (testFocus === 0) {
      filteredBooks = sortedBooks.filter((book) => book.category === "pentateuch")
    } else if (testFocus === 1) {
      filteredBooks = sortedBooks.filter((book) => book.category === "history")
    } else if (testFocus === 2) {
      filteredBooks = sortedBooks.filter((book) => book.category === "wisdom")
    } else if (testFocus === 3) {
      filteredBooks = sortedBooks.filter((book) => book.category === "prophets")
    }

    return filteredBooks.length >= 4 ? filteredBooks : sortedBooks
  }, [sortedBooks, testFocus])

  const isComplete = questionIndex >= TOTAL_QUESTIONS
  const hasAnswered = selectedAnswer !== null
  const isCorrect = hasAnswered && selectedAnswer === correctAnswer

  const loadQuestion = useCallback(() => {
    const nextQuestion = createQuestion(focusedBooks)
    if (!nextQuestion) return

    setCurrentQuestion(nextQuestion.prompt)
    setChoices(nextQuestion.choices)
    setCorrectAnswer(nextQuestion.correctAnswer)
    setSelectedAnswer(null)
  }, [focusedBooks])

  useEffect(() => {
    const resolvePlan = async () => {
      const resolvedPlan = await getUserPlan()
      setPlan(resolvedPlan)
      setPlanLoading(false)
    }

    void resolvePlan()
  }, [])

  useEffect(() => {
    if (planLoading || !isQuestPlan(plan)) {
      return
    }

    const loadBooks = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/quests/books")
        const payload = await res.json()

        if (!res.ok) {
          throw new Error(payload?.error || "Failed to load books")
        }

        const nextBooks = Array.isArray(payload?.books) ? payload.books : []
        setBooks(nextBooks)
      } catch (loadError) {
        console.error("Failed to load books test mode data", loadError)
        setError("Unable to load books right now.")
      } finally {
        setLoading(false)
      }
    }

    void loadBooks()
  }, [plan, planLoading])

  useEffect(() => {
    if (hasStarted && focusedBooks.length >= 4 && !currentQuestion && !isComplete) {
      loadQuestion()
    }
  }, [focusedBooks, currentQuestion, hasStarted, isComplete, loadQuestion])

  useEffect(() => {
    if (!isComplete) return

    let cancelled = false

    const syncDailyReward = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase.rpc("award_test_mode_xp", {
        user_id_input: user.id,
        score_input: score,
      })

      if (error) {
        console.error("XP error:", error)
        if (!cancelled) {
          setIsPractice(true)
        }
        return
      }

      if (!cancelled) {
        if (data.awarded) {
          await supabase.rpc("update_streak", {
            user_id_input: user.id,
          })
          setXpEarned(data.xp)
          setIsPractice(false)
          incrementXP(data.xp)
        } else {
          setXpEarned(null)
          setIsPractice(true)
        }
      }
    }

    void syncDailyReward()

    return () => {
      cancelled = true
    }
  }, [incrementXP, isComplete, score])

  const handleAnswer = (choice: string) => {
    if (hasAnswered) return

    setSelectedAnswer(choice)

    if (choice === correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      setQuestionIndex(TOTAL_QUESTIONS)
      setCurrentQuestion("")
      setChoices([])
      setSelectedAnswer(null)
      return
    }

    setQuestionIndex((prev) => prev + 1)
    loadQuestion()
  }

  const handleStart = () => {
    setHasStarted(true)
    setScore(0)
    setQuestionIndex(0)
    setCurrentQuestion("")
    setChoices([])
    setSelectedAnswer(null)
    setCorrectAnswer("")
    setXpEarned(null)
    setIsPractice(false)
  }

  const handleRetry = () => {
    setHasStarted(true)
    setScore(0)
    setQuestionIndex(0)
    setCurrentQuestion("")
    setChoices([])
    setSelectedAnswer(null)
    setCorrectAnswer("")
    setXpEarned(null)
    setIsPractice(false)
  }

  if (planLoading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  if (!isQuestPlan(plan)) {
    return (
      <Paywall
        title="Quests Locked"
        message="Upgrade to Pro+ to unlock challenge modes, focused Bible structure drills, and deeper quest training paths."
      />
    )
  }

  if (loading) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel>Loading test mode...</BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (error) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel>{error}</BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (!sortedBooks.length) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel>No books loaded</BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (isComplete) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel className="text-center">
          <div className="ba-badge-gold">Test Complete</div>
          <h2 className="mt-4 text-3xl font-black text-white">Focused challenge complete</h2>
          <p className="mt-4 text-lg text-slate-200">Score: {score} / 10</p>

          {xpEarned !== null ? (
            <>
              <div className="mt-4 text-2xl font-black text-emerald-300">+{xpEarned} XP</div>
              <div className="text-xs text-slate-400">Daily reward earned</div>
            </>
          ) : isPractice ? (
            <>
              <div className="mt-4 font-semibold text-amber-200">Practice Mode</div>
              <div className="text-xs text-slate-400">
                You already earned today&apos;s XP. Keep improving your score.
              </div>
            </>
          ) : (
            <p className="mt-4 text-2xl font-semibold text-white">Checking reward...</p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleRetry}
              className="ba-button-primary px-5 py-3 text-base font-black"
            >
              Retry Test
            </button>

            <Link
              href="/quests/books"
              className="ba-button-secondary px-5 py-3 text-base font-semibold"
            >
              Back to Books
            </Link>
          </div>
        </BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (!hasStarted) {
    return (
      <BooksQuestPageShell maxWidth="max-w-4xl">
        <BooksQuestHero
          eyebrow="Books Quest"
          title="Test Mode"
          subtitle="Prove your mastery through a focused challenge that checks order, categories, and structural recall. Daily reward rules stay exactly as they are."
          actions={
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <button
                onClick={handleStart}
                className="ba-button-primary flex-1 px-5 py-4 text-base font-black lg:flex-none"
              >
                Start Test
              </button>
              <Link
                href="/quests/books"
                className="ba-button-secondary flex-1 px-5 py-4 text-center font-semibold lg:flex-none"
              >
                Back to Books
              </Link>
            </div>
          }
          stats={
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="ba-card-soft rounded-[1.2rem] px-4 py-4 text-center">
                <div className="text-2xl font-black text-white">10</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Questions</div>
              </div>
              <div className="ba-card-soft rounded-[1.2rem] px-4 py-4 text-center">
                <div className="text-2xl font-black text-white">4</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Choices</div>
              </div>
              <div className="ba-card-soft rounded-[1.2rem] px-4 py-4 text-center">
                <div className="text-lg font-black text-white">{challengeLabel}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Today&apos;s Focus</div>
              </div>
            </div>
          }
        />
      </BooksQuestPageShell>
    )
  }

  return (
    <BooksQuestPageShell>
      <BooksQuestPanel>
        <BooksQuestTopBar
          backHref="/quests/books"
          meta={<span>Question {questionIndex + 1} / {TOTAL_QUESTIONS}</span>}
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="ba-badge-gold">Test Mode</div>
            <h1 className="mt-3 text-3xl font-black text-white">Focused challenge</h1>
            <p className="mt-2 text-sm text-slate-400">Today&apos;s focus: {challengeLabel}</p>
          </div>
          <BooksQuestStatusBadge tone="ready">Daily XP Rules Active</BooksQuestStatusBadge>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center">
          <div className="text-3xl font-black text-white">{currentQuestion}</div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {choices.map((choice) => {
            const isSelected = selectedAnswer === choice
            const shouldHighlightCorrect = hasAnswered && choice === correctAnswer
            const shouldHighlightWrong = isSelected && choice !== correctAnswer

            return (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                disabled={hasAnswered}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition active:scale-95 ${
                  shouldHighlightCorrect
                    ? "border-emerald-400 bg-emerald-500/80 text-slate-950"
                    : shouldHighlightWrong
                      ? "border-rose-400 bg-rose-500/80 text-white"
                      : hasAnswered
                        ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
                        : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.06]"
                }`}
              >
                <div className="text-lg font-semibold">{choice}</div>
              </button>
            )
          })}
        </div>

        {hasAnswered && (
          <div
            className={`mt-6 rounded-2xl border px-4 py-4 text-center ${
              isCorrect
                ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-200"
                : "border-rose-400/40 bg-rose-500/10 text-rose-100"
            }`}
          >
            <div className="text-lg font-semibold">
              {isCorrect ? "Correct" : `Correct answer: ${correctAnswer}`}
            </div>

            <button
              onClick={handleNextQuestion}
              className="ba-button-primary mt-4 px-5 py-3 font-semibold"
            >
              Next Question
            </button>
          </div>
        )}
      </BooksQuestPanel>
    </BooksQuestPageShell>
  )
}
