"use client"

import { supabase } from "@/lib/supabase"
import PricingContextBanner from "@/components/PricingContext"
import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"

export default function PricingSection() {
  const router = useRouter()
  const [isFamily, setIsFamily] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "pro_plus" | null>(null)

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

    if (!data.url) {
      console.error("No checkout URL returned:", data)
      alert("Unable to start checkout. Please try again.")
      return
    }

    window.location.href = "/upgrade"
  }

  const handleProPlusCheckout = async () => {
    await handleSelectPlan(isFamily ? "family_pro_plus" : "pro_plus")
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <Suspense fallback={null}>
        <PricingContextBanner />
      </Suspense>

      <h1 className="text-3xl font-bold text-white text-center mb-3">
        Start Your Training
      </h1>
      <p className="text-center text-gray-300 mb-8">
        Pick how serious you are about mastering scripture
      </p>

      <div className="sticky top-0 z-20 bg-[#0B1220] py-3 mb-6 flex justify-center">
        <div className="bg-[#0B1220] border border-[#1F2A44] rounded-lg p-1 flex">
          <button
            onClick={() => setIsFamily(false)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold ${
              !isFamily ? "bg-blue-600 text-white" : "text-white"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setIsFamily(true)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold ${
              isFamily ? "bg-blue-600 text-white" : "text-white"
            }`}
          >
            Family
          </button>
        </div>
      </div>

      <div className="space-y-4 md:space-y-0">
      <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
        <div
          id="pro-plus"
          onClick={() => setSelectedPlan("pro_plus")}
          className={`relative bg-[#0B1220] border border-green-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.35)] transition-all duration-200 active:scale-[0.97] cursor-pointer ${
            selectedPlan === "pro_plus" ? "scale-[1.04] ring-2 ring-green-400" : ""
          }`}
        >
          <div className="absolute top-2 right-2 text-xs bg-green-500 text-black px-2 py-1 rounded">
            RECOMMENDED
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Pro+ {isFamily && "Family"} 🚀
          </h2>
          <p className="text-sm text-green-300 mb-2">
            The complete Bible Athlete experience
          </p>
          <p className="text-green-400 font-semibold mb-4">
            {isFamily ? "$29.99 / month" : "$12.99 / month"}
          </p>

          {isFamily && (
            <p className="text-sm text-white mb-4 text-center">
              Up to 6 members included
            </p>
          )}

          <div className="text-sm text-gray-200 mt-3 mb-4">
            <p>• Build discipline</p>
            <p>• Master scripture</p>
            <p>• Stay consistent long-term</p>
          </div>

          <ul className="text-white text-sm space-y-2 mb-6">
            <li>🔥 Full Bible Journey (Core Experience)</li>
            <li>⚡ Unlimited Training</li>
            <li>🧠 Scholar Mode (review past content)</li>
            <li>🎯 Deep Retention System</li>
            <li>🏆 Leaderboard Access</li>
            <li>✅ Everything in Pro</li>
          </ul>

          <p className="text-xs text-green-400 mb-2">
            Start in under 2 minutes
          </p>

          <button
            onClick={handleProPlusCheckout}
            onMouseDown={(e) => e.currentTarget.classList.add("scale-95")}
            onMouseUp={(e) => e.currentTarget.classList.remove("scale-95")}
            className="w-full py-3 rounded-lg bg-green-500 text-black font-bold animate-pulse"
          >
            Start My Full Journey
          </button>

          <p className="text-xs text-green-400 text-center mt-2">
            Most users choose this to stay consistent
          </p>
        </div>

        <div
          onClick={() => setSelectedPlan("pro")}
          className={`bg-[#0B1220] border border-blue-500 rounded-2xl p-6 transition-all duration-200 active:scale-[0.97] cursor-pointer ${
            selectedPlan === "pro" ? "border-blue-400 scale-[1.02]" : ""
          }`}
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Pro {isFamily && "Family"}
          </h2>
          <p className="text-blue-400 font-semibold mb-4">
            {isFamily ? "$19.99 / month" : "$6.99 / month"}
          </p>

          {isFamily && (
            <p className="text-sm text-white mb-4 text-center">
              Up to 6 members included
            </p>
          )}

          <ul className="text-sm text-white space-y-2 mb-6">
            <li>📚 Full Flashcard System</li>
            <li>🧠 Learn, Review, Add Cards</li>
            <li>🎯 Practice Weak Cards</li>
            <li>🔥 XP + Streak System</li>
            <li>🏆 Leaderboard Access</li>
            <li className="text-yellow-300">🔒 Full Journey available in Pro+</li>
          </ul>

          <button
            onClick={() => handleSelectPlan(isFamily ? "family_pro" : "pro")}
            className="w-full py-3 rounded-lg bg-blue-600 text-white"
          >
            Start Training
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Best for quick daily practice
          </p>
        </div>

        <div className="bg-[#0B1220] border border-[#1F2A44] rounded-2xl p-6 transition-all duration-200 active:scale-[0.97] cursor-pointer">
          <h2 className="text-xl font-bold text-white mb-4">Free</h2>

          <ul className="text-sm text-white space-y-2 mb-6">
            <li>👁️ View full Bible journey</li>
            <li>🔒 Locked experience (preview only)</li>
            <li>🚫 No flashcards</li>
            <li>🚫 No training</li>
          </ul>

          <button
            onClick={() => router.push("/signup")}
            className="w-full py-3 rounded-lg bg-gray-700 text-white"
          >
            Get Started
          </button>
        </div>
      </div>
      </div>
    </section>
  )
}
