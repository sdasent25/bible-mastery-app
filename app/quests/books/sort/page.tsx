"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type BookRow = {
  id: string
  book: string
  book_order: number
  testament: string | null
  category: string | null
  theme: string | null
}

const categories = [
  "pentateuch",
  "historical",
  "wisdom",
  "major_prophets",
  "minor_prophets",
  "gospels",
  "acts",
  "pauline_epistles",
  "general_epistles",
  "apocalyptic",
] as const

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }

  return next
}

function formatCategory(category: string) {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function awardBooksSortXp() {
  // TODO: connect real XP awarding for Category Sort
}

export default function BooksCategorySortPage() {
  const [books, setBooks] = useState<BookRow[]>([])
  const [roundBooks, setRoundBooks] = useState<BookRow[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [wrongCategory, setWrongCategory] = useState<string | null>(null)
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
        console.error("Failed to load books sort data", loadError)
        setError("Unable to load books right now.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const usableBooks = useMemo(
    () => books.filter((book) => book.category && categories.includes(book.category as typeof categories[number])),
    [books]
  )

  const startRound = () => {
    const nextRound = shuffle(usableBooks).slice(0, 6)
    setRoundBooks(nextRound)
    setCurrentIndex(0)
    setCorrectCount(0)
    setCompleted(false)
    setFeedback(null)
    setWrongCategory(null)
  }

  useEffect(() => {
    if (usableBooks.length >= 6) {
      startRound()
    }
  }, [usableBooks])

  const currentBook = roundBooks[currentIndex]

  const handleCategoryTap = (category: string) => {
    if (!currentBook || completed) return

    if (currentBook.category === category) {
      setFeedback("correct")
      setCorrectCount((prev) => prev + 1)

      window.setTimeout(() => {
        const nextIndex = currentIndex + 1
        if (nextIndex >= roundBooks.length) {
          setCompleted(true)
          awardBooksSortXp()
        } else {
          setCurrentIndex(nextIndex)
        }
        setFeedback(null)
      }, 300)

      return
    }

    setFeedback("wrong")
    setWrongCategory(category)

    window.setTimeout(() => {
      setFeedback(null)
      setWrongCategory(null)
    }, 400)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        Loading category sort...
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

  if (!usableBooks.length) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        No books loaded
      </div>
    )
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        <div className="rounded-3xl border border-white/10 bg-gray-900 p-8 text-center shadow-2xl">
          <h1 className="text-3xl font-bold">Complete!</h1>
          <p className="mt-4 text-2xl font-semibold text-green-400">+20 XP</p>
          <p className="mt-3 text-sm text-gray-400">
            You matched all 6 books to the correct sections.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={startRound}
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

  return (
    <div className="mx-auto max-w-lg p-6 text-white md:p-10">
      <div className="rounded-3xl border border-white/10 bg-gray-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/quests/books"
            className="text-sm text-gray-300 transition transform active:scale-95 hover:text-white"
          >
            ← Back to Books
          </Link>
          <div className="text-sm font-medium text-gray-400">
            {correctCount} / {roundBooks.length || 6} sorted
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white">Category Sort</h1>
        <p className="mt-2 text-base text-gray-300">
          Match each book to its correct section
        </p>

        <div className={`mt-6 rounded-3xl border px-5 py-8 text-center transition ${
          feedback === "correct"
            ? "border-green-400 bg-green-600/20"
            : feedback === "wrong"
              ? "border-red-400 bg-red-600/20"
              : "border-white/10 bg-gray-900/80"
        }`}>
          <div className="text-xs uppercase tracking-[0.24em] text-gray-400">
            Active Book
          </div>
          <div className={`mt-3 text-3xl font-bold text-white ${
            feedback === "wrong" ? "animate-shake" : ""
          }`}>
            {currentBook?.book}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryTap(category)}
              className={`rounded-2xl border px-4 py-4 text-left transition transform active:scale-95 ${
                wrongCategory === category
                  ? "border-red-500 bg-red-600 text-white animate-shake"
                  : "border-white/10 bg-gray-800 text-white hover:scale-105"
              }`}
            >
              <div className="text-sm font-semibold">
                {formatCategory(category)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
