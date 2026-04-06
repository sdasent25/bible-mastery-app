"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()

  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)

    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes?.user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("xp, streak")
      .eq("id", userRes.user.id)
      .single()

    if (!error && data) {
      setXp(data.xp || 0)
      setStreak(data.streak || 0)
    }

    const email = userRes.user.email

    if (email) {
      const { data: inviteData } = await supabase
        .from("family_invites")
        .select("*")
        .ilike("email", email.trim())
        .is("accepted_at", null)
        .limit(1)
        .single()

      if (inviteData) {
        setInvite(inviteData)
      }
    }

    setLoading(false)
  }

  async function acceptInvite() {
    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes?.user || !invite) return

    const userId = userRes.user.id

    await supabase.from("family_members").insert({
      family_id: invite.family_id,
      user_id: userId,
      role: "member",
    })

    await supabase
      .from("family_invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id)

    setInvite(null)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return <div className="text-center text-gray-400 mt-10">Loading...</div>
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-xl mx-auto space-y-6">
      {invite && (
        <div className="bg-blue-600/10 border border-blue-500 rounded-2xl p-4 space-y-2">
          <p className="text-white font-semibold text-center">
            🎉 You&apos;ve been invited to join a family!
          </p>

          <button
            onClick={acceptInvite}
            className="w-full bg-blue-600 py-3 rounded-xl font-semibold"
          >
            Join Family
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold text-white text-center">
        Dashboard
      </h1>

      <div
        onClick={() => router.push("/flashcards/learn")}
        className="bg-blue-600 hover:bg-blue-500 transition rounded-2xl p-6 cursor-pointer text-center"
      >
        <h2 className="text-xl font-semibold text-white">
          Start Daily Training
        </h2>
        <p className="text-sm text-white/90 mt-1">
          Build your memory and keep your streak alive 🔥
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 flex justify-between items-center">
        <div>
          <p className="text-sm text-white/70">Total XP</p>
          <p className="text-2xl font-bold text-white">{xp}</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-white/70">Streak</p>
          <p className="text-2xl font-bold text-orange-400">
            🔥 {streak}
          </p>
        </div>
      </div>

      {xp === 0 && (
        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 text-center space-y-2">
          <p className="text-white font-semibold">
            Welcome! 👋
          </p>
          <p className="text-white/70 text-sm">
            Start training to begin building your streak
          </p>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3">
        <p className="text-white font-semibold">Daily Progress</p>

        <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: "40%" }}
          />
        </div>

        <p className="text-sm text-white/70">
          Keep going to reach your goal 🎯
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => router.push("/flashcards/learn")}
          className="w-full bg-blue-600 py-4 rounded-xl font-semibold"
        >
          Continue Learning
        </button>

        <button
          onClick={() => window.location.href = "/upgrade"}
          className="w-full bg-green-600 mt-4 py-3 rounded-lg font-bold"
        >
          Upgrade Plan (Test)
        </button>

        <button
          onClick={() => router.push("/flashcards/review")}
          className="w-full bg-neutral-800 py-4 rounded-xl font-semibold"
        >
          Review Flashcards
        </button>

        <button
          onClick={() => router.push("/flashcards/practice")}
          className="w-full bg-neutral-800 py-4 rounded-xl font-semibold"
        >
          Practice Weak Cards
        </button>
      </div>
    </div>
  )
}
