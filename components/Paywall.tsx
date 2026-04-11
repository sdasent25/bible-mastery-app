"use client"

import { useState } from "react"

export default function Paywall() {
  const [isFamily, setIsFamily] = useState(false)

  const handleCheckout = async (plan: "pro" | "pro_plus" | "family_pro" | "family_pro_plus") => {
    console.log("PLAN CLICKED:", plan)

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })

      console.log("RESPONSE STATUS:", res.status)

      const data = await res.json()
      console.log("RESPONSE DATA:", data)

      if (data.url) {
        window.location.href = "/upgrade"
      } else {
        console.error("NO URL RETURNED")
      }
    } catch (err) {
      console.error("CHECKOUT ERROR:", err)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white px-4 py-16">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
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

        <div className="w-full max-w-md flex bg-[#121826] p-1 rounded-lg mb-6">
          <button
            onClick={() => setIsFamily(false)}
            className={`flex-1 py-2 rounded-md text-sm ${
              !isFamily ? "bg-blue-600 text-white" : "text-gray-200"
            }`}
          >
            Individual
          </button>

          <button
            onClick={() => setIsFamily(true)}
            className={`flex-1 py-2 rounded-md text-sm ${
              isFamily ? "bg-blue-600 text-white" : "text-gray-200"
            }`}
          >
            Family (Up to 6)
          </button>
        </div>

        <p className="text-sm text-gray-200 text-center mb-4">
          {isFamily ? "Up to 6 family members" : "Single user plan"}
        </p>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="w-full bg-[#121826] border border-neutral-800 rounded-xl p-5 flex flex-col justify-between h-full">
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-white mb-2">Pro</h2>
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
                  handleCheckout(isFamily ? "family_pro" : "pro")
                }
                className="w-full bg-gray-700 text-white hover:bg-neutral-600 transition py-2 rounded-lg font-semibold active:scale-95"
              >
                Continue with Pro
              </button>
            </div>
          </div>

          <div className="relative w-full bg-[#121826] border-2 border-green-500 rounded-xl p-5 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.45)] flex flex-col justify-between h-full">
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
                  handleCheckout(isFamily ? "family_pro_plus" : "pro_plus")
                }
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded-lg transition active:scale-95"
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
