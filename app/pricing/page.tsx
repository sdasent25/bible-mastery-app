"use client"

import { useState } from "react"

type CheckoutPlan = "pro" | "pro_plus" | "family_pro" | "family_pro_plus"

export default function PricingPage() {
  const [mode, setMode] = useState("individual")

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#103b4d_0%,_#09101b_42%,_#05070d_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        <div className="rounded-[28px] border border-white/10 bg-black/40 px-5 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:px-8 sm:py-9">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100">
              Choose Your Plan
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
              Unlock deeper learning with a plan built for your pace
            </h1>

            <p className="mt-4 text-sm leading-6 text-gray-200 sm:text-lg sm:leading-8">
              Move from consistent daily practice to advanced training, quests, and stronger long-term retention.
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-2">
          <button
            onClick={() => setMode("individual")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              !isFamily ? "bg-cyan-400 text-black" : "text-zinc-200"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setMode("family")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              isFamily ? "bg-cyan-400 text-black" : "text-zinc-200"
            }`}
          >
            Family
          </button>
        </div>

        {isFamily ? (
          <div className="mx-auto w-full max-w-3xl rounded-[24px] border border-amber-300/25 bg-amber-300/10 px-4 py-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.3)] sm:px-6">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-100">
              Family Access
            </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-gray-200 sm:text-base">
              One plan covers up to 4 members and saves more than paying for separate individual subscriptions.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-300/25 bg-emerald-400/10 p-5 text-white opacity-100 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-6">
            <div className="text-white">
            <div className="mb-5">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
                Pro
              </div>
              <h2 className="mt-2 text-3xl font-black !text-white">Build consistency in your walk with God</h2>

              {isFamily ? (
                <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-black/25 p-4">
                  <div className="text-sm font-semibold !text-white">Up to 4 members</div>
                  <div className="mt-3 text-4xl font-black text-emerald-300">$19.99</div>
                  <div className="mt-1 text-sm font-medium !text-white">per month</div>
                  <div className="mt-3 inline-flex rounded-full bg-emerald-300 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black">
                    Save over 28% vs 4 individual plans
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-4xl font-black !text-white">$6.99</div>
                  <div className="mt-1 text-sm font-medium !text-white">per month</div>
                </div>
              )}

              <p className="mt-4 text-sm leading-6 !text-white">
                Build consistency in your walk with God.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Full Bible Journey",
                "10 questions per day",
                "Flashcards for memorization",
                "XP, streaks, and progress tracking",
                isFamily ? "Shared family leaderboard" : "Daily training momentum",
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium !text-white"
                >
                  {feature}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout(isFamily ? "family_pro" : "pro")}
              className="mt-6 block w-full rounded-2xl bg-emerald-300 px-4 py-4 text-center text-base font-black text-white transition active:scale-[0.99]"
            >
              {isFamily ? "Start Family Pro" : "Upgrade to Pro"}
            </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-300/40 bg-amber-300/10 p-5 text-white opacity-100 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-6">
            <div className="text-white">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-100">
                  Pro+
                </div>
                <h2 className="mt-2 text-3xl font-black !text-white">Master Scripture with a deeper training system</h2>
              </div>

              <div className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-black">
                Best Value
              </div>
            </div>

            {isFamily ? (
              <div className="mb-5 rounded-2xl border border-amber-300/25 bg-black/25 p-4">
                <div className="text-sm font-semibold !text-white">Up to 4 members</div>
                <div className="mt-3 text-4xl font-black text-amber-300">$29.99</div>
                <div className="mt-1 text-sm font-medium !text-white">per month</div>
                <div className="mt-3 inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black">
                  Save over 42% vs 4 individual plans
                </div>
              </div>
            ) : (
              <div className="mb-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-4xl font-black !text-white">$12.99</div>
                <div className="mt-1 text-sm font-medium !text-white">per month</div>
              </div>
            )}

              <p className="mb-5 text-sm leading-6 !text-white">
                Master Scripture with a deeper training system.
              </p>

            <div className="space-y-3">
              {[
                "Everything in Pro",
                "Choose your daily depth (5 / 10 / 15)",
                "Quests (Who said it, Characters, Books)",
                "Scholar Mode for advanced recall",
                "Global leaderboard (coming soon)",
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium !text-white"
                >
                  {feature}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout(isFamily ? "family_pro_plus" : "pro_plus")}
              className="mt-6 block w-full rounded-2xl bg-amber-300 px-4 py-4 text-center text-base font-black text-white transition active:scale-[0.99]"
            >
              {isFamily ? "Start Family Pro+" : "Upgrade to Pro+"}
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
