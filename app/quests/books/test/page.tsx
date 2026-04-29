"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
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
  const [books, setBooks] = useState<BookRow[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [choices, setChoices] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [xpEarned, setXpEarned] = useState<number | null>(null)
  const [isPractice, setIsPractice] = useState(false)
  const incrementXP = useXPStore((s) => s.incrementXP)
  const testFocus = seed % 5

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
  }, [])

  useEffect(() => {
    if (focusedBooks.length >= 4 && !currentQuestion && !isComplete) {
      loadQuestion()
    }
  }, [focusedBooks, currentQuestion, isComplete, loadQuestion])

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

  const handleRetry = () => {
    setScore(0)
    setQuestionIndex(0)
    setCurrentQuestion("")
    setChoices([])
    setSelectedAnswer(null)
    setCorrectAnswer("")
    setXpEarned(null)
    setIsPractice(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        Loading test mode...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        {error}
      </div>
    )
  }

  if (!sortedBooks.length) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        No books loaded
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        <div className="rounded-3xl border border-white/10 bg-gray-950 p-6 shadow-2xl">
          <div className="rounded-3xl border border-white/10 bg-gray-900 p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-bold">Test Complete</h2>

            <p className="text-lg">Score: {score} / 10</p>

            {xpEarned !== null ? (
              <>
                <div className="mt-4 text-green-400 font-semibold">
                  +{xpEarned} XP
                </div>

                <div className="text-xs text-gray-400">
                  Daily reward earned
                </div>
              </>
            ) : isPractice ? (
              <>
                <div className="mt-4 text-yellow-400 font-semibold">
                  Practice Mode
                </div>

                <div className="text-xs text-gray-400">
                  🔥 You already earned today&apos;s XP
                  <br />
                  Keep improving your score
                </div>
              </>
            ) : (
              <p className="mt-4 text-2xl font-semibold text-white">Checking reward...</p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleRetry}
                className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition transform active:scale-95 hover:scale-105"
              >
                Retry Test
              </button>

              <Link
                href="/quests/books"
                className="rounded-2xl bg-gray-700 px-5 py-3 font-semibold text-white transition transform active:scale-95 hover:scale-105"
              >
                Back to Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg p-6 text-white md:p-10">
      <div className="rounded-3xl border border-white/10 bg-gray-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Test Mode</h1>
            {testFocus === 0 && <p className="text-xs text-gray-400">🔥 Today&apos;s Focus: PENTATEUCH</p>}
            {testFocus === 1 && <p className="text-xs text-gray-400">🔥 Today&apos;s Focus: HISTORICAL</p>}
            {testFocus === 2 && <p className="text-xs text-gray-400">🔥 Today&apos;s Focus: WISDOM</p>}
            {testFocus === 3 && <p className="text-xs text-gray-400">🔥 Today&apos;s Focus: PROPHETS</p>}
            {testFocus === 4 && <p className="text-xs text-gray-400">🔥 Today&apos;s Focus: MIXED</p>}
          </div>
          <Link
            href="/quests/books"
            className="text-sm text-gray-300 transition transform active:scale-95 hover:text-white"
          >
            Back
          </Link>
        </div>

        <div className="text-xs text-gray-400 mb-4">
          🧠 Daily XP available
          <br />
          Earn rewards on your first test
          <br />
          Practice to improve your score
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-gray-900/80 px-4 py-3 text-sm font-medium text-gray-300">
          Question {questionIndex + 1} / {TOTAL_QUESTIONS}
        </div>

        <div className="rounded-3xl border border-white/10 bg-gray-900/80 px-5 py-10 text-center">
          <div className="text-3xl font-bold text-white">{currentQuestion}</div>
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
                className={`w-full rounded-2xl border px-4 py-4 text-left transition transform active:scale-95 ${
                  shouldHighlightCorrect
                    ? "border-green-500 bg-green-600 text-white"
                    : shouldHighlightWrong
                      ? "border-red-500 bg-red-600 text-white"
                      : hasAnswered
                        ? "cursor-not-allowed border-white/10 bg-gray-800/70 text-gray-400"
                        : "border-white/10 bg-gray-800 text-white hover:scale-105"
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
                ? "border-green-500/40 bg-green-500/10 text-green-300"
                : "border-red-500/40 bg-red-500/10 text-red-200"
            }`}
          >
            <div className="text-lg font-semibold">
              {isCorrect ? "Correct" : `Correct answer: ${correctAnswer}`}
            </div>

            <button
              onClick={handleNextQuestion}
              className="mt-4 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition transform active:scale-95 hover:scale-105"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
