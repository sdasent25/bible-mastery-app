"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type PlanId =
  | "free"
  | "pro"
  | "family_pro"
  | "pro_plus"
  | "family_pro_plus"

type CheckoutPlan = "pro" | "pro_plus" | "family_pro" | "family_pro_plus"

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
  const proButtonLabel = plan === "free" ? "Upgrade to Pro" : "Upgrade to Pro+"
  const plusButtonLabel = isProPlus ? "Current Plan" : "Upgrade to Pro+"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0d4f62_0%,_#0a1020_38%,_#04070f_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-[32px] border border-white/10 bg-black/35 px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-amber-100">
              Upgrade Your Training
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Unlock deeper study, smarter drills, and stronger progression
            </h1>

            <p className="mt-4 text-base leading-7 text-zinc-300 sm:text-lg">
              Pro unlocks the full journey and flashcards. Pro+ unlocks quests, scholar mode, and the advanced training system.
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-2">
          <button
            onClick={() => setIsFamily(false)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              !isFamily ? "bg-cyan-400 text-black" : "text-zinc-300"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setIsFamily(true)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              isFamily ? "bg-cyan-400 text-black" : "text-zinc-300"
            }`}
          >
            Family
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-300/25 bg-emerald-400/10 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            <div className="mb-5">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
                Pro
              </div>
              <h2 className="mt-2 text-3xl font-black text-white">Build consistency faster</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-200">
                Ideal for users who want full journey access and flashcards without stepping into the full advanced stack.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "7 questions per node",
                "Easy + Medium",
                "Flashcards unlocked",
                "Full journey",
                "Family leaderboard (if family plan)",
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100"
                >
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-6">
              {isPro ? (
                <button
                  onClick={() => handleCheckout(isFamily ? "family_pro_plus" : "pro_plus")}
                  className="block w-full rounded-2xl bg-emerald-400 px-4 py-4 text-center text-base font-black text-black transition active:scale-[0.99]"
                >
                  {proButtonLabel}
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(isFamily ? "family_pro" : "pro")}
                  className="block w-full rounded-2xl bg-emerald-400 px-4 py-4 text-center text-base font-black text-black transition active:scale-[0.99]"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-300/35 bg-amber-300/10 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-100">
                  Pro+
                </div>
                <h2 className="mt-2 text-3xl font-black text-white">Train at the highest level</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-200">
                  Built for users who want maximum question depth, quests, scholar mode, and the full advanced training system.
                </p>
              </div>

              <div className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black">
                Best Value
              </div>
            </div>

            <div className="space-y-3">
              {[
                "15 questions per node",
                "Easy + Medium + Hard",
                "Flashcards",
                "Quests (Characters, Who Said It, Books)",
                "Scholar Mode",
                "Advanced training system",
                "Global leaderboard (COMING SOON)",
                "Family leaderboard",
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100"
                >
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-6">
              {isProPlus ? (
                <div className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-center text-base font-black uppercase tracking-[0.2em] text-zinc-400">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(isFamily ? "family_pro_plus" : "pro_plus")}
                  className="block w-full rounded-2xl bg-amber-300 px-4 py-4 text-center text-base font-black text-black transition active:scale-[0.99]"
                >
                  {plusButtonLabel}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-zinc-400">
          Need to compare again?{" "}
          <Link href="/pricing" className="font-bold text-cyan-300 underline underline-offset-4">
            View full plan breakdown
          </Link>
        </div>
      </div>
    </div>
  )
}
