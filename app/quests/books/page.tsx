"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { BooksQuestPageShell } from "@/components/BooksQuestShell"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"
import { isQuestPlan } from "@/lib/questAccess"
import { createClient } from "@/lib/supabase/client"

type BookRecord = {
  id?: string | number
  book_order?: number
  name?: string
}

type ModeStatus = "loading" | "xp" | "practice"

type SummaryCardProps = {
  label: string
  value: string
  supporting: string
  icon: "verse-memory" | "quests" | "upgrade" | "home"
}

type BooksModeCardProps = {
  title: string
  description: string
  href: string
  imageSrc: string
  statusLabel: string
  detail: string
  ctaLabel: string
  accent: "order" | "sort" | "speed" | "test"
}

function SummaryCard({ label, value, supporting, icon }: SummaryCardProps) {
  return (
    <article className="ba-books-hub-summary-card">
      <span className="ba-books-hub-summary-icon">
        {renderNavIcon(icon, "h-4 w-4")}
      </span>
      <div className="min-w-0">
        <div className="ba-books-hub-summary-label">{label}</div>
        <div className="ba-books-hub-summary-value">{value}</div>
        <div className="ba-books-hub-summary-supporting">{supporting}</div>
      </div>
    </article>
  )
}

function ModeCard({
  title,
  description,
  href,
  imageSrc,
  statusLabel,
  detail,
  ctaLabel,
  accent,
}: BooksModeCardProps) {
  return (
    <Link href={href} className="block">
      <article className={`ba-books-hub-mode-card is-${accent}`}>
        <div className="ba-books-hub-mode-art">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
          />
        </div>
        <div className={`ba-books-hub-mode-overlay is-${accent}`} />

        <div className="ba-books-hub-mode-shell">
          <div className="flex items-start justify-between gap-3">
            <div className="ba-books-hub-mode-topline">
              <span className={`ba-books-hub-mode-icon is-${accent}`}>
                {renderNavIcon(
                  accent === "order"
                    ? "home"
                    : accent === "sort"
                      ? "verse-memory"
                      : accent === "speed"
                        ? "quests"
                        : "upgrade",
                  "h-4 w-4",
                )}
              </span>
              <span className="ba-books-hub-mode-kicker">Books Quest</span>
            </div>

            <span className={`ba-books-hub-mode-badge is-${accent}`}>
              {statusLabel}
            </span>
          </div>

          <div className="mt-auto">
            <h2 className="ba-books-hub-mode-title">{title}</h2>
            <p className="ba-books-hub-mode-copy">{description}</p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="ba-books-hub-mode-meta">{detail}</div>
              <span className="ba-books-hub-mode-cta">{ctaLabel}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function BooksQuestHubPage() {
  const [plan, setPlan] = useState("free")
  const [planLoading, setPlanLoading] = useState(true)
  const [booksCount, setBooksCount] = useState<number | null>(null)
  const [booksError, setBooksError] = useState<string | null>(null)
  const [speedStatus, setSpeedStatus] = useState<ModeStatus>("loading")
  const [testStatus, setTestStatus] = useState<ModeStatus>("loading")

  useEffect(() => {
    const resolvePlan = async () => {
      const resolvedPlan = await getUserPlan()
      setPlan(resolvedPlan)
      setPlanLoading(false)
    }

    void resolvePlan()
  }, [])

  useEffect(() => {
    if (planLoading || !isQuestPlan(plan)) {
      return
    }

    const loadBooks = async () => {
      try {
        setBooksError(null)
        const response = await fetch("/api/quests/books", { cache: "no-store" })

        if (!response.ok) {
          throw new Error("Failed to load books")
        }

        const payload = (await response.json()) as { books?: BookRecord[] }
        setBooksCount(payload.books?.length ?? 0)
      } catch {
        setBooksError("Books list unavailable")
        setBooksCount(null)
      }
    }

    void loadBooks()
  }, [plan, planLoading])

  useEffect(() => {
    if (planLoading || !isQuestPlan(plan)) {
      return
    }

    const supabase = createClient()

    const checkStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setSpeedStatus("practice")
        setTestStatus("practice")
        return
      }

      const today = new Date().toISOString().slice(0, 10)

      const { data: speedData } = await supabase
        .from("user_daily_activity")
        .select("id")
        .eq("user_id", user.id)
        .eq("mode", "speed_round")
        .eq("activity_date", today)

      setSpeedStatus(speedData && speedData.length > 0 ? "practice" : "xp")

      const { data: testData } = await supabase
        .from("user_daily_activity")
        .select("id")
        .eq("user_id", user.id)
        .eq("mode", "test_mode")
        .eq("activity_date", today)

      setTestStatus(testData && testData.length > 0 ? "practice" : "xp")
    }

    void checkStatus()
  }, [plan, planLoading])

  const booksCoveredLabel = booksCount ?? 66
  const speedLabel = speedStatus === "xp" ? "Daily XP" : "Practice"
  const testLabel = testStatus === "xp" ? "Daily XP" : "Practice"

  const statusChips = useMemo(
    () => [
      "66 Books",
      "4 Modes",
      "Practice + Daily XP",
      "Pro+ Challenge",
    ],
    [],
  )

  if (planLoading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  if (!isQuestPlan(plan)) {
    return (
      <Paywall
        title="Quests Locked"
        message="Upgrade to Pro+ to unlock challenge modes, focused Bible structure drills, and deeper quest training paths."
      />
    )
  }

  return (
    <BooksQuestPageShell maxWidth="max-w-[95rem]">
      <div className="ba-books-hub-page">
        <div className="ba-books-hub-topbar">
          <Link href="/quests" className="ba-who-said-it-back">
            {renderNavIcon("chevron-right", "h-3.5 w-3.5 rotate-180")}
            Back to Quests
          </Link>
        </div>

        <section className="ba-books-hub-hero">
          <div className="ba-books-hub-hero-art">
            <Image
              src="/quests/cards/books-of-the-bible.png"
              alt=""
              fill
              priority
              className="object-cover object-[56%_46%]"
              sizes="(max-width: 767px) 100vw, 1200px"
            />
          </div>
          <div className="ba-books-hub-hero-overlay" />

          <div className="ba-books-hub-hero-shell">
            <div className="ba-books-hub-kicker">Books Quest</div>
            <h1 className="ba-books-hub-title">Books of the Bible</h1>
            <p className="ba-books-hub-subtitle">
              Master the order, categories, and names of all 66 books.
            </p>

            <div className="ba-books-hub-chip-row">
              {statusChips.map((chip) => (
                <span key={chip} className="ba-books-hub-chip">
                  {chip}
                </span>
              ))}
            </div>

            <Link href="/quests/books/order" className="ba-books-hub-primary">
              <span className="ba-hero-cta-medallion">
                {renderNavIcon("home", "h-[1rem] w-[1rem]")}
              </span>
              <span className="ba-hero-cta-label">Start Order Builder</span>
              <span className="ba-quest-hero-cta-arrow">
                {renderNavIcon("chevron-right", "h-4 w-4")}
              </span>
            </Link>
          </div>
        </section>

        <section className="ba-books-hub-summary-grid">
          <SummaryCard
            label="Practice Modes"
            value="2"
            supporting="Order Builder and Category Sort"
            icon="home"
          />
          <SummaryCard
            label="Daily XP Modes"
            value="2"
            supporting="Speed Round and Test Mode"
            icon="quests"
          />
          <SummaryCard
            label="Books Covered"
            value={`${booksCoveredLabel}`}
            supporting={booksError ? booksError : "Loaded from the real books table"}
            icon="verse-memory"
          />
          <SummaryCard
            label="Reward Rule"
            value="Once Daily"
            supporting="Speed/Test award once, then become practice"
            icon="upgrade"
          />
        </section>

        <section className="ba-books-hub-modes">
          <div className="ba-books-hub-section-head">
            <div className="ba-books-hub-section-kicker">
              {renderNavIcon("quests", "h-3.5 w-3.5")}
              Challenge Modes
            </div>
            <div className="ba-books-hub-section-copy">
              Practice the full map of Scripture through four focused modes.
            </div>
          </div>

          <div className="ba-books-hub-mode-grid">
            <ModeCard
              title="Order Builder"
              description="Arrange Bible books in canonical order."
              href="/quests/books/order"
              imageSrc="/quests/modes/order-builder.png"
              statusLabel="Practice"
              detail="Practice only. No XP."
              ctaLabel="Start Practice"
              accent="order"
            />
            <ModeCard
              title="Category Sort"
              description="Sort books by their biblical category."
              href="/quests/books/sort"
              imageSrc="/quests/modes/category-sort.png"
              statusLabel="Practice"
              detail="Practice only. No XP."
              ctaLabel="Start Practice"
              accent="sort"
            />
            <ModeCard
              title="Speed Round"
              description="Race the clock and test recall."
              href="/quests/books/speed"
              imageSrc="/quests/modes/speed-round.png"
              statusLabel={speedStatus === "loading" ? "Checking..." : speedLabel}
              detail={
                speedStatus === "xp"
                  ? "Daily XP available today."
                  : "Practice after today’s rewarded run."
              }
              ctaLabel={speedStatus === "xp" ? "Start Daily Run" : "Practice"}
              accent="speed"
            />
            <ModeCard
              title="Test Mode"
              description="Complete a focused 10-question challenge."
              href="/quests/books/test"
              imageSrc="/quests/modes/test-mode.png"
              statusLabel={testStatus === "loading" ? "Checking..." : testLabel}
              detail={
                testStatus === "xp"
                  ? "Daily XP available today."
                  : "Practice after today’s rewarded run."
              }
              ctaLabel={testStatus === "xp" ? "Start Daily Test" : "Practice"}
              accent="test"
            />
          </div>
        </section>
      </div>
    </BooksQuestPageShell>
  )
}
