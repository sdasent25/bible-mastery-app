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

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white text-center mb-10">
          Choose Your Path
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#0B1220] border border-[#1F2A44] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Free</h2>

            <ul className="text-sm text-gray-300 space-y-2 mb-6">
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
            <h2 className="text-xl font-bold text-white mb-4">Pro</h2>
            <p className="text-blue-400 font-semibold mb-4">$6.99 / month</p>

            <ul className="text-sm text-gray-300 space-y-2 mb-6">
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

          <div className="bg-[#0B1220] border border-green-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.35)]">
            <h2 className="text-xl font-bold text-white mb-2">
              Pro+ 🚀
            </h2>
            <p className="text-green-400 font-semibold mb-4">
              $12.99 / month
            </p>

            <ul className="text-sm text-gray-300 space-y-2 mb-6">
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
      </div>
    </div>
  )
}
