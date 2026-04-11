"use client"

import { useState } from "react"

export default function UpgradePage() {
  const [isFamily, setIsFamily] = useState(false)

  const handleCheckout = async (plan: "pro" | "pro_plus" | "family_pro" | "family_pro_plus") => {
    console.log("🔥 CLICK TRIGGERED:", plan)

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })

      console.log("🔥 RESPONSE STATUS:", res.status)

      const text = await res.text()
      console.log("🔥 RAW RESPONSE:", text)

      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error("❌ JSON PARSE FAILED")
      }

      console.log("🔥 PARSED DATA:", data)

      if (data?.url) {
        console.log("✅ REDIRECTING TO:", data.url)
        window.location.href = data.url
      } else {
        alert("❌ No URL returned from backend")
      }

    } catch (err) {
      console.error("❌ FETCH ERROR:", err)
      alert("Checkout failed")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Upgrade Your Plan</h1>

      <div className="flex mb-6 gap-4">
        <button
          onClick={() => setIsFamily(false)}
          className={`px-4 py-2 rounded ${!isFamily ? "bg-blue-600" : "bg-gray-700"}`}
        >
          Individual
        </button>

        <button
          onClick={() => setIsFamily(true)}
          className={`px-4 py-2 rounded ${isFamily ? "bg-blue-600" : "bg-gray-700"}`}
        >
          Family
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => handleCheckout(isFamily ? "family_pro" : "pro")}
          className="bg-gray-700 py-3 rounded font-bold"
        >
          Continue with Pro
        </button>

        <button
          onClick={() => handleCheckout(isFamily ? "family_pro_plus" : "pro_plus")}
          className="bg-green-500 text-black py-3 rounded font-bold"
        >
          Start My Journey (Pro+)
        </button>
      </div>
    </div>
  )
}
