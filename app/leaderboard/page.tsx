"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type LeaderboardUser = {
  user_id: string
  family_id: string
  xp: number
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [noFamily, setNoFamily] = useState(false)

  async function load() {
    setLoading(true)

    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes?.user) {
      setLoading(false)
      return
    }

    const userId = userRes.user.id
    setCurrentUser(userId)

    const { data: member } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", userId)
      .single()

    if (!member?.family_id) {
      setNoFamily(true)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("family_leaderboard")
      .select("*")
      .eq("family_id", member.family_id)
      .order("xp", { ascending: false })

    if (!error && data) {
      setUsers(data as LeaderboardUser[])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="text-center text-white/80 mt-10">
        Loading leaderboard...
      </div>
    )
  }

  if (noFamily) {
    return (
      <div className="text-center text-white/80 mt-10 space-y-3">
        <h2 className="text-xl font-semibold">No Family Found</h2>
        <p className="text-sm text-white/60">
          Join or create a family plan to see leaderboard
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Leaderboard
      </h1>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl divide-y divide-neutral-800">
        {users.map((user, index) => {
          const isCurrent = user.user_id === currentUser

          return (
            <div
              key={user.user_id}
              className={`flex items-center justify-between px-5 py-4 ${
                isCurrent ? "bg-blue-600/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">
                  #{index + 1}
                </span>

                <span className="text-white/90">
                  {isCurrent ? "You" : "Member"}
                </span>
              </div>

              <span className="text-white font-semibold">
                {user.xp} XP
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
