"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

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
    <div className="min-h-screen px-4 py-6 max-w-xl mx-auto space-y-6">
      
      <h1 className="text-3xl font-bold text-white text-center">
        Flashcards
      </h1>

      <div className="relative">

        <div className={!hasAccess ? "opacity-60 pointer-events-none" : ""}>

          {/* 🔥 PRIMARY CARD */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => router.push("/flashcards/review")}
            className="cursor-pointer rounded-2xl p-6 text-center text-white shadow-xl
                       bg-gradient-to-r from-orange-500 to-red-500"
          >
            <h2 className="text-xl font-bold">
              Start Daily Training
            </h2>
            <p className="text-sm mt-2 opacity-90">
              Review your flashcards and build memory
            </p>
          </motion.div>

          {/* 🔥 GRID */}
          <div className="space-y-4 mt-6">

            <Card
              title="Learn"
              desc="Memorize scripture step by step"
              onClick={() => router.push("/flashcards/learn")}
            />

            <Card
              title="Review Flashcards"
              desc="Go through all your flashcards"
              onClick={() => router.push("/flashcards/review")}
            />

            <Card
              title="Practice Weak Cards"
              desc="Focus on the ones you struggle with"
              onClick={() => router.push("/flashcards/practice")}
            />

            <Card
              title="Add Flashcard"
              desc="Add your own verses to learn"
              onClick={() => router.push("/flashcards/create")}
            />

          </div>
        </div>

        {/* 🔒 LOCK OVERLAY */}
        {!hasAccess && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0B1220] border border-yellow-500 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-xl"
            >
              <h2 className="text-xl font-bold text-white mb-2">
                🔒 Flashcards Locked
              </h2>

              <p className="text-white text-sm mb-4">
                Upgrade to Pro to unlock the full flashcard system
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push("/pricing")}
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-black font-bold px-6 py-3 rounded-lg w-full"
              >
                Upgrade to Pro
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

/* 🔥 REUSABLE CARD */
function Card({
  title,
  desc,
  onClick,
}: {
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className="cursor-pointer rounded-xl p-4 border border-neutral-700
                 bg-gradient-to-br from-neutral-900 to-neutral-800
                 shadow-md text-white"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm opacity-80 mt-1">{desc}</p>
    </motion.div>
  )
}