"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function FlashcardsHome() {
  const router = useRouter()
  const [planType, setPlanType] = useState("free")

  useEffect(() => {
    const loadPlan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("user_access")
        .select("final_plan")
        .single()

      console.log("FINAL PLAN:", data?.final_plan)

      if (data?.final_plan) setPlanType(data.final_plan)
    }

    void loadPlan()
  }, [])

  const hasAccess = planType === "pro" || planType === "pro_plus"

  return (
    <div className="min-h-screen px-4 py-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Flashcards
      </h1>

      <div className="relative">
        <div className={!hasAccess ? "opacity-60 pointer-events-none" : ""}>
          <div
            onClick={() => router.push("/flashcards/review")}
            className="bg-blue-600 hover:bg-blue-500 transition rounded-2xl p-6 cursor-pointer text-center"
          >
            <h2 className="text-xl font-semibold text-white">
              Start Daily Training
            </h2>
            <p className="text-sm text-white mt-1">
              Review your flashcards and build memory
            </p>
          </div>

          <div className="space-y-3 mt-6">
            <div
              onClick={() => router.push("/flashcards/learn")}
              className="bg-neutral-900 hover:bg-neutral-800 hover:brightness-110 transition rounded-xl p-4 cursor-pointer border border-neutral-600"
            >
              <h3 className="text-white font-semibold">Learn</h3>
              <p className="text-sm text-white">
                Memorize scripture step by step
              </p>
            </div>

            <div
              onClick={() => router.push("/flashcards/review")}
              className="bg-neutral-900 hover:bg-neutral-800 hover:brightness-110 transition rounded-xl p-4 cursor-pointer border border-neutral-600"
            >
              <h3 className="text-white font-semibold">Review Flashcards</h3>
              <p className="text-sm text-white">
                Go through all your flashcards
              </p>
            </div>

            <div
              onClick={() => router.push("/flashcards/practice")}
              className="bg-neutral-900 hover:bg-neutral-800 hover:brightness-110 transition rounded-xl p-4 cursor-pointer border border-neutral-600"
            >
              <h3 className="text-white font-semibold">Practice Weak Cards</h3>
              <p className="text-sm text-white">
                Focus on the ones you struggle with
              </p>
            </div>

            <div
              onClick={() => router.push("/flashcards/create")}
              className="bg-neutral-900 hover:bg-neutral-800 hover:brightness-110 transition rounded-xl p-4 cursor-pointer border border-neutral-600"
            >
              <h3 className="text-white font-semibold">Add Flashcard</h3>
              <p className="text-sm text-white">
                Add your own verses to learn
              </p>
            </div>
          </div>
        </div>

        {!hasAccess && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#0B1220] border border-yellow-500 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">
                🔒 Flashcards Locked
              </h2>

              <p className="text-white text-sm mb-4">
                Upgrade to Pro to unlock the full flashcard system
              </p>

              <button
                onClick={() => router.push("/pricing")}
                className="bg-green-500 text-black font-bold px-6 py-3 rounded-lg w-full"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
