"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

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
  const [books, setBooks] = useState<BookRow[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [choices, setChoices] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => a.book_order - b.book_order),
    [books]
  )

  const isComplete = questionIndex >= TOTAL_QUESTIONS
  const hasAnswered = selectedAnswer !== null
  const isCorrect = hasAnswered && selectedAnswer === correctAnswer

  const loadQuestion = useCallback(() => {
    const nextQuestion = createQuestion(sortedBooks)
    if (!nextQuestion) return

    setCurrentQuestion(nextQuestion.prompt)
    setChoices(nextQuestion.choices)
    setCorrectAnswer(nextQuestion.correctAnswer)
    setSelectedAnswer(null)
  }, [sortedBooks])

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
    if (sortedBooks.length >= 4 && !currentQuestion && !isComplete) {
      loadQuestion()
    }
  }, [sortedBooks, currentQuestion, isComplete, loadQuestion])

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
            <h1 className="text-3xl font-bold text-white">Test Complete</h1>
            <p className="mt-4 text-2xl font-semibold text-white">
              Score: {score} / {TOTAL_QUESTIONS}
            </p>

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
          <h1 className="text-3xl font-bold text-white">Test Mode</h1>
          <Link
            href="/quests/books"
            className="text-sm text-gray-300 transition transform active:scale-95 hover:text-white"
          >
            Back
          </Link>
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
