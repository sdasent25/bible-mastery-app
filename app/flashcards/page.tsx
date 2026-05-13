"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Paywall from "@/components/Paywall"
import { FLASHCARD_PAYWALL_COPY, canAccessFlashcards } from "@/lib/flashcardAccess"
import {
  type Flashcard,
  getFlashcards,
  getMemoryStage,
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

type MemoryRailStep = {
  title: string
  detail: string
  tone: "gold" | "cyan" | "emerald"
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
    description: "Open your verse library, check stages, and return to the passages you are training.",
    href: "/flashcards/list",
    cta: "Open Library",
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

const memoryRailSteps: MemoryRailStep[] = [
  { title: "Read", detail: "See it clearly", tone: "gold" },
  { title: "Match", detail: "Connect verse + reference", tone: "cyan" },
  { title: "Hide Words", detail: "Train exact wording", tone: "cyan" },
  { title: "Build", detail: "Reconstruct the verse", tone: "gold" },
  { title: "Recall", detail: "Hold it without prompts", tone: "cyan" },
  { title: "Mastered", detail: "Return for quick refresh", tone: "emerald" },
]

function getStepClasses(tone: MemoryRailStep["tone"], active: boolean, complete: boolean) {
  if (tone === "emerald") {
    return active || complete
      ? "border-emerald-300/22 bg-emerald-400/12 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
      : "border-white/10 bg-white/[0.03] text-white/60"
  }

  if (tone === "gold") {
    return active || complete
      ? "border-amber-300/24 bg-amber-300/12 text-amber-100 shadow-[0_0_24px_rgba(250,204,21,0.12)]"
      : "border-white/10 bg-white/[0.03] text-white/60"
  }

  return active || complete
    ? "border-cyan-300/22 bg-cyan-300/12 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
    : "border-white/10 bg-white/[0.03] text-white/60"
}

export default function FlashcardsPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

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

  useEffect(() => {
    if (typeof window === "undefined") return

    if (window.matchMedia("(min-width: 1280px)").matches) {
      setPracticeOpen(true)
      setPreviewOpen(true)
    }
  }, [])

  const stats = useMemo(() => {
    const dueTodayCount = cards.filter((card) => hasDueDate(card) && isFlashcardDue(card)).length
    const learningCount = cards.filter((card) => isFlashcardLearning(card)).length
    const masteredCount = cards.filter((card) => isFlashcardMastered(card)).length
    const needsReviewCount = cards.filter((card) => isFlashcardNeedingReview(card)).length
    const workoutCount = Math.max(dueTodayCount, needsReviewCount, 0)
    const readyCount = dueTodayCount + Math.max(needsReviewCount - dueTodayCount, 0)

    return {
      totalCards: cards.length,
      dueTodayCount,
      learningCount,
      masteredCount,
      needsReviewCount,
      workoutCount,
      readyCount,
    }
  }, [cards])

  const workoutHref = stats.totalCards > 0 ? "/flashcards/review" : "/flashcards/create"
  const workoutCta = stats.totalCards > 0 ? "Start Workout" : "Add Your First Verse"
  const estimatedMinutes =
    stats.totalCards > 0 ? Math.max(3, Math.min(12, (stats.workoutCount || 1) * 2)) : null
  const workoutSummary =
    stats.totalCards > 0
      ? stats.readyCount > 0
        ? `${stats.readyCount} verse${stats.readyCount === 1 ? "" : "s"} are ready for today’s memory reps.`
        : "No verses are due right now. A short review round will keep recall warm."
      : "Your memory path starts with one verse."
  const workoutSupportingCopy =
    stats.totalCards > 0
      ? "Review · Hide Words · Verse Match"
      : "Add a verse you want to carry with you."

  const statCards: StatCard[] = [
    {
      label: "Verses in Training",
      value: String(stats.totalCards),
      detail: "Saved in your personal verse library.",
      tone: "gold",
    },
    {
      label: "Ready for Review",
      value: String(stats.dueTodayCount),
      detail: "Scheduled for memory reps right now.",
      tone: "cyan",
    },
    {
      label: "In Progress",
      value: String(stats.learningCount),
      detail: "Still in active repetition.",
      tone: "slate",
    },
    {
      label: "Locked In",
      value: String(stats.masteredCount),
      detail: "Holding on longer intervals.",
      tone: "emerald",
    },
  ]

  const versePreview = cards.slice(0, 3).map((card) => ({
    id: card.id,
    reference: card.reference,
    stage: getMemoryStage(card),
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white md:px-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
            <div className="h-64 rounded-[2rem] bg-white/5" />
            <div className="h-64 rounded-[2rem] bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="h-24 rounded-[1.75rem] bg-white/5" />
            <div className="h-24 rounded-[1.75rem] bg-white/5" />
            <div className="h-24 rounded-[1.75rem] bg-white/5" />
            <div className="h-24 rounded-[1.75rem] bg-white/5" />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
            <div className="h-64 rounded-[2rem] bg-white/5" />
            <div className="h-64 rounded-[2rem] bg-white/5" />
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_18%),radial-gradient(circle_at_right,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,#0f172a_0%,#020617_58%,#000000_100%)] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur lg:p-7">
            <div className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Verse Memory
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Memorize the verses that matter to you.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Add your own Scripture, then train through guided memory reps until it sticks.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Scripture Memory
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Return to the same verse through quiet, focused reps until recall becomes stronger and steadier.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-cyan-200/14 bg-cyan-200/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  Personal Verse Text
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  You provide the Scripture text you want to memorize.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-amber-400/18 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_35%),linear-gradient(180deg,rgba(13,18,30,0.96),rgba(7,10,18,0.98))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                  Today&apos;s Workout
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                  Today&apos;s Memory Workout
                </h2>
              </div>
              <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                {stats.totalCards > 0 ? "Ready" : "New"}
              </span>
            </div>

            <p className="mt-4 text-base font-semibold text-white">
              {workoutSummary}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {workoutSupportingCopy}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Ready Now
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  {stats.totalCards > 0 ? `${stats.readyCount} verse${stats.readyCount === 1 ? "" : "s"}` : "Add your first verse"}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Session Estimate
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  {estimatedMinutes ? `~${estimatedMinutes} min` : "Short first session"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Workout Mix
              </p>
              <p className="mt-2 text-sm font-semibold text-cyan-100">
                {stats.totalCards > 0 ? "Review · Hide Words · Verse Match" : "Review · Build · Recall"}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={workoutHref}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#facc15,#fde68a)] px-5 py-3.5 text-base font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_34px_rgba(250,204,21,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_20px_40px_rgba(250,204,21,0.24)] active:scale-[0.99]"
              >
                <span className="relative">
                  {stats.totalCards > 0 ? "Start Today’s Memory Workout" : "Add Your First Verse"}
                  <span className="pointer-events-none absolute inset-x-0 -top-1 h-px bg-white/40 blur-sm" />
                </span>
              </Link>
              <Link
                href="/flashcards/create"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-base font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 active:scale-[0.99]"
              >
                Add a Verse
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[1.75rem] border p-4 transition duration-300 hover:-translate-y-0.5 md:p-5 ${
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

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {mainActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-300/35 hover:bg-white/[0.07] active:scale-[0.99]"
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
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                  Your Memory Path
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                  Move each verse from familiar to memorized.
                </h2>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-2">
              <div className="flex min-w-max items-stretch gap-3">
                {memoryRailSteps.map((step, index) => {
                  const isCurrent = index === 2
                  const isComplete = index < 2
                  const isFuture = index > 2

                  return (
                    <div key={step.title} className="flex items-center gap-3">
                      <div
                        className={`w-[10.5rem] rounded-[1.35rem] border p-4 transition duration-300 ${getStepClasses(
                          step.tone,
                          isCurrent,
                          isComplete
                        )} ${isCurrent ? "translate-y-[-2px]" : ""} ${isFuture ? "opacity-70" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{step.title}</p>
                            <p className="mt-1 text-xs text-current/80">{step.detail}</p>
                          </div>
                        </div>
                      </div>
                      {index < memoryRailSteps.length - 1 ? (
                        <div className="hidden h-px w-8 shrink-0 bg-white/12 md:block" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-200/14 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.10),transparent_26%),linear-gradient(180deg,rgba(10,15,28,0.96),rgba(7,10,18,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] md:p-7">
            <button
              type="button"
              onClick={() => setPreviewOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
                  Verses in Training
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                  See what each verse needs next.
                </h2>
              </div>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg transition-transform duration-300 ${
                  previewOpen ? "rotate-180" : ""
                }`}
              >
                ⌄
              </span>
            </button>

            <div className={`grid transition-all duration-300 ${previewOpen ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-70 mt-4"}`}>
              <div className="overflow-hidden">
                {versePreview.length > 0 ? (
                  <div className="space-y-3">
                    {versePreview.map((card) => (
                      <div
                        key={card.id}
                        className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-white">{card.reference}</p>
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                            {card.stage.stageLabel}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-cyan-100">
                          Next: {card.stage.nextDrill}
                        </p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(34,211,238,0.95),rgba(16,185,129,0.95))]"
                            style={{ width: `${card.stage.progressValue}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-amber-300/16 bg-amber-300/10 p-4">
                    <p className="text-base font-semibold text-white">
                      Your memory path starts with one verse.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      You provide the Scripture text you want to memorize.
                    </p>
                    <Link
                      href="/flashcards/create"
                      className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Add Your First Verse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-7">
            <button
              type="button"
              onClick={() => setPracticeOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                  Optional Practice
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                  Train the same verses in different ways.
                </h2>
              </div>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg transition-transform duration-300 ${
                  practiceOpen ? "rotate-180" : ""
                }`}
              >
                ⌄
              </span>
            </button>

            <div className={`grid transition-all duration-300 ${practiceOpen ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-70 mt-4"}`}>
              <div className="overflow-hidden">
                <div className="grid gap-4 md:grid-cols-2">
                  {practiceModes.map((mode) => (
                    <Link
                      key={mode.title}
                      href={mode.href}
                      className="group rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/28 hover:bg-white/[0.07] active:scale-[0.99]"
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
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-7">
            <button
              type="button"
              onClick={() => setHowItWorksOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
                  How Verse Memory Works
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                  A calm, repeatable path to recall.
                </h2>
              </div>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg transition-transform duration-300 ${
                  howItWorksOpen ? "rotate-180" : ""
                }`}
              >
                ⌄
              </span>
            </button>

            <div className={`grid transition-all duration-300 ${howItWorksOpen ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-70 mt-4"}`}>
              <div className="overflow-hidden">
                <ol className="space-y-4">
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
                    You provide the Scripture text you want to memorize.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
