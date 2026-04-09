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
    <div className="min-h-screen w-full flex justify-center bg-[#050A18]">
      <div className="w-full max-w-xl px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-white text-center">
          Flashcards
        </h1>

        <div className="relative">
          <div className={!hasAccess ? "opacity-60 pointer-events-none" : ""}>
            <motion.div
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
              onClick={() => router.push("/flashcards/review")}
              className="relative overflow-hidden cursor-pointer rounded-2xl p-6 text-center text-white shadow-2xl
                         !bg-gradient-to-r !from-orange-500 !via-red-500 !to-pink-500"
            >
              <div className="absolute inset-0 bg-white/20 blur-2xl opacity-30" />

              <div className="relative z-10">
                <h2 className="text-2xl font-bold">
                  Start Daily Training
                </h2>
                <p className="text-sm mt-2 opacity-90">
                  Review your flashcards and build memory
                </p>
              </div>
            </motion.div>

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
    </div>
  )
}

function GameCard({
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
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 250 }}
      onClick={onClick}
      className="relative overflow-hidden cursor-pointer rounded-xl p-4 border border-white/10
                 !bg-gradient-to-br !from-neutral-900 !to-neutral-800
                 shadow-lg hover:shadow-xl text-white"
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition duration-300" />

      <div className="relative z-10">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm opacity-80 mt-1">{desc}</p>
      </div>
    </motion.div>
  )
}
