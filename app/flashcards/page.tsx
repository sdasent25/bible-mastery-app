"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import GameCard from "@/components/ui/GameCard"
import { useRouter } from "next/navigation"

export default function FlashcardsHome() {
  const router = useRouter()
  const [planType, setPlanType] = useState<string | null>(null)

  useEffect(() => {
    const loadPlan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("user_access")
        .select("final_plan")
        .eq("user_id", user.id)
        .single()

      const plan = data?.final_plan ?? "free"
      setPlanType(plan)

      if (plan === "free") {
        router.push("/pricing?source=flashcards_locked")
      }
    }

    void loadPlan()
  }, [])

  const hasAccess = planType === "pro" || planType === "pro_plus"

  if (planType === null) return null

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#050A18]">
      <div className="w-full max-w-xl px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-white text-center">
          Flashcards
        </h1>

        <div className="relative">
          <div className={!hasAccess ? "opacity-60 pointer-events-none" : ""}>
            <GameCard
              title="Start Daily Training"
              desc="Review your flashcards and build memory"
              onClick={() => router.push("/flashcards/review")}
              variant="primary"
            />

            <div className="space-y-4 mt-6">
              <GameCard
                title="Learn"
                desc="Memorize scripture step by step"
                onClick={() => router.push("/flashcards/learn")}
              />

              <GameCard
                title="Review Flashcards"
                desc="Go through all your flashcards"
                onClick={() => router.push("/flashcards/review")}
              />

              <GameCard
                title="Practice Weak Cards"
                desc="Focus on the ones you struggle with"
                onClick={() => router.push("/flashcards/practice")}
              />

              <GameCard
                title="Add Flashcard"
                desc="Add your own verses to learn"
                onClick={() => router.push("/flashcards/create")}
              />
            </div>
          </div>

          {!hasAccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="bg-[#0B1220] border border-yellow-500 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-xl"
              >
                <h2 className="text-xl font-bold text-white mb-2">
                  🔒 Flashcards Locked
                </h2>

                <p className="text-white text-sm mb-4">
                  Upgrade to Pro to unlock the full flashcard system
                </p>

                <button
                  onClick={() => router.push("/pricing")}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 text-black font-bold px-6 py-3 rounded-lg w-full"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
