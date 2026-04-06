"use client"

import { useState } from "react"

type PaywallProps = {
  reason?: string | null
  onSelectPlan: (plan: "pro" | "pro_plus" | "family_pro" | "family_pro_plus") => void
}

export default function Paywall({ onSelectPlan }: PaywallProps) {
  const [isFamily, setIsFamily] = useState(false)
  const cardClass = "bg-[#121826] border border-gray-800 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
  const primaryButtonClass = "w-full md:w-auto bg-green-500 text-black font-bold rounded-xl px-6 py-3 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 transition transform hover:scale-[1.02] active:scale-[0.98]"
  const secondaryButtonClass = "w-full md:w-auto bg-[#1A2233] border border-gray-700 text-white rounded-xl px-6 py-3 transition-all duration-200 hover:bg-[#222C40] transition transform hover:scale-[1.02] active:scale-[0.98]"

  return (
    <div className="relative min-h-screen bg-[#0B0F1A] px-4 py-16 text-white">
      <div className="absolute left-1/2 top-[-100px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-green-500 opacity-10 blur-[120px]" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center transition-opacity duration-300">
        <h2 className="text-center text-sm text-green-400 mb-2">
          🔒 Your Journey is Locked
        </h2>

        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Become a Bible Athlete
        </h1>

        <p className="text-center text-gray-200 mb-4 text-sm">
          You&apos;ve completed 3 chapters. Continue your journey through the Bible.
        </p>

        <p className="text-gray-200 mb-6 text-center">
          Unlock the full system. Train without limits.
        </p>

        <div className="mb-10 text-center space-y-2 text-sm text-white">
          <p>✨ Full Bible Journey</p>
          <p>♾️ Unlimited Training</p>
          <p>🧠 Smart Recall System</p>
          <p>🔥 XP + Streak System</p>
        </div>

        <div className={`mb-6 flex w-full max-w-md p-1 ${cardClass}`}>
          <button
            onClick={() => setIsFamily(false)}
            className={`flex-1 rounded-md py-2 text-sm font-bold transition-all duration-200 ${
              !isFamily ? "bg-green-500 text-black" : "text-gray-200"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setIsFamily(true)}
            className={`flex-1 rounded-md py-2 text-sm font-bold transition-all duration-200 ${
              isFamily ? "bg-green-500 text-black" : "text-gray-200"
            }`}
          >
            Family (Up to 6)
          </button>
        </div>

        <p className="text-sm text-gray-200 text-center mb-4">
          {isFamily ? "Up to 6 family members" : "Single user plan"}
        </p>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
          <div className={`flex h-full w-full flex-col justify-between p-5 ${cardClass}`}>
            <div className="flex-grow">
              <h2 className="mb-2 text-xl font-bold text-white">Pro</h2>
              <p className="text-gray-200 mb-3">
                {isFamily ? "$19.99 / month" : "$6.99 / month"}
              </p>

              <ul className="text-sm space-y-1 text-white">
                <li>✔ Scripture Recall</li>
                <li>✔ Memory Training</li>
                <li>✔ 🎯 Precision Training</li>
                <li>✔ XP + Daily Streak 🔥</li>
                <li className="text-red-400">✖ No Journey</li>
              </ul>
            </div>

            <div className="mt-6">
              <button
                onClick={() =>
                  onSelectPlan(isFamily ? "family_pro" : "pro")
                }
                className={secondaryButtonClass}
              >
                Continue with Pro
              </button>
            </div>
          </div>

          <div className={`relative flex h-full w-full flex-col justify-between p-5 ${cardClass} border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)]`}>
            <div className="absolute top-3 right-3 bg-green-500 text-black text-xs px-2 py-1 rounded-full font-bold">
              MOST POPULAR
            </div>

            <div className="flex-grow">
              <h2 className="text-xl font-bold text-white mb-2">
                Pro+ 🚀
              </h2>

              <p className="text-gray-200 mb-1">
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

              <p className="text-xs text-gray-200 mt-2">
                Continue your journey beyond Genesis
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() =>
                  onSelectPlan(isFamily ? "family_pro_plus" : "pro_plus")
                }
                className={primaryButtonClass}
              >
                Start My Journey
              </button>

              <p className="text-xs text-center text-gray-200 mt-2">
                Start training in seconds
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-200 mt-6">
          Upgrade anytime to unlock full training
        </p>

        <p className="text-xs text-gray-200 mt-6">
          Cancel anytime • No commitment
        </p>
      </div>
    </div>
  )
}
