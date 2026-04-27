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

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }

  return next
}

function awardBooksQuestXp() {
  // TODO: connect real XP awarding for Books of the Bible quest
}

export default function BooksOrderBuilderPage() {
  const [books, setBooks] = useState<BookRow[]>([])
  const [roundBooks, setRoundBooks] = useState<BookRow[]>([])
  const [selectedBooks, setSelectedBooks] = useState<BookRow[]>([])
  const [wrongBookId, setWrongBookId] = useState<string | null>(null)
  const [flashState, setFlashState] = useState<"success" | "wrong" | null>(null)
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
        console.error("Failed to load books quest data", loadError)
        setError("Unable to load books right now.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const canonicalRound = useMemo(() => books.slice(0, 5), [books])

  useEffect(() => {
    if (!canonicalRound.length) {
      setRoundBooks([])
      setSelectedBooks([])
      return
    }

    setRoundBooks(shuffle(canonicalRound))
    setSelectedBooks([])
    setWrongBookId(null)
    setFlashState(null)
  }, [canonicalRound])

  useEffect(() => {
    if (selectedBooks.length === canonicalRound.length && canonicalRound.length > 0) {
      awardBooksQuestXp()
    }
  }, [selectedBooks, canonicalRound])

  const completed = selectedBooks.length === canonicalRound.length && canonicalRound.length > 0

  const progressText = `${selectedBooks.length} / ${canonicalRound.length || 5}`

  const handlePick = (book: BookRow) => {
    if (completed) return
    if (selectedBooks.some((selected) => selected.id === book.id)) return

    const expectedBook = canonicalRound[selectedBooks.length]
    if (!expectedBook) return

    if (book.id === expectedBook.id) {
      setSelectedBooks((prev) => [...prev, book])
      setFlashState("success")
      setWrongBookId(null)

      window.setTimeout(() => {
        setFlashState(null)
      }, 350)
      return
    }

    setWrongBookId(book.id)
    setFlashState("wrong")

    window.setTimeout(() => {
      setWrongBookId(null)
      setFlashState(null)
    }, 400)
  }

  const handleUndo = () => {
    setSelectedBooks((prev) => prev.slice(0, -1))
    setWrongBookId(null)
    setFlashState(null)
  }

  const handleRestart = () => {
    if (!canonicalRound.length) return
    setRoundBooks(shuffle(canonicalRound))
    setSelectedBooks([])
    setWrongBookId(null)
    setFlashState(null)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg p-6 text-white md:p-10">
        Loading books quest...
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

  if (!books.length) {
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
          <h1 className="text-3xl font-bold">Quest Complete 🎉</h1>
          <p className="mt-4 text-2xl font-semibold text-green-400">+20 XP</p>
          <p className="mt-3 text-sm text-gray-400">
            You placed all five books in the correct order.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleRestart}
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
            Round Progress {progressText}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white">Order Builder</h1>
        <p className="mt-2 text-base text-gray-300">
          Tap the books in the correct order
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          {canonicalRound.map((book, index) => {
            const reached = index < selectedBooks.length
            return (
              <div
                key={book.id}
                className={`h-2.5 flex-1 rounded-full ${
                  reached ? "bg-blue-500" : "bg-gray-800"
                }`}
              />
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-gray-900/80 p-4">
          <h2 className="text-xl font-semibold text-white">Selected Order</h2>
          <div className="mt-4 flex min-h-24 flex-wrap gap-3">
            {selectedBooks.length > 0 ? (
              selectedBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  {index + 1}. {book.book}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-700 px-4 py-3 text-sm text-gray-500">
                Start tapping books below
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleUndo}
              disabled={!selectedBooks.length}
              className="rounded-2xl bg-gray-800 px-4 py-3 text-sm font-semibold text-white transition transform active:scale-95 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Undo
            </button>
            <button
              onClick={handleRestart}
              className="rounded-2xl bg-gray-800 px-4 py-3 text-sm font-semibold text-white transition transform active:scale-95 hover:scale-105"
            >
              Restart
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white">Tap to Build</h2>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {roundBooks.map((book) => {
              const isSelected = selectedBooks.some((selected) => selected.id === book.id)
              const isWrong = wrongBookId === book.id

              return (
                <button
                  key={book.id}
                  onClick={() => handlePick(book)}
                  disabled={isSelected}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition transform active:scale-95 ${
                    isSelected
                      ? "cursor-not-allowed border-blue-500/30 bg-blue-500/10 text-blue-200 opacity-50"
                      : isWrong
                        ? "border-red-500 bg-red-600 text-white animate-shake"
                        : flashState === "success"
                          ? "border-white/10 bg-gray-800 text-white hover:scale-105"
                          : "border-white/10 bg-gray-800 text-white hover:scale-105"
                  }`}
                >
                  <div className="text-lg font-semibold">{book.book}</div>
                  <div className="mt-1 text-sm text-gray-400">
                    {book.category}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
