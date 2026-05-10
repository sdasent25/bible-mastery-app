"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { createClient } from "@/lib/supabase/client"

const allowedPlans = ["pro_plus", "family_pro_plus"]

type BookRow = {
  book: string
  book_order: number
  difficulty: "easy" | "medium" | "hard"
}

type BookSummary = {
  book: string
  book_order: number
  total: number
  easy: number
  medium: number
  hard: number
}

const BOOK_ACCENTS: Record<string, string> = {
  Genesis: "from-sky-700 via-blue-700 to-cyan-500",
  Exodus: "from-amber-700 via-orange-600 to-yellow-500",
  Matthew: "from-emerald-700 via-teal-600 to-cyan-500",
  Luke: "from-indigo-700 via-blue-700 to-sky-500",
  John: "from-violet-700 via-fuchsia-700 to-pink-500",
  Acts: "from-red-700 via-orange-600 to-amber-500",
  "1 Samuel": "from-stone-700 via-zinc-700 to-neutral-500",
  "2 Samuel": "from-slate-700 via-zinc-700 to-slate-500",
  "1 Kings": "from-yellow-700 via-amber-600 to-orange-500",
  "2 Kings": "from-lime-700 via-green-600 to-emerald-500",
  Job: "from-rose-700 via-pink-700 to-fuchsia-500",
  Mark: "from-cyan-700 via-sky-700 to-blue-500",
  Daniel: "from-purple-700 via-violet-700 to-indigo-500",
  Nehemiah: "from-orange-700 via-red-600 to-rose-500",
  Jeremiah: "from-amber-800 via-orange-700 to-red-600",
  Revelation: "from-zinc-700 via-zinc-900 to-black",
}

function formatDifficultyMix(summary: BookSummary) {
  return `E ${summary.easy} • M ${summary.medium} • H ${summary.hard}`
}

function aggregateBooks(rows: BookRow[]) {
  const map = new Map<string, BookSummary>()

  for (const row of rows) {
    const existing = map.get(row.book) ?? {
      book: row.book,
      book_order: row.book_order,
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    }

    existing.total += 1
    existing.book_order = row.book_order

    if (row.difficulty === "easy") existing.easy += 1
    if (row.difficulty === "medium") existing.medium += 1
    if (row.difficulty === "hard") existing.hard += 1

    map.set(row.book, existing)
  }

  return [...map.values()].sort((a, b) => {
    if (a.book_order !== b.book_order) {
      return a.book_order - b.book_order
    }

    return a.book.localeCompare(b.book)
  })
}

function BookCard({ summary }: { summary: BookSummary }) {
  const accentClass =
    BOOK_ACCENTS[summary.book] ?? "from-zinc-800 via-zinc-900 to-black"

  return (
    <Link
      href={`/quests/who-said-it/play?book=${encodeURIComponent(summary.book)}`}
      className="block"
    >
      <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-2xl transition hover:scale-[1.01] active:scale-[0.99]">
        <div
          className={`rounded-2xl border border-white/10 bg-gradient-to-br ${accentClass} p-5`}
        >
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            Speaker Recognition Drill
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{summary.book}</h2>
              <p className="mt-2 text-sm leading-6 text-white/85">
                {summary.total} questions available
              </p>
            </div>
            <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              Available
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
            Difficulty Mix: {formatDifficultyMix(summary)}
          </div>
          <div className="rounded-2xl bg-amber-400 px-4 py-3 text-center text-sm font-black text-slate-950">
            Start Practice
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function WhoSaidItPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState<BookSummary[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const resolvedPlan = await getUserPlan()
      setPlan(resolvedPlan)
      setLoading(false)
    }

    void run()
  }, [])

  useEffect(() => {
    if (loading || !allowedPlans.includes(plan)) {
      return
    }

    const loadBooks = async () => {
      setLoadError(null)

      const supabase = createClient()
      const { data, error } = await supabase
        .from("who_said_it_questions")
        .select("book, book_order, difficulty")
        .eq("type", "who_said_it")

      if (error) {
        setLoadError("This drill is being prepared.")
        setBooks([])
        return
      }

      const summaries = aggregateBooks((data ?? []) as BookRow[])
      setBooks(summaries)
    }

    void loadBooks()
  }, [loading, plan])

  const totals = useMemo(() => {
    const questionCount = books.reduce((sum, book) => sum + book.total, 0)
    return {
      bookCount: books.length,
      questionCount,
    }
  }, [books])

  if (loading) {
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

  if (loadError || books.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_36%),linear-gradient(180deg,#020617_0%,#09090b_45%,#000000_100%)] px-4 py-6 text-white">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
          <div className="rounded-[28px] border border-amber-400/15 bg-black/50 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-300">
              Practice Mode
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white">Who Said It?</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              This drill is being prepared.
            </p>
          </div>
          <Link
            href="/quests"
            className="rounded-2xl bg-amber-400 px-5 py-4 text-center text-base font-black text-slate-950"
          >
            Back to Quests
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_36%),linear-gradient(180deg,#020617_0%,#09090b_45%,#000000_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-[28px] border border-amber-400/15 bg-black/50 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-300">
            Practice Mode
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Who Said It?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            Train speaker recognition through key moments in Scripture.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Practice Mode • No XP yet
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Available Books
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {totals.bookCount}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Question Bank
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {totals.questionCount}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Session Size
              </div>
              <div className="mt-2 text-2xl font-bold text-white">10</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Reward
              </div>
              <div className="mt-2 text-2xl font-bold text-white">No XP Yet</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.book} summary={book} />
          ))}
        </div>
      </div>
    </div>
  )
}
