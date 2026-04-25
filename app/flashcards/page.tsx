"use client"

import { useEffect, useState } from "react"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"

export default function FlashcardsPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const plan = await getUserPlan()
      setPlan(plan)
      setLoading(false)
    }

    run()
  }, [])

  const allowedPlans = [
    "pro",
    "pro_plus",
    "family_pro",
    "family_pro_plus",
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  if (!allowedPlans.includes(plan)) {
    return (
      <Paywall
        title="🔒 Flashcards Locked"
        message="Upgrade to Pro to unlock flashcards and start memorizing scripture."
      />
    )
  }

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Flashcard Training
      </h1>

      <div className="mb-6">
        <div
          className="bg-blue-600 rounded-2xl p-6 cursor-pointer hover:scale-105 transition"
          onClick={() => window.location.href = "/games/flashcard-sprint"}
        >
          <h2 className="text-xl font-semibold">
            Continue Training
          </h2>
          <p className="text-sm text-gray-100">
            Train your memory and build recall
          </p>
        </div>
      </div>

      <div className="mb-3 text-gray-300 text-sm uppercase tracking-wide">
        Training
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className="bg-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-700 transition"
          onClick={() => window.location.href = "/flashcards/review"}
        >
          <h3 className="font-semibold">🧠 Weak Cards</h3>
          <p className="text-sm text-gray-300">
            Focus on what you struggle with
          </p>
        </div>

        <div
          className="bg-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-700 transition"
          onClick={() => window.location.href = "/games/flashcard-sprint"}
        >
          <h3 className="font-semibold">⚡ Sprint Mode</h3>
          <p className="text-sm text-gray-300">
            Fast-paced recall training (no XP)
          </p>
        </div>
      </div>

      <div className="mb-3 text-gray-300 text-sm uppercase tracking-wide">
        Games
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className="bg-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-700 transition"
          onClick={() => window.location.href = "/games/fill-in-the-blank"}
        >
          <h3 className="font-semibold">
            ✍️ Fill in the Blank
          </h3>
          <p className="text-sm text-gray-300">
            Test your recall with guided prompts
          </p>
        </div>

        <div
          className="bg-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-700 transition"
          onClick={() => window.location.href = "/games/build-the-verse"}
        >
          <h3 className="font-semibold">🧠 Build the Verse</h3>
          <p className="text-sm text-gray-300">
            Reconstruct verses from memory
          </p>
        </div>

        <div
          className="bg-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-700 transition"
          onClick={() => window.location.href = "/games/matching"}
        >
          <h3 className="font-semibold">🧩 Matching</h3>
          <p className="text-sm text-gray-300">
            Match verses to references
          </p>
        </div>
      </div>

      <div className="mb-3 text-gray-300 text-sm uppercase tracking-wide">
        Manage
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="bg-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-700 transition"
          onClick={() => window.location.href = "/flashcards/list"}
        >
          <h3 className="font-semibold">📚 My Cards</h3>
          <p className="text-sm text-gray-300">
            View and manage your flashcards
          </p>
        </div>

        <div
          className="bg-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-700 transition"
          onClick={() => window.location.href = "/flashcards/create"}
        >
          <h3 className="font-semibold">➕ Create Cards</h3>
          <p className="text-sm text-gray-300">
            Add your own verses to train
          </p>
        </div>
      </div>
    </div>
  )
}
