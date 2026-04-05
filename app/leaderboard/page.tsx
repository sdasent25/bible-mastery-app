"use client"

import { useEffect, useRef, useState } from "react"
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
  const [tab, setTab] = useState<"family" | "global">("family")
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})

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

  useEffect(() => {
    if (!users.length || !currentUser) return

    const el = rowRefs.current[currentUser]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [users, currentUser])

  if (loading) {
    return <div className="text-center text-white/70 mt-10">Loading...</div>
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

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setTab("family")}
          className={`px-4 py-2 rounded-xl ${
            tab === "family"
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-white/70"
          }`}
        >
          Family
        </button>

        <button
          onClick={() => setTab("global")}
          className={`px-4 py-2 rounded-xl ${
            tab === "global"
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-white/70"
          }`}
        >
          Global
        </button>
      </div>

      {tab === "global" ? (
        <div className="text-center text-white/70 mt-4 space-y-2">
          <h2 className="text-xl font-semibold">Global Leaderboard</h2>
          <p>Coming Soon 🚀</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden">
          {users.map((user, index) => {
            const isCurrent = user.user_id === currentUser

            return (
              <div
                key={user.user_id}
                ref={(el) => {
                  rowRefs.current[user.user_id] = el
                }}
                className={`flex items-center justify-between px-5 py-4 border-b border-neutral-800 transition ${
                  isCurrent
                    ? "bg-blue-600/20 border-l-4 border-blue-500 scale-[1.01]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
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
      )}
    </div>
  )
}
