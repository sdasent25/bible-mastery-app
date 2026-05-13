"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"

import PricingContextBanner from "@/components/PricingContext"
import { renderNavIcon } from "@/lib/navigation"
import { supabase } from "@/lib/supabase"

type SelectablePlan = "pro" | "pro_plus" | "free" | null

const freeFeatures = [
  "Preview the Bible learning path",
  "See the arena before you commit",
  "Limited access only",
]

const proFeatures = (isFamily: boolean) => [
  "Verse Memory and flashcards included",
  "Core learning tools for daily consistency",
  "XP, streaks, and progress tracking",
  isFamily ? "Shared access for up to 4 members" : "Best for steady daily practice",
]

const proPlusFeatures = (isFamily: boolean) => [
  "Everything in Pro",
  "Full Training Arena access",
  "Deeper drills, image recognition, and hard questions",
  isFamily ? "Household access for the strongest family plan" : "Best individual experience",
]

export default function PricingSection() {
  const router = useRouter()
  const [isFamily, setIsFamily] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SelectablePlan>("pro_plus")

  const handleSelectPlan = async (plan: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/signup")
      return
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ plan }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Stripe checkout failed:", errorText)
      alert("Something went wrong. Please try again.")
      return
    }

    const data = await response.json()

    if (!data?.url) {
      console.error("No checkout URL returned:", data)
      alert("Unable to start checkout. Please try again.")
      return
    }

    window.location.href = data.url
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Suspense fallback={null}>
        <PricingContextBanner />
      </Suspense>

      <div className="mx-auto max-w-4xl text-center">
        <div className="ba-badge-gold">Start Your Training</div>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
          Choose the level of Bible mastery you want to build
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-lg sm:leading-8">
          Free gives you a preview. Pro unlocks Verse Memory and core tools. Pro+ opens the full arena and the strongest training path.
        </p>
      </div>

      <div className="ba-card-soft sticky top-0 z-20 mx-auto mt-8 flex w-full max-w-md rounded-2xl p-2 backdrop-blur">
        <button
          onClick={() => setIsFamily(false)}
          className={`flex-1 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
            !isFamily ? "ba-button-primary" : "text-slate-200"
          }`}
        >
          Individual
        </button>

        <button
          onClick={() => setIsFamily(true)}
          className={`flex-1 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
            isFamily ? "ba-button-primary" : "text-slate-200"
          }`}
        >
          Family
        </button>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1fr_1.08fr]">
        <div
          onClick={() => setSelectedPlan("free")}
          className={`ba-card cursor-pointer rounded-[1.9rem] p-5 transition duration-200 active:scale-[0.98] sm:p-6 ${
            selectedPlan === "free" ? "ring-1 ring-white/14" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="ba-badge">Free</div>
              <h2 className="mt-3 text-2xl font-black text-white">
                Preview the system
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

          <button
            onClick={() => router.push("/signup")}
            className="ba-button-secondary mt-6 w-full px-4 py-4 text-base font-semibold"
          >
            Get Started
          </button>
        </div>

        <div
          onClick={() => setSelectedPlan("pro")}
          className={`ba-card-pro cursor-pointer rounded-[1.9rem] p-5 transition duration-200 active:scale-[0.98] sm:p-6 ${
            selectedPlan === "pro" ? "ring-1 ring-emerald-300/26" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="ba-badge-success">Pro</div>
              <h2 className="mt-3 text-2xl font-black text-white">
                Verse Memory and core access
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                A strong daily plan for memory, review, and consistent Scripture training.
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
            onClick={() => handleSelectPlan(isFamily ? "family_pro" : "pro")}
            className="ba-button-primary mt-6 w-full px-4 py-4 text-base font-black"
          >
            {isFamily ? "Start Family Pro" : "Start Pro"}
          </button>
        </div>

        <div
          id="pro-plus"
          onClick={() => setSelectedPlan("pro_plus")}
          className={`ba-card-pro-plus relative cursor-pointer rounded-[1.9rem] p-5 transition duration-200 active:scale-[0.98] sm:p-6 ${
            selectedPlan === "pro_plus" ? "ring-1 ring-amber-300/28" : ""
          }`}
        >
          <div className="absolute right-5 top-5">
            <div className="ba-badge-gold">Best Value</div>
          </div>

          <div className="flex items-start justify-between gap-4 pr-24">
            <div>
              <div className="ba-badge-gold">Pro+</div>
              <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                Full Training Arena
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Unlock the full arena, deeper drills, and the strongest Bible Athlete experience.
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
            onClick={() => handleSelectPlan(isFamily ? "family_pro_plus" : "pro_plus")}
            className="ba-button-primary mt-6 w-full px-4 py-4 text-base font-black"
          >
            {isFamily ? "Start Family Pro+" : "Start Pro+"}
          </button>
        </div>
      </div>
    </section>
  )
}
