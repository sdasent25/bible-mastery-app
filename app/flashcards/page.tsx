"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Paywall from "@/components/Paywall"

export default function FlashcardsPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single()

      setPlan(data?.plan || "free")
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
    <div style={{ padding: 20 }}>
      <h1>Flashcards</h1>
      <p>Welcome to your flashcard training system.</p>
    </div>
  )
}
