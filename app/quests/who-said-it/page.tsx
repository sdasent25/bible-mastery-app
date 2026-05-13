"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import {
  BooksQuestHero,
  BooksQuestPageShell,
  BooksQuestPanel,
  BooksQuestStatusBadge,
} from "@/components/BooksQuestShell"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"
import { createClient } from "@/lib/supabase/client"
import { getWhoSaidItUnlockState, isWhoSaidItBookUnlocked } from "@/lib/whoSaidItUnlock"

const allowedPlans = ["pro_plus", "family_pro_plus"]

type BookRow = {
  book: string
  book_order: number
}

type BookSummary = {
  book: string
  book_order: number
  total: number
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

function aggregateBooks(rows: BookRow[]) {
  const map = new Map<string, BookSummary>()

  for (const row of rows) {
    const existing = map.get(row.book) ?? {
      book: row.book,
      book_order: row.book_order,
      total: 0,
    }

    existing.total += 1
    existing.book_order = row.book_order

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
  const unlocked = isWhoSaidItBookUnlocked(summary.book_order)

  const cardContent = (
    <article
      className={`relative overflow-hidden rounded-[1.8rem] p-5 transition duration-200 sm:p-6 ${
        unlocked
          ? "ba-card hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(0,0,0,0.34)] active:scale-[0.99]"
          : "border border-white/8 bg-[linear-gradient(180deg,rgba(41,37,36,0.92),rgba(24,24,27,0.96))] opacity-88 shadow-[0_18px_46px_rgba(0,0,0,0.26)]"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/6 text-white">
            {renderNavIcon("quests", "h-5 w-5")}
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300/76">
              Speaker Recognition
            </div>
            <h2 className="mt-1 text-2xl font-black text-white">{summary.book}</h2>
          </div>
        </div>

        <BooksQuestStatusBadge tone={unlocked ? "ready" : "locked"}>
          {unlocked ? "Ready" : "Locked"}
        </BooksQuestStatusBadge>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
        Train speaker recognition through key moments in {summary.book}.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="ba-card-soft rounded-[1.1rem] px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Session Type
          </div>
          <div className="mt-2 text-sm font-semibold text-white">Daily practice set</div>
        </div>

        <div className="ba-card-soft rounded-[1.1rem] px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Question Bank
          </div>
          <div className="mt-2 text-sm font-semibold text-white">{summary.total} prompts</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          {unlocked ? "10 questions available today." : "Reach this book in Journey to unlock."}
        </div>
        <div className={unlocked ? "ba-button-primary px-4 py-3 text-sm font-black" : "ba-button-locked px-4 py-3 text-sm font-black"}>
          {unlocked ? "Start Practice" : "Locked"}
        </div>
      </div>
    </article>
  )

  if (!unlocked) {
    return <div>{cardContent}</div>
  }

  return (
    <Link
      href={`/quests/who-said-it/play?book=${encodeURIComponent(summary.book)}`}
      className="block"
    >
      {cardContent}
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
        .select("book, book_order")
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
    const unlockState = getWhoSaidItUnlockState()
    const unlockedBooks = books.filter((book) =>
      isWhoSaidItBookUnlocked(book.book_order)
    )
    const unlockedQuestionCount = unlockedBooks.reduce(
      (sum, book) => sum + book.total,
      0
    )

    return {
      bookCount: books.length,
      unlockedBookCount: unlockedBooks.length,
      unlockedQuestionCount,
      reliableJourneySource: unlockState.reliableJourneySource,
    }
  }, [books])

  if (loading) {
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

  if (loadError || books.length === 0) {
    return (
      <BooksQuestPageShell maxWidth="max-w-3xl">
        <BooksQuestPanel>
          <div className="ba-badge-gold">Who Said It?</div>
          <h1 className="mt-4 text-3xl font-black text-white">This drill is being prepared.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            We could not load the speaker-recognition practice set right now.
          </p>
          <Link
            href="/quests"
            className="ba-button-primary mt-5 inline-flex px-5 py-4 text-base font-black"
          >
            Back to Quests
          </Link>
        </BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  return (
    <BooksQuestPageShell maxWidth="max-w-6xl">
      <BooksQuestHero
        eyebrow="Who Said It?"
        title="Train speaker recognition through key moments in Scripture."
        subtitle="Recognize voices, speakers, and pivotal moments across the Bible through focused daily practice sets."
        actions={
          <Link
            href={`/quests/who-said-it/play?book=${encodeURIComponent(books[0]?.book || "Genesis")}`}
            className="ba-button-primary w-full px-5 py-4 text-base font-black lg:w-auto"
          >
            Start Practice
          </Link>
        }
        stats={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="ba-card-soft rounded-[1.2rem] px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Available Books
              </div>
              <div className="mt-2 text-2xl font-black text-white">
                {totals.unlockedBookCount} / {totals.bookCount}
              </div>
            </div>
            <div className="ba-card-soft rounded-[1.2rem] px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Unlocked Questions
              </div>
              <div className="mt-2 text-2xl font-black text-white">
                {totals.unlockedQuestionCount}
              </div>
            </div>
            <div className="ba-card-soft rounded-[1.2rem] px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Session Size
              </div>
              <div className="mt-2 text-2xl font-black text-white">10</div>
            </div>
            <div className="ba-card-soft rounded-[1.2rem] px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Reward
              </div>
              <div className="mt-2 text-lg font-black text-white">Practice Mode</div>
            </div>
          </div>
        }
      />

      {!totals.reliableJourneySource ? (
        <BooksQuestPanel className="rounded-[1.6rem]">
          <div className="ba-badge">Unlock Notice</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Journey unlocks are using a safe temporary fallback right now. Genesis is available by default, and later books will unlock as broader Journey progress wiring is connected.
          </p>
        </BooksQuestPanel>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {books.map((book) => (
          <BookCard key={book.book} summary={book} />
        ))}
      </div>
    </BooksQuestPageShell>
  )
}
