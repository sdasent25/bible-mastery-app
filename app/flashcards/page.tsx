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
    <div className="min-h-screen flex items-center justify-center bg-red-600">
      <h1 className="text-5xl font-bold text-white">
        FLASHCARD TEST SCREEN
      </h1>
    </div>
  )
}
