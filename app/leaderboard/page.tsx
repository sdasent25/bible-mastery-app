"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type LeaderboardEntry = {
  id: string
  name: string
  score: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [hasFamily, setHasFamily] = useState(true)
  const [planType, setPlanType] = useState("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("user_access")
        .select("final_plan")
        .single()

      console.log("FINAL PLAN:", data?.final_plan)

      if (data?.final_plan) setPlanType(data.final_plan)
      setLoading(false)
    }

    void loadPlan()
  }, [])

  const hasAccess = planType === "pro" || planType === "pro_plus"

  useEffect(() => {
    const loadLeaderboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      const { data: membership } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!membership?.family_id) {
        setHasFamily(false)
        return
      }

      const { data: members } = await supabase
        .from("family_members")
        .select("user_id")
        .eq("family_id", membership.family_id)

      const userIds = members?.map((member) => member.user_id) || []

      if (userIds.length === 0) return

      const { data: scores } = await supabase
        .from("weekly_scores")
        .select("user_id, score")

      if (!scores) return

      const formatted = scores
        .filter((score) => userIds.includes(score.user_id))
        .map((score) => ({
          id: score.user_id,
          name: score.user_id === user.id ? "You" : "Member",
          score: score.score || 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)

      setLeaderboard(formatted)
    }

    void loadLeaderboard()
  }, [])

  if (!loading && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Leaderboard is available on Pro and Pro+ plans
          </h2>
          <p className="text-white mb-6">
            Upgrade to compete and track your progress
          </p>
          <button
            onClick={() => router.push("/upgrade")}
            className="bg-green-500 px-6 py-3 rounded-lg text-black font-bold"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    )
  }

  const currentUser = leaderboard.find((user) => user.name === "You")
  const users = leaderboard
  const currentIndex = leaderboard.findIndex((user) => user.id === currentUserId)
  let nudgeMessage = ""

  if (leaderboard.length === 0) {
    nudgeMessage = "Start training to join the leaderboard"
  } else if (currentIndex === 0) {
    nudgeMessage = "🔥 You're leading the family — keep it up!"
  } else if (currentIndex > 0) {
    const above = leaderboard[currentIndex - 1]
    const current = leaderboard[currentIndex]

    const diff = above.score - current.score

    if (diff <= 5) {
      nudgeMessage = `🔥 You're only ${diff} points from 1st`
    } else {
      nudgeMessage = `You're ${diff} points behind ${above.name}`
    }
  } else {
    nudgeMessage = "Stay consistent to climb the leaderboard"
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Family Leaderboard
      </h1>

      <div className="flex gap-2 justify-center">
        <button
          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          Family
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-700 bg-[#121826] p-5 text-center">
        <p className="text-sm text-white">You</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white">
          Weekly Score
        </p>
        <p className="mt-2 text-3xl font-bold text-white">
          {currentUser?.score ?? 0}
        </p>
      </div>

      {!hasFamily ? (
        <div className="rounded-2xl border border-neutral-700 bg-[#121826] p-6 text-center text-white">
          Create or join a family to compete
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-neutral-700 bg-[#121826] p-6 text-center text-white">
          Create or join a family to compete
        </div>
      ) : (
        <>
          <div className="text-center mb-4 text-sm text-green-400 font-semibold">
            {nudgeMessage}
          </div>

          <div className="flex flex-col items-center gap-3">
            {users.map((user, index) => {
              const isCurrentUser = user.id === currentUserId
              const isTopThree = index < 3
              const topThreeStyles =
                index === 0
                  ? "scale-[1.03] border-yellow-400/70 shadow-[0_0_35px_rgba(250,204,21,0.25)]"
                  : index === 1
                    ? "scale-[1.01] border-slate-300/50 shadow-[0_0_25px_rgba(226,232,240,0.15)]"
                    : index === 2
                      ? "scale-[1.01] border-amber-600/60 shadow-[0_0_25px_rgba(217,119,6,0.18)]"
                      : ""

              return (
                <div
                  key={user.id}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${
                    isCurrentUser
                      ? "bg-[#1E293B] border-green-500"
                      : "bg-[#121826] border-gray-700"
                  } ${isTopThree ? topThreeStyles : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-gray-300 ${
                      isTopThree ? "text-base" : "text-sm"
                    }`}>
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </span>

                    <span className={`text-white ${
                      isTopThree ? "text-lg font-bold" : "font-medium"
                    }`}>
                      {user.name}
                    </span>
                  </div>

                  <span className="font-bold text-green-400">
                    {user.score}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
