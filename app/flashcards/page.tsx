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
  shortLabel: string
  value: string
  detail: string
  icon: string
  tone?: "gold" | "cyan" | "emerald" | "slate"
}

type ActionCard = {
  title: string
  description: string
  href: string
  cta: string
  icon: string
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

type Tone = "gold" | "cyan" | "emerald" | "slate"

const mainActions: ActionCard[] = [
  {
    title: "Add Verse",
    description: "Create a personal memory card from the Scripture passage you want to keep close.",
    href: "/flashcards/create",
    cta: "Add a Verse",
    icon: "+",
  },
  {
    title: "My Verses",
    description: "Open your verse library, check stages, and return to the passages you are training.",
    href: "/flashcards/list",
    cta: "Open Library",
    icon: "L",
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

function getToneClasses(tone: Tone) {
  if (tone === "gold") return "border-amber-400/20 bg-amber-300/10"
  if (tone === "cyan") return "border-cyan-300/18 bg-cyan-300/8"
  if (tone === "emerald") return "border-emerald-400/18 bg-emerald-400/8"
  return "border-white/10 bg-white/[0.04]"
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
  const estimatedMinutes =
    stats.totalCards > 0 ? Math.max(3, Math.min(12, (stats.workoutCount || 1) * 2)) : null
  const workoutSummary =
    stats.totalCards > 0
      ? stats.readyCount > 0
        ? `${stats.readyCount} verse${stats.readyCount === 1 ? "" : "s"} are ready for today’s memory reps.`
        : "No verses are due right now. A short review round will keep recall warm."
      : "Your memory path starts with one verse."
  const workoutHeadline =
    stats.totalCards > 0
      ? `${stats.readyCount} verse${stats.readyCount === 1 ? "" : "s"} ready for today`
      : "Start with your first verse"
  const workoutSupportingCopy =
    stats.totalCards > 0
      ? "Review · Hide Words · Verse Match"
      : "Add a verse you want to carry with you."

  const statCards: StatCard[] = [
    {
      label: "Verses in Training",
      shortLabel: "Verses",
      value: String(stats.totalCards),
      detail: "Saved in your personal verse library.",
      icon: "V",
      tone: "gold",
    },
    {
      label: "Ready for Review",
      shortLabel: "Ready",
      value: String(stats.dueTodayCount),
      detail: "Scheduled for memory reps right now.",
      icon: "R",
      tone: "cyan",
    },
    {
      label: "In Progress",
      shortLabel: "Progress",
      value: String(stats.learningCount),
      detail: "Still in active repetition.",
      icon: "P",
      tone: "slate",
    },
    {
      label: "Locked In",
      shortLabel: "Locked In",
      value: String(stats.masteredCount),
      detail: "Holding on longer intervals.",
      icon: "L",
      tone: "emerald",
    },
  ]

  const workoutChips = [
    {
      label: "Estimate",
      value: estimatedMinutes ? `~${estimatedMinutes} min` : "Short start",
      tone: "gold" as const,
    },
    {
      label: "Reps",
      value: stats.totalCards > 0 ? `${stats.readyCount} ready` : "1 verse",
      tone: "cyan" as const,
    },
    {
      label: "Mix",
      value: stats.totalCards > 0 ? "Review + Recall" : "Build + Recall",
      tone: "emerald" as const,
    },
  ]

  const versePreview = cards.slice(0, 3).map((card) => ({
    id: card.id,
    reference: card.reference,
    stage: getMemoryStage(card),
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-0 md:py-4">
        <div className="w-full max-w-[96rem] animate-pulse space-y-5 md:mr-auto md:ml-0 xl:mx-auto">
          <div className="grid items-start gap-4 xl:grid-cols-[1.12fr_0.88fr] xl:gap-6">
            <div className="h-48 rounded-[1.6rem] bg-white/5 sm:h-56 sm:rounded-[2rem]" />
            <div className="h-64 rounded-[1.6rem] bg-white/5 sm:rounded-[2rem]" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            <div className="h-20 w-32 rounded-[1.1rem] bg-white/5" />
            <div className="h-20 w-32 rounded-[1.1rem] bg-white/5" />
            <div className="h-20 w-32 rounded-[1.1rem] bg-white/5" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-28 rounded-[1.35rem] bg-white/5" />
            <div className="h-28 rounded-[1.35rem] bg-white/5" />
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_18%),radial-gradient(circle_at_right,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,#0f172a_0%,#020617_58%,#000000_100%)] px-4 py-4 text-white md:px-0 md:py-4">
      <div className="w-full max-w-[96rem] md:mr-auto md:ml-0 xl:mx-auto">
        <section className="grid items-start gap-4 xl:grid-cols-[1.12fr_0.88fr] xl:gap-6">
          <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur sm:rounded-[2rem] sm:p-6 lg:p-7">
            <div className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Verse Memory
            </div>
            <h1 className="mt-4 max-w-3xl text-[1.9rem] font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Memorize the verses that matter to you.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7 md:text-lg">
              Add your own Scripture, then train through guided memory reps.
            </p>

            <div className="mt-6 hidden gap-4 sm:grid-cols-2 xl:grid">
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

          <div className="overflow-hidden rounded-[1.6rem] border border-amber-400/18 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_35%),linear-gradient(180deg,rgba(13,18,30,0.96),rgba(7,10,18,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur sm:rounded-[2rem] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                  Today&apos;s Memory Workout
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                  {workoutHeadline}
                </h2>
              </div>
              <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                {stats.totalCards > 0 ? "Ready" : "New"}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-200 sm:mt-4 sm:text-base sm:font-semibold sm:text-white">
              {workoutSummary}
            </p>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {workoutChips.map((chip) => (
                <div
                  key={chip.label}
                  className={`min-w-[7.2rem] rounded-[1rem] border px-3 py-2.5 ${
                    chip.tone === "gold"
                      ? "border-amber-300/20 bg-amber-300/10"
                      : chip.tone === "emerald"
                        ? "border-emerald-300/18 bg-emerald-300/10"
                        : "border-cyan-300/18 bg-cyan-300/10"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    {chip.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {chip.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={workoutHref}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#facc15,#fde68a)] px-5 py-3.5 text-base font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_34px_rgba(250,204,21,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_20px_40px_rgba(250,204,21,0.24)] active:scale-[0.99]"
              >
                <span className="relative">
                  {stats.totalCards > 0 ? "Start Today’s Workout" : "Add Your First Verse"}
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

            <p className="mt-4 text-sm leading-6 text-slate-300">
              {workoutSupportingCopy}
            </p>
          </div>
        </section>

        <section className="mt-4 md:hidden">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/52">
              At a Glance
            </p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`min-w-[7.4rem] rounded-[1.15rem] border px-3 py-3 ${getToneClasses(card.tone ?? "slate")}`}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[11px] font-bold text-white">
                    {card.icon}
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
                    {card.shortLabel}
                  </p>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-white">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 hidden grid-cols-2 gap-4 md:grid md:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[1.75rem] border p-4 transition duration-300 hover:-translate-y-0.5 md:p-5 ${getToneClasses(card.tone ?? "slate")}`}
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

        <section className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-8 md:gap-4">
          {mainActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:border-amber-300/35 hover:bg-white/[0.07] active:scale-[0.99] md:rounded-[1.75rem] md:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-bold text-amber-100">
                    {action.icon}
                  </span>
                  <h3 className="text-lg font-semibold text-white md:text-xl">{action.title}</h3>
                </div>
                <span className="text-sm font-semibold text-amber-200 transition group-hover:text-amber-100">
                  Open
                </span>
              </div>
              <p className="mt-3 text-sm leading-5 text-slate-300 md:leading-6">
                {action.description}
              </p>
              <div className="mt-4 text-sm font-semibold text-white/82 md:mt-5">
                {action.cta}
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid items-start gap-4 xl:mt-8 xl:grid-cols-[1.08fr_0.92fr] xl:gap-6">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)] sm:rounded-[2rem] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                  Your Memory Path
                </p>
                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl md:text-3xl">
                  Move each verse from familiar to memorized.
                </h2>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto pb-1">
              <div className="flex min-w-max items-stretch gap-3">
                {memoryRailSteps.map((step, index) => {
                  const isCurrent = index === 2
                  const isComplete = index < 2
                  const isFuture = index > 2

                  return (
                    <div key={step.title} className="flex items-center gap-3">
                      <div
                        className={`w-[8.5rem] rounded-[1.2rem] border p-3.5 transition duration-300 sm:w-[10rem] sm:rounded-[1.35rem] sm:p-4 ${getStepClasses(
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

          <div className="rounded-[1.6rem] border border-cyan-200/14 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.10),transparent_26%),linear-gradient(180deg,rgba(10,15,28,0.96),rgba(7,10,18,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)] sm:rounded-[2rem] md:p-7">
            <button
              type="button"
              onClick={() => setPreviewOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm text-cyan-100">
                    V
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                    Verses in Training
                  </p>
                </div>
                <h2 className="mt-3 text-lg font-bold text-white sm:text-2xl md:text-3xl">
                  See what each verse needs next.
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Preview stages and next drills for your active verses.
                </p>
              </div>
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg transition-transform duration-300 ${
                  previewOpen ? "rotate-180" : ""
                }`}
              >
                ⌄
              </span>
            </button>

            <div className={`grid transition-all duration-300 ${previewOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "mt-4 grid-rows-[0fr] opacity-70"}`}>
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

        <section className="mt-6 space-y-3 md:mt-8 md:space-y-4">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:rounded-[2rem] md:p-7">
            <button
              type="button"
              onClick={() => setPracticeOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm text-amber-100">
                    O
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
                    Optional Practice
                  </p>
                </div>
                <h2 className="mt-3 text-lg font-bold text-white sm:text-2xl md:text-3xl">
                  Train the same verses in different ways.
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Extra drills when you want more repetition beyond the daily workout.
                </p>
              </div>
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg transition-transform duration-300 ${
                  practiceOpen ? "rotate-180" : ""
                }`}
              >
                ⌄
              </span>
            </button>

            <div className={`grid transition-all duration-300 ${practiceOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "mt-4 grid-rows-[0fr] opacity-70"}`}>
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

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:rounded-[2rem] md:p-7">
            <button
              type="button"
              onClick={() => setHowItWorksOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm text-cyan-100">
                    H
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                    How Verse Memory Works
                  </p>
                </div>
                <h2 className="mt-3 text-lg font-bold text-white sm:text-2xl md:text-3xl">
                  A calm, repeatable path to recall.
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  A simple five-step rhythm from adding a verse to long-term retention.
                </p>
              </div>
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg transition-transform duration-300 ${
                  howItWorksOpen ? "rotate-180" : ""
                }`}
              >
                ⌄
              </span>
            </button>

            <div className={`grid transition-all duration-300 ${howItWorksOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "mt-4 grid-rows-[0fr] opacity-70"}`}>
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
