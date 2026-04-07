"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function PricingSection() {
  const router = useRouter()
  const [isFamily, setIsFamily] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("source") === "journey_pro_plus") {
      document.getElementById("pro-plus")?.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

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

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white text-center mb-10">
        Choose Your Path
      </h1>

      <div className="flex justify-center mb-10">
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

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#0B1220] border border-[#1F2A44] rounded-2xl p-6">
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

        <div className="bg-[#0B1220] border border-blue-500 rounded-2xl p-6">
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
            <li className="text-red-400">🚫 No Journey Access</li>
          </ul>

          <button
            onClick={() => handleSelectPlan("pro")}
            className="w-full py-3 rounded-lg bg-blue-600 text-white"
          >
            Start Training
          </button>
        </div>

        <div id="pro-plus" className="bg-[#0B1220] border border-green-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.35)]">
          <h2 className="text-xl font-bold text-white mb-2">
            Pro+ {isFamily && "Family"} 🚀
          </h2>
          <p className="text-green-400 font-semibold mb-4">
            {isFamily ? "$29.99 / month" : "$12.99 / month"}
          </p>

          {isFamily && (
            <p className="text-sm text-white mb-4 text-center">
              Up to 6 members included
            </p>
          )}

          <ul className="text-white text-sm space-y-2 mb-6">
            <li>🔥 Full Bible Journey (Core Experience)</li>
            <li>⚡ Unlimited Training</li>
            <li>🧠 Scholar Mode (review past content)</li>
            <li>🎯 Deep Retention System</li>
            <li>🏆 Leaderboard Access</li>
            <li>✅ Everything in Pro</li>
          </ul>

          <button
            onClick={() => handleSelectPlan("pro_plus")}
            className="w-full py-3 rounded-lg bg-green-500 text-black font-bold"
          >
            Start My Journey
          </button>
        </div>
      </div>
    </section>
  )
}
