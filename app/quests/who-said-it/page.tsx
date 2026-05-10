"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"

const allowedPlans = ["pro_plus", "family_pro_plus"]

const futureBooks = [
  { name: "Exodus", accent: "from-zinc-800 via-zinc-900 to-black" },
  { name: "Matthew", accent: "from-zinc-800 via-zinc-900 to-black" },
  { name: "Luke", accent: "from-zinc-800 via-zinc-900 to-black" },
  { name: "Acts", accent: "from-zinc-800 via-zinc-900 to-black" },
]

function BookCard({
  title,
  subtitle,
  status,
  ctaLabel,
  href,
  disabled = false,
  accentClass,
}: {
  title: string
  subtitle: string
  status: string
  ctaLabel: string
  href?: string
  disabled?: boolean
  accentClass: string
}) {
  const card = (
    <div
      className={`rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-2xl transition ${
        disabled ? "opacity-70" : "hover:scale-[1.01] active:scale-[0.99]"
      }`}
    >
      <div
        className={`rounded-2xl border border-white/10 bg-gradient-to-br ${accentClass} p-5`}
      >
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
          Speaker Recognition Drill
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/80">{subtitle}</p>
          </div>
          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-400">
          {disabled ? "More books will unlock in future releases." : "100 questions available."}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-black ${
            disabled
              ? "border border-white/10 bg-white/5 text-zinc-300"
              : "bg-amber-400 text-slate-950"
          }`}
        >
          {ctaLabel}
        </div>
      </div>
    </div>
  )

  if (disabled || !href) {
    return card
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

  useEffect(() => {
    const run = async () => {
      const resolvedPlan = await getUserPlan()
      setPlan(resolvedPlan)
      setLoading(false)
    }

    void run()
  }, [])

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_36%),linear-gradient(180deg,#020617_0%,#09090b_45%,#000000_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-[28px] border border-amber-400/15 bg-black/50 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-300">
            Skill Drill
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Who Said It?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            Train speaker recognition through key moments in Scripture.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Practice Preview • No XP Yet
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <BookCard
            title="Genesis"
            subtitle="Practice 10-question speaker recognition sessions across creation, covenant, conflict, and promise."
            status="Available"
            ctaLabel="Start Genesis Drill"
            href="/quests/who-said-it/play?book=Genesis"
            accentClass="from-sky-700 via-blue-700 to-cyan-500"
          />

          <div className="rounded-3xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
              Drill Brief
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Mode
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Speaker Recognition Drill
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Session
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  10 Questions
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Reward
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Practice Mode
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {futureBooks.map((book) => (
            <BookCard
              key={book.name}
              title={book.name}
              subtitle="This book is being prepared for future release."
              status="Coming Soon"
              ctaLabel="Coming Soon"
              disabled
              accentClass={book.accent}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
