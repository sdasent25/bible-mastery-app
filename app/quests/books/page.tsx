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

type Accent = "gold" | "teal" | "orange" | "blue" | "violet"
type ModeIcon = "order" | "sort" | "missing" | "before" | "match" | "speed" | "test" | "section" | "full66"

type QuestCardData = {
  title: string
  description: string
  statusLabel: string
  accent: Accent
  icon: ModeIcon
  href?: string
  imageSrc?: string
  ctaLabel?: string
  supporting?: string
  disabled?: boolean
}

function ModeGlyph({ icon }: { icon: ModeIcon }) {
  if (icon === "order") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.4" />
        <rect x="14" y="4" width="6" height="6" rx="1.4" />
        <rect x="4" y="14" width="6" height="6" rx="1.4" />
        <path d="M14 17h6" />
        <path d="m17 14 3 3-3 3" />
      </svg>
    )
  }

  if (icon === "sort") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="4" y="4" width="5" height="5" rx="1.2" />
        <rect x="15" y="4" width="5" height="5" rx="1.2" />
        <rect x="4" y="15" width="5" height="5" rx="1.2" />
        <rect x="15" y="15" width="5" height="5" rx="1.2" />
      </svg>
    )
  }

  if (icon === "missing") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M7 5.5h7a3 3 0 0 1 3 3V19H7z" />
        <path d="M14 5.5V9h3" />
        <path d="M12 13.5a2.2 2.2 0 1 1 1.9-3.3" />
        <path d="M12 18h.01" />
      </svg>
    )
  }

  if (icon === "before") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="m9 8-4 4 4 4" />
        <path d="M5 12h14" />
        <path d="m15 8 4 4-4 4" />
      </svg>
    )
  }

  if (icon === "match") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M10 14 7.8 16.2a3.1 3.1 0 1 1-4.4-4.4L5.6 9.6A3.1 3.1 0 0 1 10 14Z" />
        <path d="M14 10 16.2 7.8a3.1 3.1 0 1 1 4.4 4.4l-2.2 2.2A3.1 3.1 0 0 1 14 10Z" />
        <path d="m9.5 14.5 5-5" />
      </svg>
    )
  }

  if (icon === "speed") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.6 2 6.9 12.1h4.4L9.8 22l7.3-10.2h-4.3z" />
      </svg>
    )
  }

  if (icon === "test") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3 6 5.5v5.1c0 4.2 2.6 8 6 9.4 3.4-1.4 6-5.2 6-9.4V5.5z" />
        <path d="m9.8 12 1.6 1.7 2.8-3.2" />
      </svg>
    )
  }

  if (icon === "section") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 20h16" />
        <path d="M6 20V10" />
        <path d="M10 20V10" />
        <path d="M14 20V10" />
        <path d="M18 20V10" />
        <path d="m3.5 10 8.5-5 8.5 5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m5.5 18 1.5-8 5 3.8 5-3.8 1.5 8Z" />
      <path d="M7 10 9.5 6.5 12 10l2.5-3.5L17 10" />
      <path d="M5 18h14" />
    </svg>
  )
}

function BooksQuestCard({
  title,
  description,
  statusLabel,
  accent,
  icon,
  href,
  imageSrc,
  ctaLabel,
  supporting,
  disabled = false,
}: QuestCardData) {
  const card = (
    <article
      className={`ba-books-gym-card ba-books-gym-card--${accent} ${disabled ? "is-disabled" : "is-live"} ${imageSrc ? "has-image" : "is-fallback"}`}
      aria-disabled={disabled}
    >
      {imageSrc ? (
        <>
          <div className="ba-books-gym-card-art">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 767px) 80vw, (max-width: 1279px) 50vw, 33vw"
            />
          </div>
          <div className="ba-books-gym-card-overlay" />
        </>
      ) : (
        <div className="ba-books-gym-card-fallback" />
      )}

      <div className="ba-books-gym-card-shell">
        <div className="ba-books-gym-card-top">
          <span className={`ba-books-gym-card-icon ba-books-gym-card-icon--${accent}`}>
            <ModeGlyph icon={icon} />
          </span>
          <span className={`ba-books-gym-card-pill ba-books-gym-card-pill--${accent} ${disabled ? "is-disabled" : ""}`}>
            {statusLabel}
          </span>
        </div>

        <div className="ba-books-gym-card-body">
          <h3 className="ba-books-gym-card-title">{title}</h3>
          <p className="ba-books-gym-card-copy">{description}</p>
        </div>

        {ctaLabel || supporting ? (
          <div className="ba-books-gym-card-footer">
            {supporting ? <span className="ba-books-gym-card-supporting">{supporting}</span> : <span />}
            {ctaLabel ? <span className="ba-books-gym-card-cta">{ctaLabel}</span> : null}
          </div>
        ) : null}
      </div>
    </article>
  )

  if (disabled || !href) {
    return <div>{card}</div>
  }

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  )
}

function BooksQuestSection({
  title,
  subtitle,
  cards,
  layout,
}: {
  title: string
  subtitle: string
  cards: QuestCardData[]
  layout: "practice" | "daily" | "mastery"
}) {
  return (
    <section className="ba-books-gym-section">
      <div className="ba-books-gym-section-head">
        <h2 className="ba-books-gym-section-title">{title}</h2>
        <p className="ba-books-gym-section-copy">{subtitle}</p>
      </div>

      <div className={`ba-books-gym-grid ba-books-gym-grid--${layout}`}>
        {cards.map((card) => (
          <BooksQuestCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  )
}

export default function BooksQuestHubPage() {
  const [plan, setPlan] = useState("free")
  const [planLoading, setPlanLoading] = useState(true)
  const [booksCount, setBooksCount] = useState<number | null>(null)
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
        const response = await fetch("/api/quests/books", { cache: "no-store" })

        if (!response.ok) {
          throw new Error("Failed to load books")
        }

        const payload = (await response.json()) as { books?: BookRecord[] }
        setBooksCount(payload.books?.length ?? 0)
      } catch {
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

  const practiceCards = useMemo<QuestCardData[]>(
    () => [
      {
        title: "Order Builder",
        description: "Arrange books in canonical order.",
        href: "/quests/books/order",
        imageSrc: "/quests/modes/order-builder.png",
        statusLabel: "Practice",
        accent: "gold",
        icon: "order",
        ctaLabel: "Play Now",
      },
      {
        title: "Category Sort",
        description: "Sort books into their correct categories.",
        href: "/quests/books/sort",
        imageSrc: "/quests/modes/category-sort.png",
        statusLabel: "Practice",
        accent: "teal",
        icon: "sort",
        ctaLabel: "Play Now",
      },
      {
        title: "Missing Book",
        description: "Fill in the missing book in the correct sequence.",
        statusLabel: "Coming Soon",
        accent: "violet",
        icon: "missing",
        disabled: true,
      },
      {
        title: "Before / After",
        description: "Recall which book comes before or after.",
        statusLabel: "Coming Soon",
        accent: "gold",
        icon: "before",
        disabled: true,
      },
      {
        title: "Book Match",
        description: "Match books to their themes and categories.",
        statusLabel: "Coming Soon",
        accent: "teal",
        icon: "match",
        disabled: true,
      },
    ],
    [],
  )

  const dailyCards = useMemo<QuestCardData[]>(
    () => [
      {
        title: "Speed Round",
        description: "Race the clock through fast recall prompts.",
        href: "/quests/books/speed",
        imageSrc: "/quests/modes/speed-round.png",
        statusLabel: speedStatus === "loading" ? "Checking..." : speedStatus === "xp" ? "Daily XP" : "Practice",
        accent: "orange",
        icon: "speed",
        supporting:
          speedStatus === "loading"
            ? "Checking today’s reward state."
            : speedStatus === "xp"
              ? "Daily reward is available now."
              : "Reward spent today. Practice remains open.",
        ctaLabel: speedStatus === "xp" ? "Play Now" : "Practice",
      },
      {
        title: "Test Mode",
        description: "Enter a focused 10-question challenge.",
        href: "/quests/books/test",
        imageSrc: "/quests/modes/test-mode.png",
        statusLabel: testStatus === "loading" ? "Checking..." : testStatus === "xp" ? "Daily XP" : "Practice",
        accent: "blue",
        icon: "test",
        supporting:
          testStatus === "loading"
            ? "Checking today’s reward state."
            : testStatus === "xp"
              ? "Daily reward is available now."
              : "Reward spent today. Practice remains open.",
        ctaLabel: testStatus === "xp" ? "Play Now" : "Practice",
      },
    ],
    [speedStatus, testStatus],
  )

  const masteryCards = useMemo<QuestCardData[]>(
    () => [
      {
        title: "Section Mastery",
        description: "Master one Bible section at a time.",
        statusLabel: "Coming Soon",
        accent: "violet",
        icon: "section",
        disabled: true,
      },
      {
        title: "Full 66 Challenge",
        description: "Take on the full 66-book challenge.",
        statusLabel: "Coming Soon",
        accent: "violet",
        icon: "full66",
        disabled: true,
      },
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
      <div className="ba-books-gym-page">
        <div className="ba-books-gym-topbar">
          <div className="ba-books-gym-breadcrumb">
            <Link href="/quests">Quests</Link>
            <span className="ba-books-gym-breadcrumb-sep">›</span>
            <span>Books of the Bible</span>
          </div>

          <Link href="/quests" className="ba-who-said-it-back ba-books-gym-mobile-back">
            {renderNavIcon("chevron-right", "h-3.5 w-3.5 rotate-180")}
            Back to Quests
          </Link>

          <div className="ba-books-gym-access">
            <div className="ba-books-gym-access-icon">{renderNavIcon("upgrade", "h-4 w-4")}</div>
            <div>
              <div className="ba-books-gym-access-label">Quest Access</div>
              <div className="ba-books-gym-access-value">Pro+ Active</div>
            </div>
          </div>
        </div>

        <section className="ba-books-gym-hero">
          <div className="ba-books-gym-hero-art">
            <Image
              src="/quests/cards/books-of-the-bible.png"
              alt=""
              fill
              priority
              className="object-cover object-[60%_44%]"
              sizes="(max-width: 767px) 100vw, 1200px"
            />
          </div>
          <div className="ba-books-gym-hero-overlay" />

          <div className="ba-books-gym-hero-shell">
            <div className="ba-books-gym-hero-copy">
              <h1 className="ba-books-gym-hero-title">Books of the Bible</h1>
              <p className="ba-books-gym-hero-subtitle">
                Master the order, categories, and structure of all 66 books.
              </p>
              <p className="ba-books-gym-hero-supporting">
                Build strong biblical knowledge that lasts.
              </p>
            </div>
          </div>
        </section>

        <BooksQuestSection
          title="Practice Drills"
          subtitle="Build your knowledge. Practice any time."
          cards={practiceCards}
          layout="practice"
        />

        <BooksQuestSection
          title="Daily XP Challenges"
          subtitle="Earn Daily XP and grow in wisdom."
          cards={dailyCards}
          layout="daily"
        />

        <BooksQuestSection
          title="Mastery Challenges"
          subtitle="Take on advanced challenges and prove your mastery."
          cards={masteryCards}
          layout="mastery"
        />

        <section className="ba-books-gym-strip">
          <div className="ba-books-gym-strip-copy">
            <h2>Keep Learning. Keep Growing.</h2>
            <p>The more you practice, the stronger your foundation becomes.</p>
          </div>

          <div className="ba-books-gym-strip-stats">
            <div className="ba-books-gym-strip-stat">
              <span className="ba-books-gym-strip-stat-icon">{renderNavIcon("verse-memory", "h-4 w-4")}</span>
              <div>
                <strong>{booksCoveredLabel}</strong>
                <span>Books to Master</span>
              </div>
            </div>

            <div className="ba-books-gym-strip-stat">
              <span className="ba-books-gym-strip-stat-icon">{renderNavIcon("quests", "h-4 w-4")}</span>
              <div>
                <strong>Practice Anytime</strong>
                <span>Order and Sort stay open</span>
              </div>
            </div>

            <div className="ba-books-gym-strip-stat">
              <span className="ba-books-gym-strip-stat-icon">{renderNavIcon("leaderboard", "h-4 w-4")}</span>
              <div>
                <strong>Daily XP in Speed/Test</strong>
                <span>Real reward state stays intact</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BooksQuestPageShell>
  )
}
