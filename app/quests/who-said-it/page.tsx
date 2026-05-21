"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { BooksQuestPageShell, BooksQuestPanel } from "@/components/BooksQuestShell"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  getWhoSaidItUnlockState,
  isWhoSaidItBookUnlocked,
} from "@/lib/whoSaidItUnlock"

const allowedPlans = ["pro_plus", "family_pro_plus"]
const SESSION_SIZE = 10

type BookRow = {
  book: string
  book_order: number
}

type BookSummary = {
  book: string
  book_order: number
  total: number
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

function formatAvailableQuestions(total: number) {
  return `${Math.min(total, SESSION_SIZE)} questions available`
}

function WhoSaidItStatCard({
  label,
  value,
  supporting,
  icon,
}: {
  label: string
  value: string
  supporting: string
  icon: "home" | "quests" | "upgrade" | "verse-memory"
}) {
  return (
    <article className="ba-who-said-it-stat-card">
      <span className="ba-who-said-it-stat-icon">
        {renderNavIcon(icon, "h-4 w-4")}
      </span>
      <div className="min-w-0">
        <div className="ba-who-said-it-stat-label">{label}</div>
        <div className="ba-who-said-it-stat-value">{value}</div>
        <div className="ba-who-said-it-stat-supporting">{supporting}</div>
      </div>
    </article>
  )
}

function WhoSaidItBookCard({
  summary,
}: {
  summary: BookSummary
}) {
  const unlocked = isWhoSaidItBookUnlocked(summary.book_order)
  const href = `/quests/who-said-it/play?book=${encodeURIComponent(summary.book)}`

  const card = (
    <article
      className={`ba-who-said-it-book-card ${unlocked ? "is-unlocked" : "is-locked"}`}
    >
      <div className="ba-who-said-it-book-card-art">
        <Image
          src={unlocked ? "/quests/cards/who-said-it.png" : "/quests/hero/who-said-it-hero.png"}
          alt=""
          fill
          className={`object-cover ${unlocked ? "object-center" : "object-[68%_38%]"}`}
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
        />
      </div>
      <div className={`ba-who-said-it-book-card-overlay ${unlocked ? "is-unlocked" : "is-locked"}`} />

      <div className="ba-who-said-it-book-card-shell">
        <div className="flex items-start justify-between gap-3">
          <div className="ba-who-said-it-book-card-topline">
            <span className="ba-who-said-it-book-icon">
              {renderNavIcon("quests", "h-4 w-4")}
            </span>
            <span className="ba-who-said-it-book-kicker">Speaker Recognition</span>
          </div>

          <div className={`ba-who-said-it-book-badge ${unlocked ? "is-unlocked" : "is-locked"}`}>
            {unlocked ? "Available" : "Locked"}
          </div>
        </div>

        <div className="mt-auto">
          <h2 className="ba-who-said-it-book-title">{summary.book}</h2>
          <p className="ba-who-said-it-book-copy">
            {unlocked
              ? formatAvailableQuestions(summary.total)
              : "Keep growing your Journey to unlock."}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="ba-who-said-it-book-meta">
              {unlocked ? "Unlocked by default" : "Journey unlock required"}
            </div>

            {unlocked ? (
              <span className="ba-who-said-it-book-cta">Start Practice</span>
            ) : (
              <span className="ba-who-said-it-book-lock">
                {renderNavIcon("close", "h-3.5 w-3.5")}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )

  if (!unlocked) {
    return <div>{card}</div>
  }

  return (
    <Link href={href} className="block">
      {card}
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
    const genesis = books.find((book) => book.book === "Genesis")
    const genesisUnlocked = genesis
      ? isWhoSaidItBookUnlocked(genesis.book_order)
      : false
    const lockedPreview = books
      .filter((book) => !isWhoSaidItBookUnlocked(book.book_order))
      .slice(0, 5)

    return {
      bookCount: books.length,
      unlockedBookCount: unlockedBooks.length,
      unlockedQuestionCount,
      reliableJourneySource: unlockState.reliableJourneySource,
      genesis,
      genesisUnlocked,
      lockedPreview,
    }
  }, [books])

  const genesisHref =
    totals.genesis && totals.genesisUnlocked
      ? `/quests/who-said-it/play?book=${encodeURIComponent(totals.genesis.book)}`
      : null

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
    <BooksQuestPageShell maxWidth="max-w-[95rem]">
      <div className="ba-who-said-it-page">
        <div className="ba-who-said-it-topbar">
          <Link href="/quests" className="ba-who-said-it-back">
            {renderNavIcon("chevron-right", "h-3.5 w-3.5 rotate-180")}
            Back to Quests
          </Link>
        </div>

        <section className="ba-who-said-it-hero">
          <div className="ba-who-said-it-hero-art">
            <Image
              src="/quests/hero/who-said-it-hero.png"
              alt=""
              fill
              priority
              className="object-cover object-[72%_35%]"
              sizes="(max-width: 767px) 100vw, 1200px"
            />
          </div>
          <div className="ba-who-said-it-hero-overlay" />

          <div className="ba-who-said-it-hero-shell">
            <div className="ba-who-said-it-hero-copy">
              <div className="ba-who-said-it-kicker">Who Said It?</div>
              <h1 className="ba-who-said-it-title">Speaker Recognition Challenge</h1>
              <p className="ba-who-said-it-subtitle">
                Train your mind to recognize the voices of Scripture.
                <br />
                Practice daily. Master the speakers. Sharpen your discernment.
              </p>
            </div>

            <div className="ba-who-said-it-stats">
              <WhoSaidItStatCard
                label="Available Books"
                value={`${totals.unlockedBookCount} / ${totals.bookCount}`}
                supporting="Unlocked today"
                icon="home"
              />
              <WhoSaidItStatCard
                label="Unlocked Questions"
                value={`${totals.unlockedQuestionCount}`}
                supporting="Loaded from real bank"
                icon="quests"
              />
              <WhoSaidItStatCard
                label="Session Size"
                value={`${SESSION_SIZE} Questions`}
                supporting="Daily practice set"
                icon="verse-memory"
              />
              <WhoSaidItStatCard
                label="Reward"
                value="Practice Only"
                supporting="No XP Yet"
                icon="upgrade"
              />
            </div>

            {genesisHref ? (
              <Link href={genesisHref} className="ba-who-said-it-hero-cta">
                <span className="ba-hero-cta-medallion">
                  {renderNavIcon("quests", "h-[1rem] w-[1rem]")}
                </span>
                <span className="ba-hero-cta-label">Start Today&apos;s Challenge</span>
                <span className="ba-quest-hero-cta-arrow">
                  {renderNavIcon("chevron-right", "h-4 w-4")}
                </span>
              </Link>
            ) : (
              <button type="button" disabled className="ba-who-said-it-hero-cta is-disabled">
                <span className="ba-hero-cta-label">Genesis Unavailable</span>
              </button>
            )}
          </div>
        </section>

        <section className="ba-who-said-it-track">
          <div className="ba-who-said-it-section-kicker">
            {renderNavIcon("upgrade", "h-3.5 w-3.5")}
            Unlock Track
          </div>

          <div className="ba-who-said-it-track-shell">
            <div className="ba-who-said-it-track-genesis">
              <div className="ba-who-said-it-track-icon">
                {renderNavIcon("verse-memory", "h-5 w-5")}
              </div>
              <div>
                <div className="ba-who-said-it-track-title">Genesis</div>
                <div className="ba-who-said-it-track-copy">Unlocked by default</div>
                <div className="ba-who-said-it-track-copy">Start your journey here.</div>
              </div>
            </div>

            <div className="ba-who-said-it-track-line">
              {totals.lockedPreview.map((book) => (
                <div key={book.book} className="ba-who-said-it-track-node" aria-label={`${book.book} locked`}>
                  {renderNavIcon("close", "h-3 w-3")}
                </div>
              ))}
            </div>

            <p className="ba-who-said-it-track-note">
              More books unlock as your Journey progress grows.
            </p>
          </div>
        </section>

        {!totals.reliableJourneySource ? (
          <section className="ba-who-said-it-notice">
            <div className="ba-who-said-it-section-kicker">
              {renderNavIcon("home", "h-3.5 w-3.5")}
              Unlock Notice
            </div>
            <p className="ba-who-said-it-notice-copy">
              Journey unlocks are using a safe temporary fallback right now. Genesis is unlocked by default, and later books remain locked until broader Journey progress wiring is connected.
            </p>
          </section>
        ) : null}

        <section className="ba-who-said-it-books">
          <div className="ba-who-said-it-books-head">
            <div className="ba-who-said-it-section-kicker">
              {renderNavIcon("quests", "h-3.5 w-3.5")}
              Available Books
            </div>
            <div className="ba-who-said-it-books-count">
              {totals.unlockedBookCount} of {totals.bookCount} unlocked
            </div>
          </div>

          <div className="ba-who-said-it-books-grid">
            {books.map((book) => (
              <WhoSaidItBookCard key={book.book} summary={book} />
            ))}
          </div>
        </section>
      </div>
    </BooksQuestPageShell>
  )
}
