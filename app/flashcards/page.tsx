"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Paywall from "@/components/Paywall"
import { FLASHCARD_PAYWALL_COPY, canAccessFlashcards } from "@/lib/flashcardAccess"
import { type Flashcard, getFlashcards } from "@/lib/flashcards"
import { getUserPlan } from "@/lib/getUserPlan"
import { createClient } from "@/lib/supabase/client"

type RecommendedAction = {
  eyebrow: string
  title: string
  description: string
  cta: string
  href: string
}

type StatCard = {
  label: string
  value: string
  tone?: "gold" | "slate"
}

type ModeCard = {
  title: string
  description: string
  href: string
}

const trainingModes: ModeCard[] = [
  {
    title: "Review Cards",
    description: "Strengthen recall with your saved verses.",
    href: "/flashcards/review",
  },
  {
    title: "Fill the Blank",
    description: "Train exact wording through missing-word recall.",
    href: "/games/fill-in-the-blank",
  },
  {
    title: "Sprint",
    description: "Fast recall under pressure.",
    href: "/games/flashcard-sprint",
  },
  {
    title: "Weak Verses",
    description: "Focus where your memory needs reinforcement.",
    href: "/flashcards/review",
  },
]

function isDue(card: Pick<Flashcard, "due_date">) {
  if (!card.due_date) {
    return true
  }

  return new Date(card.due_date).getTime() <= Date.now()
}

export default function FlashcardsPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const run = async () => {
      try {
        const nextPlan = await getUserPlan()
        setPlan(nextPlan)

        if (!canAccessFlashcards(nextPlan)) {
          return
        }

        const [loadedCards, profile] = await Promise.all([
          getFlashcards().catch(() => [] as Flashcard[]),
          (async () => {
            const client = createClient()
            const {
              data: { user },
            } = await client.auth.getUser()

            if (!user) {
              return null
            }

            const { data } = await client
              .from("profiles")
              .select("xp, streak")
              .eq("id", user.id)
              .maybeSingle<{ xp: number | null; streak: number | null }>()

            return data
          })(),
        ])

        setCards(loadedCards)
        setXp(profile?.xp || 0)
        setStreak(profile?.streak || 0)
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  const stats = useMemo(() => {
    const dueCount = cards.filter((card) => isDue(card)).length
    const masteredCount = cards.filter((card) => card.status === "mastered").length

    return {
      totalCards: cards.length,
      dueCount,
      masteredCount,
      xp,
      streak,
    }
  }, [cards, streak, xp])

  const recommendedAction = useMemo<RecommendedAction>(() => {
    if (stats.dueCount > 0) {
      return {
        eyebrow: "Recommended Today",
        title: "Review Cards",
        description: "You have verses ready for review. Keep recall sharp and stay disciplined.",
        cta: "Review Cards",
        href: "/flashcards/review",
      }
    }

    if (stats.totalCards === 0) {
      return {
        eyebrow: "Recommended Today",
        title: "Add Your First Verse",
        description: "Start your memory library with a verse you want to carry into daily life.",
        cta: "Add Verse",
        href: "/flashcards/create",
      }
    }

    return {
      eyebrow: "Recommended Today",
      title: "Start Training",
      description: "Your library is ready. Run a focused training session and strengthen retention.",
      cta: "Start Training",
      href: "/flashcards/review",
    }
  }, [stats.dueCount, stats.totalCards])

  const statCards: StatCard[] = [
    { label: "Cards Due", value: String(stats.dueCount), tone: "gold" },
    { label: "Mastered Verses", value: String(stats.masteredCount) },
    { label: "Memory XP", value: String(stats.xp) },
    { label: "Streak", value: String(stats.streak) },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white md:px-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-40 rounded-[2rem] bg-white/5" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="h-28 rounded-3xl bg-white/5" />
            <div className="h-28 rounded-3xl bg-white/5" />
            <div className="h-28 rounded-3xl bg-white/5" />
            <div className="h-28 rounded-3xl bg-white/5" />
          </div>
          <div className="h-48 rounded-[2rem] bg-white/5" />
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_24%),linear-gradient(180deg,_#0f172a_0%,_#020617_52%,_#000000_100%)] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-amber-400/20 bg-white/[0.04] shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="grid gap-8 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
            <div>
              <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                Scripture Memory Training
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                Build recall, strengthen retention, and train God&apos;s Word into memory.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Create your own verse library, review what is due, and keep memory training disciplined day after day.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/flashcards/review"
                  className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  Start Training
                </Link>
                <Link
                  href="/flashcards/create"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Add Verse
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                {recommendedAction.eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {recommendedAction.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {recommendedAction.description}
              </p>

              <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-300/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">
                  Daily Training
                </p>
                <p className="mt-2 text-sm text-amber-50/90">
                  {stats.dueCount > 0
                    ? `${stats.dueCount} verse${stats.dueCount === 1 ? "" : "s"} due for review today.`
                    : stats.totalCards === 0
                      ? "No verses saved yet. Start your training library today."
                      : "No cards due right now. A fresh review round is still ready for you."}
                </p>
              </div>

              <Link
                href={recommendedAction.href}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                {recommendedAction.cta}
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
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-extrabold text-white">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                Training Modes
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                Choose your memory discipline
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {trainingModes.map((mode) => (
              <Link
                key={mode.title}
                href={mode.href}
                className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-300/35 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">{mode.title}</h3>
                  <span className="text-sm font-semibold text-amber-200 transition group-hover:text-amber-100">
                    Open
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {mode.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                Your Verse Library
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                Keep your saved verses ready for review
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                {stats.totalCards > 0
                  ? `You currently have ${stats.totalCards} saved verse${stats.totalCards === 1 ? "" : "s"} in training.`
                  : "Your verse library is empty. Add a verse to begin building recall and retention."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/flashcards/list"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Cards
              </Link>
              <Link
                href="/flashcards/create"
                className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Add Verse
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
