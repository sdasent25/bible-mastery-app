"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Paywall from "@/components/Paywall"
import { FLASHCARD_PAYWALL_COPY, canAccessFlashcards } from "@/lib/flashcardAccess"
import {
  type Flashcard,
  getFlashcards,
  hasDueDate,
  isFlashcardDue,
  isFlashcardLearning,
  isFlashcardMastered,
  isFlashcardNeedingReview,
} from "@/lib/flashcards"
import { getUserPlan } from "@/lib/getUserPlan"

type StatCard = {
  label: string
  value: string
  detail: string
  tone?: "gold" | "cyan" | "emerald" | "slate"
}

type ActionCard = {
  title: string
  description: string
  href: string
  cta: string
}

type PracticeMode = {
  title: string
  description: string
  href: string
  badge: string
}

const mainActions: ActionCard[] = [
  {
    title: "Add Verse",
    description: "Create a personal memory card from the Scripture passage you want to keep close.",
    href: "/flashcards/create",
    cta: "Add a Verse",
  },
  {
    title: "My Verses",
    description: "See every verse in training, review what is due, and manage your memory library.",
    href: "/flashcards/list",
    cta: "Open Library",
  },
  {
    title: "Review Due Cards",
    description: "Return to the verses that need another rep before they drift out of reach.",
    href: "/flashcards/review",
    cta: "Start Review",
  },
]

const practiceModes: PracticeMode[] = [
  {
    title: "Review",
    description: "Read, reveal, and rate your memory.",
    href: "/flashcards/review",
    badge: "Core",
  },
  {
    title: "Verse Match",
    description: "Match references with the right verse.",
    href: "/games/matching",
    badge: "Practice",
  },
  {
    title: "Hide Words",
    description: "Fill in missing words as the verse disappears.",
    href: "/games/fill-in-the-blank",
    badge: "Recall",
  },
  {
    title: "Build Verse",
    description: "Put the verse back together in order.",
    href: "/games/build-the-verse",
    badge: "Advanced",
  },
]

export default function FlashcardsPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Flashcard[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const nextPlan = await getUserPlan()
        setPlan(nextPlan)

        if (!canAccessFlashcards(nextPlan)) {
          return
        }

        const loadedCards = await getFlashcards().catch(() => [] as Flashcard[])
        setCards(loadedCards)
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  const stats = useMemo(() => {
    const dueTodayCount = cards.filter((card) => hasDueDate(card) && isFlashcardDue(card)).length
    const learningCount = cards.filter((card) => isFlashcardLearning(card)).length
    const masteredCount = cards.filter((card) => isFlashcardMastered(card)).length
    const needsReviewCount = cards.filter((card) => isFlashcardNeedingReview(card)).length
    const workoutCount = Math.max(dueTodayCount, needsReviewCount, 0)

    return {
      totalCards: cards.length,
      dueTodayCount,
      learningCount,
      masteredCount,
      needsReviewCount,
      workoutCount,
    }
  }, [cards])

  const workoutHref = stats.totalCards > 0 ? "/flashcards/review" : "/flashcards/create"
  const workoutCta = stats.totalCards > 0 ? "Start Workout" : "Add First Verse"
  const workoutTitle =
    stats.totalCards > 0 ? "Today’s Memory Workout" : "Begin Your Memory Path"
  const workoutSummary =
    stats.totalCards > 0
      ? stats.dueTodayCount > 0
        ? `${stats.dueTodayCount} verse${stats.dueTodayCount === 1 ? "" : "s"} are due for review today.`
        : stats.needsReviewCount > 0
          ? `${stats.needsReviewCount} verse${stats.needsReviewCount === 1 ? "" : "s"} need reinforcement even if nothing is formally due today.`
          : "No verses are due right now. A review round will keep recall warm and ready."
      : "Add your first verse to begin your memory path."

  const workoutDetail =
    stats.totalCards > 0
      ? stats.workoutCount > 0
        ? `${stats.workoutCount} focused rep${stats.workoutCount === 1 ? "" : "s"} ready now`
        : `${stats.totalCards} saved verse${stats.totalCards === 1 ? "" : "s"} ready for practice`
      : "You provide the verse text you want to memorize."

  const statCards: StatCard[] = [
    {
      label: "My Verses",
      value: String(stats.totalCards),
      detail: "Saved in your personal verse library.",
      tone: "gold",
    },
    {
      label: "Due Today",
      value: String(stats.dueTodayCount),
      detail: "Scheduled for review right now.",
      tone: "cyan",
    },
    {
      label: "Learning",
      value: String(stats.learningCount),
      detail: "Still in active repetition.",
      tone: "slate",
    },
    {
      label: "Mastered",
      value: String(stats.masteredCount),
      detail: "Holding on longer intervals.",
      tone: "emerald",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white md:px-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-64 rounded-[2rem] bg-white/5" />
            <div className="h-64 rounded-[2rem] bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="h-28 rounded-[1.75rem] bg-white/5" />
            <div className="h-28 rounded-[1.75rem] bg-white/5" />
            <div className="h-28 rounded-[1.75rem] bg-white/5" />
            <div className="h-28 rounded-[1.75rem] bg-white/5" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-40 rounded-[1.75rem] bg-white/5" />
            <div className="h-40 rounded-[1.75rem] bg-white/5" />
            <div className="h-40 rounded-[1.75rem] bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!canAccessFlashcards(plan)) {
    return (
      <Paywall
        title={FLASHCARD_PAYWALL_COPY.title}
        message={FLASHCARD_PAYWALL_COPY.message}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.13),transparent_18%),radial-gradient(circle_at_right,rgba(34,211,238,0.10),transparent_24%),linear-gradient(180deg,#0f172a_0%,#020617_56%,#000000_100%)] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.18fr_0.82fr] lg:p-8">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.10),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-6 lg:p-7">
              <div className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                Verse Memory
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                Memorize the verses that matter to you.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Add your own Scripture, then train through guided memory reps until it sticks.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={workoutHref}
                  className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  Start Today’s Memory Workout
                </Link>
                <Link
                  href="/flashcards/create"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Add a Verse
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Scripture Memory
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Your verses move from new to learning to mastered as you return to them over time.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-cyan-200/14 bg-cyan-200/8 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                    Personal Verse Text
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    You provide the verse text you want to memorize.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-amber-400/18 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_35%),linear-gradient(180deg,rgba(13,18,30,0.96),rgba(7,10,18,0.98))] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                    Main Action
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-white">
                    {workoutTitle}
                  </h2>
                </div>
                <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                  {stats.totalCards > 0 ? "Ready" : "New"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {workoutSummary}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Workout Focus
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {stats.totalCards > 0 ? "Review, recall, and strengthen" : "Start your first memory path"}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Ready Now
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {workoutDetail}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Memory Path
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {stats.totalCards > 0
                    ? "Return to the verses that are due, then move into matching and missing-word reps when you want more challenge."
                    : "Add a verse, review it until it feels familiar, then build it through guided repetition."}
                </p>
              </div>

              <Link
                href={workoutHref}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                {workoutCta}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[1.75rem] border p-4 md:p-5 ${
                card.tone === "gold"
                  ? "border-amber-400/20 bg-amber-300/10"
                  : card.tone === "cyan"
                    ? "border-cyan-300/18 bg-cyan-300/8"
                    : card.tone === "emerald"
                      ? "border-emerald-400/18 bg-emerald-400/8"
                      : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-extrabold text-white">
                {card.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {card.detail}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                Main Actions
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                Keep your memory path moving
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {mainActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-300/35 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">{action.title}</h3>
                  <span className="text-sm font-semibold text-amber-200 transition group-hover:text-amber-100">
                    Open
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {action.description}
                </p>
                <div className="mt-5 text-sm font-semibold text-white/82">
                  {action.cta}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                Practice Modes
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                Train the same verses in different ways
              </h2>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {practiceModes.map((mode) => (
                <Link
                  key={mode.title}
                  href={mode.href}
                  className="group rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 transition hover:border-cyan-300/28 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{mode.title}</h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                      {mode.badge}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {mode.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-200/14 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.10),transparent_26%),linear-gradient(180deg,rgba(10,15,28,0.96),rgba(7,10,18,0.98))] p-6 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
              How Verse Memory Works
            </p>
            <ol className="mt-5 space-y-4">
              <li className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">1. Add a verse.</p>
              </li>
              <li className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">2. Review it until it feels familiar.</p>
              </li>
              <li className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">3. Train with matching and missing words.</p>
              </li>
              <li className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">4. Build the verse from memory.</p>
              </li>
              <li className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">5. Review it again before you forget.</p>
              </li>
            </ol>

            <div className="mt-5 rounded-[1.25rem] border border-amber-300/16 bg-amber-300/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                Copyright Note
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                You provide the verse text you want to memorize.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
