"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserPlan } from "@/lib/getUserPlan"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const [plan, setPlan] = useState("free")
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [memberLimit, setMemberLimit] = useState<number | null>(null)

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const currentPlan = await getUserPlan()
      setPlan(currentPlan)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: membership } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .is("removed_at", null)
        .maybeSingle()

      if (!membership?.family_id) return

      const familyId = membership.family_id

      const [{ count }, { data: family }] = await Promise.all([
        supabase
          .from("family_members")
          .select("*", { count: "exact", head: true })
          .eq("family_id", familyId)
          .is("removed_at", null),
        supabase
          .from("families")
          .select("member_limit")
          .eq("id", familyId)
          .maybeSingle(),
      ])

      setMemberCount(count || 0)
      setMemberLimit(family?.member_limit || 4)
    }

    run()
  }, [])

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-sm text-zinc-300">Current Plan: {plan}</p>

        {plan === "free" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            Free Plan - Limited Access
          </div>
        )}

        {plan === "pro" && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            Pro Plan - Full Access
          </div>
        )}

        {plan === "pro_plus" && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-300">
            Pro+ Plan - Unlimited Access
          </div>
        )}

        {memberCount !== null && memberLimit !== null && (
          <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
              Family Usage
            </p>
            <p className="mt-3 text-3xl font-black text-white">
              {memberCount} / {memberLimit}
            </p>
            <p className="mt-2 text-sm text-cyan-100">
              Members used
            </p>
          </div>
        )}

        <button
          onClick={() => router.push("/journey")}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-lg font-semibold transition"
        >
          Start Daily Training
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between">
          <div>
            <p className="text-sm text-white">Level</p>
            <p className="text-lg font-semibold text-white">1</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-white">Streak</p>
            <p className="text-lg font-semibold text-white">🔥 0</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-white mb-2">Daily Progress</p>

          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[30%]" />
          </div>

          <p className="text-xs text-white mt-2">
            Continue your daily journey
          </p>
        </div>
      </div>
    </div>
  )
}
