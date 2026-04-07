"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function PricingContextBanner() {
  const searchParams = useSearchParams()
  const source = searchParams.get("source")

  useEffect(() => {
    if (source === "journey_pro_plus") {
      document.getElementById("pro-plus")?.scrollIntoView({ behavior: "smooth" })
    }
  }, [source])

  if (source !== "journey_pro_plus") return null

  return (
    <div className="max-w-xl mx-auto mb-8 bg-[#0B1220] border border-green-500 rounded-2xl p-6 text-center">
      <h2 className="text-2xl font-bold text-white mb-2">
        🚀 You Started Your Journey
      </h2>

      <p className="text-white mb-4">
        You completed your preview. Continue through the full Bible and build real consistency.
      </p>

      <p className="text-sm text-yellow-400">
        Your progress is waiting - don&apos;t stop now.
      </p>
    </div>
  )
}
