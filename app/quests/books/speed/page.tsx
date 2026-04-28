"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

type BookRow = {
  id: string
  book: string
  book_order: number
  testament: string | null
  category: string | null
  theme: string | null
}

type Question = {
  id: string
  prompt: string
  answer: BookRow
  mode: "after" | "before" | "number"
}

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }

  return next
}

function awardBooksSpeedXp() {
  // TODO: connect real XP awarding for Speed Round
}

function createQuestion(sortedBooks: BookRow[]): Question | null {
  if (sortedBooks.length < 4) return null

  const availableModes: Question["mode"][] = []

  if (sortedBooks.length > 1) {
    availableModes.push("after", "before")
  }

  availableModes.push("number")

  const mode = availableModes[Math.floor(Math.random() * availableModes.length)]

  if (mode === "after") {
    const index = Math.floor(Math.random() * (sortedBooks.length - 1))
    const baseBook = sortedBooks[index]
    const answer = sortedBooks[index + 1]

    return {
      id: `${mode}-${baseBook.id}-${answer.id}`,
      prompt: `What comes AFTER ${baseBook.book}?`,
      answer,
      mode,
    }
  }

  if (mode === "before") {
    const index = Math.floor(Math.random() * (sortedBooks.length - 1)) + 1
    const baseBook = sortedBooks[index]
    const answer = sortedBooks[index - 1]

    return {
      id: `${mode}-${baseBook.id}-${answer.id}`,
      prompt: `What comes BEFORE ${baseBook.book}?`,
      answer,
      mode,
    }
  }

  const answer = sortedBooks[Math.floor(Math.random() * sortedBooks.length)]

  return {
    id: `${mode}-${answer.id}`,
    prompt: `Which book is #${answer.book_order}?`,
    answer,
    mode,
  }
}

export default function BooksSpeedRoundPage() {
  const [books, setBooks] = useState<BookRow[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [choices, setChoices] = useState<BookRow[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameOver, setGameOver] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [showPoint, setShowPoint] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
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
        console.error("Failed to load books speed round data", loadError)
        setError("Unable to load books right now.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => a.book_order - b.book_order),
    [books]
  )

  const buildQuestion = useCallback(() => {
    const nextQuestion = createQuestion(sortedBooks)
    if (!nextQuestion) return

    const incorrectChoices = shuffle(
      sortedBooks.filter((book) => book.id !== nextQuestion.answer.id)
    ).slice(0, 3)

    setCurrentQuestion(nextQuestion)
    setChoices(shuffle([nextQuestion.answer, ...incorrectChoices]))
    setFeedback(null)
    setShowPoint(false)
    setSelectedId(null)
  }, [sortedBooks])

  useEffect(() => {
    if (sortedBooks.length >= 4 && hasStarted && !currentQuestion && !gameOver) {
      buildQuestion()
    }
  }, [sortedBooks, currentQuestion, gameOver, hasStarted, buildQuestion])

  useEffect(() => {
    if (loading || !hasStarted || gameOver || !sortedBooks.length || !currentQuestion) {
      return
    }

    if (timeLeft <= 0) {
      setGameOver(true)
      awardBooksSpeedXp()
      return
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [timeLeft, gameOver, loading, sortedBooks, hasStarted, currentQuestion])

  const startGame = () => {
    setHasStarted(true)
    setScore(0)
    setTimeLeft(30)
    setGameOver(false)
    setCurrentQuestion(null)
    setChoices([])
    setFeedback(null)
    setShowPoint(false)
    setSelectedId(null)
  }

  const handleAnswer = (book: BookRow) => {
    if (!currentQuestion || gameOver) return

    const isCorrect = book.id === currentQuestion.answer.id
    setSelectedId(book.id)

    if (isCorrect) {
      setScore((prev) => prev + 1)
      setFeedback("correct")
      setShowPoint(true)
    } else {
      setFeedback("wrong")
    }

    window.setTimeout(() => {
      if (timeLeft <= 0) {
        setGameOver(true)
        setCurrentQuestion(null)
        setChoices([])
        setFeedback(null)
        setShowPoint(false)
        setSelectedId(null)
        return
      }

      setFeedback(null)
      setShowPoint(false)
      buildQuestion()
    }, 250)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        Loading speed round...
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

  if (gameOver) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        <div className="rounded-3xl border border-white/10 bg-gray-900 p-8 text-center shadow-2xl">
          <h1 className="text-3xl font-bold">Time&apos;s Up!</h1>
          <p className="mt-4 text-2xl font-semibold text-white">Score: {score}</p>
          <p className="mt-3 text-2xl font-semibold text-green-400">+XP</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={startGame}
              className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition transform active:scale-95 hover:scale-105"
            >
              Play Again
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
    )
  }

  if (!hasStarted) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        <div className="rounded-3xl border border-white/10 bg-gray-950 p-6 shadow-2xl">
          <div className="rounded-[2rem] border border-amber-300/20 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_55%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(3,7,18,0.98))] p-6">
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-[0.28em] text-amber-200/80">
                Books Quest
              </div>
              <h1 className="mt-3 text-4xl font-black text-white">Speed Round</h1>
              <p className="mt-4 text-sm leading-6 text-gray-300">
                Answer as many books-of-the-Bible questions as you can in 30 seconds.
                Expect order, before, and after prompts with four fast choices each round.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                <div className="text-2xl font-black text-white">30s</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                  Clock
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                <div className="text-2xl font-black text-white">3</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                  Modes
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                <div className="text-2xl font-black text-white">4</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                  Choices
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={startGame}
                className="flex-1 rounded-2xl bg-amber-400 px-5 py-4 text-base font-black text-slate-950 transition hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98]"
              >
                Start Speed Round
              </button>
              <Link
                href="/quests/books"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
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
          <h1 className="text-3xl font-bold text-white">Speed Round</h1>
          <Link
            href="/quests/books"
            className="text-sm text-gray-300 transition transform active:scale-95 hover:text-white"
          >
            Back
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-gray-900/80 px-4 py-3">
          <div className="text-sm font-medium text-gray-300">
            Time: <span className="text-white">{timeLeft}s</span>
          </div>
          <div className="text-sm font-medium text-gray-300">
            Score: <span className="text-white">{score}</span>
          </div>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-400 transition-[width] duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>

        <div className={`rounded-3xl border px-5 py-8 text-center transition ${
          feedback === "correct"
            ? "border-green-400 bg-green-600/20"
            : feedback === "wrong"
              ? "border-red-400 bg-red-600/20"
              : "border-white/10 bg-gray-900/80"
        }`}>
          <div className="text-xs uppercase tracking-[0.24em] text-gray-400">
            Question
          </div>
          <div className="mt-4 text-3xl font-bold text-white">
            {currentQuestion?.prompt || "Get ready..."}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {showPoint && (
            <div className="text-center text-lg font-bold text-green-400 animate-pulse">
              +1
            </div>
          )}
          {choices.map((book) => {
            return (
              <button
                key={book.id}
                onClick={() => handleAnswer(book)}
                disabled={selectedId !== null}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition-all duration-150 active:scale-95 ${
                  feedback === "correct"
                    ? "border-green-500 bg-green-500 text-black"
                    : feedback === "wrong"
                      ? "border-red-500 bg-red-500 text-white"
                      : selectedId !== null
                        ? "cursor-not-allowed border-white/10 bg-gray-800/70 text-gray-400"
                        : "border-white/10 bg-gray-800 text-white hover:scale-105"
                }`}
              >
                <div className="text-lg font-semibold">{book.book}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
