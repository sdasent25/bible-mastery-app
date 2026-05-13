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
      <BooksQuestPageShell>
        <BooksQuestPanel>Loading books quest...</BooksQuestPanel>
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

  if (!books.length) {
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
          <div className="ba-badge-success">Quest Complete</div>
          <h1 className="mt-4 text-3xl font-black text-white">Order Builder complete</h1>
          <p className="mt-4 text-2xl font-black text-emerald-300">+20 XP</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            You placed all five books in the correct order.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleRestart}
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
          meta={<span>Round Progress {progressText}</span>}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="ba-badge-gold">Books Quest</div>
            <h1 className="mt-3 text-3xl font-black text-white">Order Builder</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
              Place the books in the correct order and build canonical recall.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {canonicalRound.map((book, index) => {
            const reached = index < selectedBooks.length
            return (
              <div
                key={book.id}
                className={`h-2.5 flex-1 rounded-full ${
                  reached
                    ? "bg-gradient-to-r from-cyan-300 via-amber-300 to-emerald-300"
                    : "bg-white/10"
                }`}
              />
            )
          })}
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-xl font-black text-white">Selected Order</h2>
          <div className="mt-4 flex min-h-24 flex-wrap gap-3">
            {selectedBooks.length > 0 ? (
              selectedBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="rounded-2xl border border-amber-200/14 bg-amber-200/10 px-4 py-3 text-sm font-semibold text-amber-50 shadow-[0_10px_26px_rgba(245,158,11,0.12)]"
                >
                  {index + 1}. {book.book}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/12 px-4 py-3 text-sm text-slate-400">
                Start tapping books below
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleUndo}
              disabled={!selectedBooks.length}
              className="ba-button-secondary px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Undo
            </button>
            <button
              onClick={handleRestart}
              className="ba-button-secondary px-4 py-3 text-sm font-semibold"
            >
              Restart
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-black text-white">Tap to Build</h2>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {roundBooks.map((book) => {
              const isSelected = selectedBooks.some((selected) => selected.id === book.id)
              const isWrong = wrongBookId === book.id

              return (
                <button
                  key={book.id}
                  onClick={() => handlePick(book)}
                  disabled={isSelected}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition active:scale-95 ${
                    isSelected
                      ? "cursor-not-allowed border-amber-300/24 bg-amber-300/10 text-amber-100 opacity-55"
                      : isWrong
                        ? "border-rose-400 bg-rose-500/80 text-white animate-shake"
                        : flashState === "success"
                          ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.06]"
                          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="text-lg font-semibold">{book.book}</div>
                  <div className="mt-1 text-sm text-slate-400">{book.category}</div>
                </button>
              )
            })}
          </div>
        </div>
      </BooksQuestPanel>
    </BooksQuestPageShell>
  )
}
