"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function FlashcardsHome() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("user_access")
        .select("final_plan")
        .single()

      if (data?.final_plan === "pro" || data?.final_plan === "pro_plus") {
        setHasAccess(true)
      } else {
        router.push("/pricing?source=flashcards_locked")
      }

      setLoading(false)
    }

    void checkAccess()
  }, [router])

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>
  }

  if (!hasAccess) return null

  return (
    <div className="min-h-screen px-4 py-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Flashcards
      </h1>

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
  )
}
