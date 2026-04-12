"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type PlanId =
  | "free"
  | "pro"
  | "family_pro"
  | "pro_plus"
  | "family_pro_plus"

function PlanCard({
  title,
  subtitle,
  features,
  accentClass,
  surfaceClass,
  current,
  ctaLabel,
  ctaHref,
  badge,
}: {
  title: string
  subtitle: string
  features: string[]
  accentClass: string
  surfaceClass: string
  current: boolean
  ctaLabel: string
  ctaHref: string
  badge?: string
}) {
  return (
    <div
      className={`w-full rounded-3xl border ${surfaceClass} p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{subtitle}</p>
        </div>

        {badge && (
          <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] ${accentClass}`}>
            {badge}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          >
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-white" />
            <div className="text-sm leading-6 text-zinc-100">{feature}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {current ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
            Current Plan
          </div>
        ) : (
          <Link
            href={ctaHref}
            className={`block rounded-2xl px-4 py-4 text-center text-base font-black transition active:scale-[0.99] ${accentClass}`}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [plan, setPlan] = useState<PlanId>("free")

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single()

      setPlan((data?.plan as PlanId) || "free")
    }

    run()
  }, [])

  const isPro = plan === "pro" || plan === "family_pro"
  const isProPlus = plan === "pro_plus" || plan === "family_pro_plus"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#18345f_0%,_#0a1020_40%,_#04070f_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-[32px] border border-white/10 bg-black/30 px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              Bible Athlete Plans
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Choose the plan that matches your training depth
            </h1>

            <p className="mt-4 text-base leading-7 text-zinc-300 sm:text-lg">
              Start free, unlock flashcards with Pro, and step into the full advanced training system with Pro+.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <PlanCard
            title="Free"
            subtitle="Start simple and build your streak with the essential journey experience."
            features={[
              "2 questions per node",
              "Easy difficulty only",
              "Limited XP",
              "No flashcards",
              "No quests",
            ]}
            accentClass="bg-white text-black"
            surfaceClass="border-white/10 bg-white/5"
            current={plan === "free"}
            ctaLabel="Upgrade to Pro"
            ctaHref="/upgrade"
          />

          <PlanCard
            title="Pro"
            subtitle="Unlock more reps, more depth, and the full journey system."
            features={[
              "7 questions per node",
              "Easy + Medium",
              "Flashcards unlocked",
              "Full journey",
              "Family leaderboard (if family plan)",
            ]}
            accentClass="bg-emerald-400 text-black"
            surfaceClass="border-emerald-300/30 bg-emerald-400/10"
            current={isPro}
            ctaLabel={plan === "free" ? "Upgrade to Pro" : "Upgrade to Pro+"}
            ctaHref="/upgrade"
            badge="Most Popular"
          />

          <PlanCard
            title="Pro+"
            subtitle="Go all in with elite training tools, deeper question sets, and advanced study modes."
            features={[
              "15 questions per node",
              "Easy + Medium + Hard",
              "Flashcards",
              "Quests (Characters, Who Said It, Books)",
              "Scholar Mode",
              "Advanced training system",
              "Global leaderboard (COMING SOON)",
              "Family leaderboard",
            ]}
            accentClass="bg-amber-300 text-black"
            surfaceClass="border-amber-300/40 bg-amber-300/10"
            current={isProPlus}
            ctaLabel={plan === "free" || isPro ? "Upgrade to Pro+" : "Current Plan"}
            ctaHref="/upgrade"
            badge="Best Value"
          />
        </div>
      </div>
    </div>
  )
}
