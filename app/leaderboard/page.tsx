"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

type LeaderboardEntry = {
  id: string
  name: string
  score: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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

      if (!membership?.family_id) return

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

      setLeaderboard(formatted)
    }

    void loadLeaderboard()
  }, [])

  const currentUser = leaderboard.find((user) => user.name === "You")
  const users = leaderboard

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Leaderboard
      </h1>

      <div className="flex gap-2 justify-center">
        <button
          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          Family
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-700 bg-[#121826] p-5 text-center">
        <p className="text-sm text-white/60">You</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">
          Weekly Score
        </p>
        <p className="mt-2 text-3xl font-bold text-white">
          {currentUser?.score ?? 0}
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-neutral-700 bg-[#121826] p-6 text-center text-white/70">
          Join a family to compete on the leaderboard
        </div>
      ) : (
        <div className="max-w-xl mx-auto mt-6 space-y-3 px-4">
          {users.map((user, index) => {
            const isCurrentUser = user.id === currentUserId

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                  isCurrentUser
                    ? "bg-[#1E293B] border-green-500"
                    : "bg-[#121826] border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300">
                    #{index + 1}
                  </span>

                  <span className="font-medium text-white">
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
      )}
    </div>
  )
}
