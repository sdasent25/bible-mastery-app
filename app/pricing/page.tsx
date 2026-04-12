"use client"

import { useState } from "react"

export default function PricingPage() {
  const [mode, setMode] = useState("individual")

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0d4f62_0%,_#0a1020_38%,_#04070f_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-[32px] border border-white/10 bg-black/35 px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-amber-100">
              Choose Your Plan
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Pick the training depth that matches your goals
            </h1>

            <p className="mt-4 text-base leading-7 text-zinc-300 sm:text-lg">
              Unlock deeper learning, stronger repetition, and advanced features as you move from Pro to Pro+.
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-2">
          <button
            onClick={() => setMode("individual")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              mode === "individual"
                ? "bg-cyan-400 text-black"
                : "text-zinc-300"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setMode("family")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
              mode === "family"
                ? "bg-cyan-400 text-black"
                : "text-zinc-300"
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
              <p className="mt-3 text-lg font-bold text-white">
                {mode === "individual" ? "$6.99 / month" : "$9.99 / month"}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-200">
                More reps, more journey depth, and flashcards unlocked.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "7 questions per node",
                "Easy + Medium",
                "Flashcards",
                "Full journey",
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

            <a
              href={`/test-checkout?plan=${mode === "individual" ? "pro" : "family_pro"}`}
              className="mt-6 block rounded-2xl bg-emerald-400 px-4 py-4 text-center text-base font-black text-black transition active:scale-[0.99]"
            >
              Upgrade to Pro
            </a>
          </div>

          <div className="rounded-[28px] border border-amber-300/35 bg-amber-300/10 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-100">
                  Pro+
                </div>
                <h2 className="mt-2 text-3xl font-black text-white">Train at the highest level</h2>
                <p className="mt-3 text-lg font-bold text-white">
                  {mode === "individual" ? "$12.99 / month" : "$19.99 / month"}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-200">
                  Everything in Pro plus elite study tools, quests, and advanced systems.
                </p>
              </div>

              <div className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black">
                Best Value
              </div>
            </div>

            <div className="space-y-3">
              {[
                "15 questions per node",
                "All difficulties",
                "Flashcards",
                "Quests",
                "Scholar Mode",
                "Advanced training",
                "Global leaderboard (coming soon)",
                "Everything in Pro",
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100"
                >
                  {feature}
                </div>
              ))}
            </div>

            <a
              href={`/test-checkout?plan=${mode === "individual" ? "pro_plus" : "family_pro_plus"}`}
              className="mt-6 block rounded-2xl bg-amber-300 px-4 py-4 text-center text-base font-black text-black transition active:scale-[0.99]"
            >
              Upgrade to Pro+
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
