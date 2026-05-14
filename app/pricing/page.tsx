"use client"

import Link from "next/link"
import { useState } from "react"

import { renderNavIcon } from "@/lib/navigation"

type CheckoutPlan = "pro" | "pro_plus" | "family_pro" | "family_pro_plus"

const freeFeatures = [
  "Preview Training Arena Days 1-3",
  "Explore the Bible learning experience",
  "See the path before you commit",
]

const proFeatures = (isFamily: boolean) => [
  "Verse Memory and flashcards included",
  "Core learning tools for daily consistency",
  "Guided review, XP, streaks, and progress tracking",
  isFamily ? "Shared access for up to 4 members" : "Built for steady daily practice",
]

const proPlusFeatures = (isFamily: boolean) => [
  "Full Training Arena access",
  "Deeper drills, image recognition, and hard questions",
  "Quests and advanced mastery modes",
  isFamily ? "Household access with the strongest shared plan" : "Best full experience for individual mastery",
]

export default function PricingPage() {
  const [mode, setMode] = useState<"individual" | "family">("individual")

  const handleCheckout = async (plan: CheckoutPlan) => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    }
  }

  const isFamily = mode === "family"

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#153247_0%,_#09111d_38%,_#04070f_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-24 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-36 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="ba-card rounded-[2rem] px-5 py-7 sm:px-8 sm:py-9">
          <div className="mx-auto max-w-4xl text-center">
            <div className="ba-badge-gold">Choose Your Plan</div>
            <h1 className="mt-4 text-[2.15rem] font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl">
              Unlock the Bible Athlete system at the depth you want to train
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-lg sm:leading-8">
              Start with a preview, step into Verse Memory and core tools with Pro, or unlock the full arena with deeper drills in Pro+.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="ba-card-soft rounded-[1.4rem] px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-100/72">
                  Free
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  Preview the journey
                </div>
              </div>
              <div className="ba-card-soft rounded-[1.4rem] px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200/82">
                  Pro
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  Verse Memory and core access
                </div>
              </div>
              <div className="ba-card-soft rounded-[1.4rem] px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/82">
                  Pro+
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  Full arena and deeper mastery
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="ba-card-soft mx-auto flex w-full max-w-md rounded-2xl p-2">
          <button
            onClick={() => setMode("individual")}
            className={`flex-1 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              !isFamily ? "ba-button-primary" : "text-zinc-200"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setMode("family")}
            className={`flex-1 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              isFamily ? "ba-button-primary" : "text-zinc-200"
            }`}
          >
            Family
          </button>
        </div>

        {isFamily ? (
          <div className="ba-card-warning mx-auto w-full max-w-4xl rounded-[1.6rem] px-5 py-4 text-center">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">
              Family Access
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-200 sm:text-base">
              One plan covers up to 4 members and keeps family learning in one premium training system.
            </p>
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1fr_1.08fr]">
          <div className="ba-card rounded-[1.9rem] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="ba-badge">Free</div>
                <h2 className="mt-3 text-2xl font-black text-white">
                  Start with a preview
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-slate-100">
                {renderNavIcon("home", "h-5 w-5")}
              </div>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4">
              <div className="text-4xl font-black text-white">$0</div>
              <div className="mt-1 text-sm text-slate-300">preview access</div>
            </div>

            <div className="mt-5 space-y-3">
              {freeFeatures.map((feature) => (
                <div
                  key={feature}
                  className="ba-card-soft flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm text-slate-100"
                >
                  <span className="h-2 w-2 rounded-full bg-slate-300/80" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
              Flashcards, Verse Memory, and full quests stay locked on Free.
            </div>

            <Link
              href="/signup"
              className="ba-button-secondary mt-5 w-full px-4 py-4 text-base font-semibold"
            >
              Get Started
            </Link>
          </div>

          <div className="ba-card-pro rounded-[1.9rem] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="ba-badge-success">Pro</div>
                <h2 className="mt-3 text-2xl font-black text-white">
                  Build daily consistency
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Verse Memory, flashcards, and core tools for steady Scripture retention.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-emerald-300/16 bg-emerald-300/10 text-emerald-100">
                {renderNavIcon("verse-memory", "h-5 w-5")}
              </div>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4">
              <div className="text-sm font-semibold text-slate-200">
                {isFamily ? "Up to 4 members" : "Individual plan"}
              </div>
              <div className="mt-3 text-4xl font-black text-white">
                {isFamily ? "$19.99" : "$6.99"}
              </div>
              <div className="mt-1 text-sm text-slate-300">per month</div>
            </div>

            <div className="mt-5 space-y-3">
              {proFeatures(isFamily).map((feature) => (
                <div
                  key={feature}
                  className="ba-card-soft flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm text-slate-100"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout(isFamily ? "family_pro" : "pro")}
              className="ba-button-primary mt-6 w-full px-4 py-4 text-base font-black"
            >
              {isFamily ? "Start Family Pro" : "Upgrade to Pro"}
            </button>
          </div>

          <div className="ba-card-pro-plus relative rounded-[1.9rem] p-5 sm:p-6">
            <div className="absolute right-5 top-5">
              <div className="ba-badge-gold">Best Value</div>
            </div>

            <div className="flex items-start justify-between gap-4 pr-24">
              <div>
                <div className="ba-badge-gold">Pro+</div>
                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  Unlock the full arena
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Full Training Arena, deeper drills, and the strongest Bible Athlete experience.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-amber-200/16 bg-amber-200/10 text-amber-100">
                {renderNavIcon("upgrade", "h-5 w-5")}
              </div>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-amber-200/10 bg-black/20 px-4 py-4">
              <div className="text-sm font-semibold text-slate-200">
                {isFamily ? "Up to 4 members" : "Individual plan"}
              </div>
              <div className="mt-3 text-4xl font-black text-white">
                {isFamily ? "$29.99" : "$12.99"}
              </div>
              <div className="mt-1 text-sm text-slate-300">per month</div>
            </div>

            <div className="mt-5 space-y-3">
              {proPlusFeatures(isFamily).map((feature) => (
                <div
                  key={feature}
                  className="ba-card-soft flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm text-slate-100"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout(isFamily ? "family_pro_plus" : "pro_plus")}
              className="ba-button-primary mt-6 w-full px-4 py-4 text-base font-black"
            >
              {isFamily ? "Start Family Pro+" : "Upgrade to Pro+"}
            </button>
          </div>
        </section>

        <div className="text-center text-sm text-slate-400">
          Need a direct upgrade path instead?{" "}
          <Link href="/upgrade" className="font-bold text-amber-200 underline underline-offset-4">
            Open the upgrade page
          </Link>
        </div>
      </div>
    </div>
  )
}
