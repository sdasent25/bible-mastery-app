"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import {
  BooksQuestPageShell,
  BooksQuestPanel,
  BooksQuestTopBar,
} from "@/components/BooksQuestShell"

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
      <BooksQuestPageShell>
        <BooksQuestPanel>Loading category sort...</BooksQuestPanel>
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

  if (!usableBooks.length) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel>No books loaded</BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (completed) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel className="text-center">
          <div className="ba-badge-success">Challenge Complete</div>
          <h1 className="mt-4 text-3xl font-black text-white">Category Sort complete</h1>
          <p className="mt-4 text-2xl font-black text-emerald-300">+20 XP</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            You matched all 6 books to the correct sections.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={startRound}
              className="ba-button-primary px-5 py-3 text-base font-black"
            >
              Play Again
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

  return (
    <BooksQuestPageShell>
      <BooksQuestPanel>
        <BooksQuestTopBar
          backHref="/quests/books"
          meta={<span>{correctCount} / {roundBooks.length || 6} sorted</span>}
        />

        <div>
          <div className="ba-badge-gold">Books Quest</div>
          <h1 className="mt-3 text-3xl font-black text-white">Category Sort</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
            Match each book to its correct section and sharpen Bible structure recall.
          </p>
        </div>

        <div
          className={`mt-6 rounded-[1.6rem] border px-5 py-8 text-center transition ${
            feedback === "correct"
              ? "border-emerald-300/40 bg-emerald-400/12"
              : feedback === "wrong"
                ? "border-rose-400/40 bg-rose-500/14"
                : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Active Book
          </div>
          <div
            className={`mt-3 text-3xl font-black text-white ${
              feedback === "wrong" ? "animate-shake" : ""
            }`}
          >
            {currentBook?.book}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryTap(category)}
              className={`rounded-2xl border px-4 py-4 text-left transition active:scale-95 ${
                wrongCategory === category
                  ? "border-rose-400 bg-rose-500/80 text-white animate-shake"
                  : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="text-sm font-semibold">{formatCategory(category)}</div>
            </button>
          ))}
        </div>
      </BooksQuestPanel>
    </BooksQuestPageShell>
  )
}
