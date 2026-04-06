"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const router = useRouter()

  const handleSelectPlan = async (plan: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/signup")
      return
    }

    router.push(`/upgrade?plan=${plan}`)
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "Get started and build consistency",
      features: [
        "Limited daily questions",
        "Basic journey access",
        "Flashcards (limited)",
      ],
      cta: "Start Free",
      path: "/signup",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$4.99/mo",
      desc: "Stay consistent and grow daily",
      features: [
        "Full journey access",
        "15+ questions per day",
        "Flashcards + training",
        "Progress tracking",
      ],
      cta: "Upgrade to Pro",
      path: "/signup",
      highlight: false,
    },
    {
      name: "Pro+",
      price: "$9.99/mo",
      desc: "Master scripture with unlimited training",
      features: [
        "Unlimited training",
        "Scholar Mode (review past content)",
        "Advanced retention system",
        "All future features",
      ],
      cta: "Go Pro+",
      path: "/signup",
      highlight: true,
    },
  ]

  const familyPlans = [
    {
      name: "Family Pro",
      price: "$9.99/mo",
      features: [
        "Up to 6 members",
        "Shared leaderboard",
        "All Pro features",
      ],
    },
    {
      name: "Family Pro+",
      price: "$19.99/mo",
      features: [
        "Up to 6 members",
        "Weekly leaderboard competition",
        "Unlimited training for all",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0F1A] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Choose Your Plan</h1>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border bg-[#121826] p-6 ${
                plan.highlight
                  ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                  : "border-gray-700"
              }`}
            >
              {plan.highlight && (
                <div className="mb-4 inline-flex rounded-full bg-green-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                  Best Value
                </div>
              )}

              <h2 className="mb-2 text-xl font-bold">{plan.name}</h2>
              <p className="mb-2 text-2xl font-bold">{plan.price}</p>
              <p className="mb-4 text-gray-400">{plan.desc}</p>

              <ul className="mb-6 space-y-2 text-sm text-gray-100">
                {plan.features.map((feature) => (
                  <li key={feature}>✔ {feature}</li>
                ))}
              </ul>

              <button
                onClick={() =>
                  plan.name === "Free"
                    ? router.push("/signup")
                    : handleSelectPlan(plan.name.toLowerCase().replace("+", "_plus"))
                }
                className={`w-full rounded-lg py-2 font-semibold transition-transform hover:scale-[1.01] active:scale-[0.99] ${
                  plan.highlight
                    ? "bg-green-500 text-black"
                    : "bg-[#1A2233] text-white"
                }`}
              >
                {plan.cta}
              </button>

              <p className="mt-2 text-center text-xs text-gray-400">
                Create your free account to unlock your plan
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-bold">Family Plans</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {familyPlans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl border border-gray-700 bg-[#121826] p-6"
              >
                <h3 className="mb-2 text-lg font-bold">{plan.name}</h3>
                <p className="mb-4 text-xl font-bold">{plan.price}</p>

                <ul className="space-y-2 text-sm text-gray-100">
                  {plan.features.map((feature) => (
                    <li key={feature}>✔ {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
