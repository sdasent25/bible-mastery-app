"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { renderNavIcon } from "@/lib/navigation"
import { getUserPlan } from "@/lib/getUserPlan"

type PlanId =
  | "free"
  | "pro"
  | "family_pro"
  | "pro_plus"
  | "family_pro_plus"

type CheckoutPlan = "pro" | "pro_plus" | "family_pro" | "family_pro_plus"

const proFeatures = [
  "Verse Memory and flashcards included",
  "Core learning tools for daily consistency",
  "Guided progress with streaks and XP tracking",
]

const proPlusFeatures = [
  "Full Training Arena access",
  "Deeper drills, image recognition, and hard questions",
  "Quests, scholar mode, and the strongest mastery path",
]

export default function UpgradePage() {
  const [isFamily, setIsFamily] = useState(false)
  const [plan, setPlan] = useState<PlanId>("free")

  const handleCheckout = async (plan: CheckoutPlan) => {
    try {
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
      } else {
        alert("Checkout failed")
      }
    } catch {
      alert("Checkout failed")
    }
  }

  useEffect(() => {
    const run = async () => {
      const plan = await getUserPlan()
      setPlan(plan as PlanId)
    }

    run()
  }, [])

  const isPro = plan === "pro" || plan === "family_pro"
  const isProPlus = plan === "pro_plus" || plan === "family_pro_plus"
  const currentPlanLabel =
    plan === "family_pro_plus"
      ? "Family Pro+"
      : plan === "family_pro"
        ? "Family Pro"
        : plan === "pro_plus"
          ? "Pro+"
          : plan === "pro"
            ? "Pro"
            : "Free"

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#123446_0%,_#09111c_40%,_#04070f_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-24 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-40 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="ba-card rounded-[2rem] px-5 py-7 sm:px-8 sm:py-9">
          <div className="mx-auto max-w-4xl text-center">
            <div className="ba-badge-gold">Upgrade Your Training</div>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              Step into deeper study, stronger drills, and fuller access
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-lg sm:leading-8">
              Your current plan is <span className="font-bold text-amber-100">{currentPlanLabel}</span>. Upgrade when you want Verse Memory, full arena depth, or the strongest shared family path.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="ba-card-soft rounded-[1.4rem] px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-100/72">
                  Memory
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  Flashcards and Verse Memory
                </div>
              </div>
              <div className="ba-card-soft rounded-[1.4rem] px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/82">
                  Arena
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  Deeper drills and full training
                </div>
              </div>
              <div className="ba-card-soft rounded-[1.4rem] px-4 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200/82">
                  Family
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  Shared access for your household
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="ba-card-soft mx-auto flex w-full max-w-md rounded-2xl p-2">
          <button
            onClick={() => setIsFamily(false)}
            className={`flex-1 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              !isFamily ? "ba-button-primary" : "text-zinc-300"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setIsFamily(true)}
            className={`flex-1 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              isFamily ? "ba-button-primary" : "text-zinc-300"
            }`}
          >
            Family
          </button>
        </div>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="ba-card-pro rounded-[1.9rem] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="ba-badge-success">Pro</div>
                <h2 className="mt-3 text-2xl font-black text-white">
                  Verse Memory and core tools
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Best for users who want flashcards, Verse Memory, and steady daily structure.
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
              {proFeatures.map((feature) => (
                <div
                  key={feature}
                  className="ba-card-soft flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm text-slate-100"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              {isPro ? (
                <button
                  onClick={() => handleCheckout(isFamily ? "family_pro_plus" : "pro_plus")}
                  className="ba-button-secondary w-full px-4 py-4 text-base font-black"
                >
                  Move from Pro to Pro+
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(isFamily ? "family_pro" : "pro")}
                  className="ba-button-primary w-full px-4 py-4 text-base font-black"
                >
                  {isFamily ? "Start Family Pro" : "Upgrade to Pro"}
                </button>
              )}
            </div>
          </div>

          <div className="ba-card-pro-plus relative rounded-[1.9rem] p-5 sm:p-6">
            <div className="absolute right-5 top-5">
              <div className="ba-badge-gold">Best Value</div>
            </div>

            <div className="flex items-start justify-between gap-4 pr-24">
              <div>
                <div className="ba-badge-gold">Pro+</div>
                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  Full arena mastery
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Built for the deepest Bible Athlete experience, with stronger training variety and full access.
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
              {proPlusFeatures.map((feature) => (
                <div
                  key={feature}
                  className="ba-card-soft flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm text-slate-100"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              {isProPlus ? (
                <div className="ba-button-locked w-full px-4 py-4 text-center text-base font-black uppercase tracking-[0.18em]">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(isFamily ? "family_pro_plus" : "pro_plus")}
                  className="ba-button-primary w-full px-4 py-4 text-base font-black"
                >
                  {isFamily ? "Start Family Pro+" : "Upgrade to Pro+"}
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="text-center text-sm text-slate-400">
          Want the full comparison view first?{" "}
          <Link href="/pricing" className="font-bold text-amber-200 underline underline-offset-4">
            Review all plans
          </Link>
        </div>
      </div>
    </div>
  )
}
