"use client"

import { useState } from "react"

type PaywallProps = {
  reason?: string | null
  onSelectPlan: (plan: "pro" | "pro_plus" | "family_pro" | "family_pro_plus") => void
}

export default function Paywall({ onSelectPlan }: PaywallProps) {
  const [isFamily, setIsFamily] = useState(false)

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-3">
        Become a Bible Athlete
      </h1>

      <p className="text-center text-white/70 mb-8">
        Unlock the full system. Train without limits.
      </p>

      <div className="mb-10 text-center space-y-2 text-sm text-white/80">
        <p>✨ Full Bible Journey</p>
        <p>♾️ Unlimited Training</p>
        <p>🧠 Smart Recall System</p>
        <p>🔥 XP + Streak System</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="flex bg-[#121826] p-1 rounded-lg mb-6">
          <button
            onClick={() => setIsFamily(false)}
            className={`flex-1 py-2 rounded-md text-sm ${
              !isFamily ? "bg-blue-600 text-white" : "text-gray-300"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setIsFamily(true)}
            className={`flex-1 py-2 rounded-md text-sm ${
              isFamily ? "bg-blue-600 text-white" : "text-gray-300"
            }`}
          >
            Family (Up to 6)
          </button>
        </div>

        <p className="text-xs text-gray-300 text-center mb-4">
          {isFamily
            ? "Share with up to 6 family members"
            : "Single user plan"}
        </p>

        <div className="bg-[#121826] border border-neutral-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-gray-300 mb-3">
            {isFamily ? "$19.99 / month" : "$6.99 / month"}
          </p>

          <ul className="text-sm space-y-1 text-white/90">
            <li>✔ Flashcards</li>
            <li>✔ Active Recall</li>
            <li>✔ 🎯 Targeted Practice</li>
            <li>✔ XP + Streak</li>
            <li className="text-red-400">✖ No Journey</li>
          </ul>

          <button
            onClick={() =>
              onSelectPlan(isFamily ? "family_pro" : "pro")
            }
            className="mt-4 w-full bg-neutral-700 hover:bg-neutral-600 transition py-2 rounded-lg font-semibold active:scale-95"
          >
            Continue with Pro
          </button>
        </div>

        <div className="relative bg-[#121826] border-2 border-green-500 rounded-xl p-5 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.45)]">
          <div className="absolute top-3 right-3 bg-green-500 text-black text-xs px-2 py-1 rounded-full font-bold">
            MOST POPULAR
          </div>

          <h2 className="text-xl font-bold mb-2">
            Pro+ 🚀
          </h2>

          <p className="text-gray-300 mb-1">
            {isFamily ? "$29.99 / month" : "$12.99 / month"}
          </p>
          <p className="text-xs text-green-400 mb-2">
            {isFamily ? "Best value for families" : "Only $6 more than Pro"}
          </p>

          <ul className="text-sm space-y-1 text-white">
            <li>✔ Full Bible Journey</li>
            <li>✔ Unlimited Training</li>
            <li>✔ Scholar Mode</li>
            <li>✔ Full Progression</li>
            <li>✔ Everything in Pro</li>
          </ul>

          <p className="text-xs text-white/60 mt-2">
            Continue your journey beyond Genesis
          </p>

          <button
            onClick={() =>
              onSelectPlan(isFamily ? "family_pro_plus" : "pro_plus")
            }
            className="mt-4 w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded-lg transition active:scale-95"
          >
            Start My Journey
          </button>
        </div>
      </div>

      <p className="text-xs text-white/50 mt-6">
        Upgrade anytime to unlock full training
      </p>
    </div>
  )
}
