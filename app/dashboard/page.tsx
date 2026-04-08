"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUserPlan } from "@/lib/userPlan"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const level = Math.floor(xp / 500) + 1
  const [invite, setInvite] = useState<any>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [, setInFamily] = useState(false)
  const [dailyTarget, setDailyTarget] = useState(1)
  const [timelineDays, setTimelineDays] = useState(365)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkOnboarding() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .single()

      if (!profile || profile.onboarding_complete === false) {
        router.replace("/onboarding")
      }
    }

    checkOnboarding()
  }, [router])

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      console.log("ACTIVE USER:", {
        email: data.user?.email,
        id: data.user?.id,
        error
      })
    }

    checkUser()
  }, [])

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
      .maybeSingle()

    if (!error && data) {
      setXp(data.xp || 0)
      setStreak(data.streak || 0)
    }

    const { data: access } = await supabase
      .from("user_access")
      .select("final_plan, in_family")
      .single()

    console.log("FINAL PLAN:", access?.final_plan)
    setPlan(access?.final_plan ?? null)
    setInFamily(access?.in_family === true)

    if (access?.final_plan !== "free") {
      setInvite(null)
    }

    const plan = await getUserPlan()
    if (plan) {
      setDailyTarget(plan.segmentsPerDay)
      setTimelineDays(plan.timelineDays)
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
    const upgrade = searchParams.get("upgrade")

    if (upgrade === "pro_plus") {
      router.replace("/onboarding/pro-plus")
    }
  }, [searchParams, router])

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return <div className="text-center text-gray-400 mt-10">Loading...</div>
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-xl mx-auto space-y-6">
      {plan === "free" && (
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4 text-center mb-4">
          <p className="text-white font-semibold">
            🔒 Preview Mode
          </p>
          <p className="text-white text-sm mt-1">
            You&apos;re exploring Bible Athlete. Upgrade to unlock the full experience.
          </p>
        </div>
      )}

      {invite && plan === "free" && !loading && (
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
          <p className="text-sm text-white/70">Level {level}</p>
          <p className="text-2xl font-bold text-white">{xp} XP</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-white/70">Streak</p>
          <p className="text-2xl font-bold text-orange-400">
            🔥 {streak}
          </p>

          {streak >= 3 && (
            <p className="text-xs text-orange-300 mt-1">
              Keep it going
            </p>
          )}
        </div>
      </div>

      {streak > 0 && (
        <div className="bg-orange-500/10 border border-orange-400 rounded-xl p-3 text-center">
          <p className="text-orange-300 text-sm">
            🔥 Don’t break your streak
          </p>
        </div>
      )}

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
          {plan === "free"
            ? "Preview the full Bible training system"
            : "Continue your daily journey"}
        </p>
        <p className="text-xs text-white/50">
          {plan === "free"
            ? "Upgrade to unlock your full journey and training"
            : `Based on your ${timelineDays}-day plan · target ${dailyTarget} per day`}
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => {
            if (plan === "pro_plus") {
              router.push("/journey")
              return
            }

            router.push("/pricing?source=journey_locked")
          }}
          className="w-full bg-blue-600 py-4 rounded-xl font-semibold"
        >
          {plan === "free"
            ? "Upgrade to Pro+ to Start Journey"
            : plan === "pro"
            ? "Unlock Your Journey"
            : "Continue Learning"}
        </button>

        {plan === "free" && (
          <button
            onClick={() => router.push("/pricing")}
            className="w-full bg-green-500 py-4 rounded-xl font-bold text-black"
          >
            View Plans
          </button>
        )}

        {plan === "free" && (
          <div className="mt-4 text-center text-sm text-yellow-400">
            Free plan: 1 segment per day. Upgrade to unlock full journey.
          </div>
        )}

        <button
          onClick={() => window.location.href = "/pricing?source=dashboard_upgrade"}
          className="w-full bg-green-600 mt-4 py-3 rounded-lg font-bold"
        >
          Upgrade Plan (Test)
        </button>

        <button
          onClick={() => router.push("/flashcards/review")}
          className={`w-full bg-neutral-800 py-4 rounded-xl font-semibold ${plan === "free" ? "opacity-60" : ""}`}
        >
          {plan === "free" ? "Review Flashcards · Upgrade for full access" : "Review Flashcards"}
        </button>

        <button
          onClick={() => router.push("/flashcards/practice")}
          className={`w-full bg-neutral-800 py-4 rounded-xl font-semibold ${plan === "free" ? "opacity-60" : ""}`}
        >
          {plan === "free" ? "Practice Weak Cards · Upgrade for full access" : "Practice Weak Cards"}
        </button>
      </div>
    </div>
  )
}
