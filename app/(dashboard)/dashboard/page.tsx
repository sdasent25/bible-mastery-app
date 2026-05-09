"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  getGenesisMissionArt,
  getGenesisMissionMeta,
} from "@/lib/genesisCampaign"
import { getUserPlan as getPlanType } from "@/lib/getUserPlan"
import { getProgramById } from "@/lib/programs"
import { getCompletedProgramSegmentCount } from "@/lib/campaignProgress"
import { getProgramProgress, getResumeSegmentIndex } from "@/lib/programProgress"
import { hasCompletedToday } from "@/lib/streak"
import { createClient } from "@/lib/supabase/client"
import { getUserPlan } from "@/lib/userPlan"

type FamilyMember = {
  id: string
  user_id: string
  role: string
  profiles?: {
    name?: string | null
  } | {
    name?: string | null
  }[] | null
}

type MasteryRow = {
  segment: string
  mastered: boolean
}

type DashboardState = {
  playerName: string
  currentSegmentLabel: string
  segmentNumber: number
  totalSegments: number
  completedMissionCount: number
  genesisProgressPercent: number
  masteryCount: number
  masteryPercent: number
  missionTitle: string
  missionSubtitle: string
  missionAtmosphere: string
  missionArt: string
  continueHref: string
  currentCampaignHref: string
  dailyMissionComplete: boolean
  xpEarned: number
  streak: number
  nextMissionTitle: string
  nextMissionLabel: string
}

function getProfileName(profile: FamilyMember["profiles"]) {
  if (Array.isArray(profile)) {
    return profile[0]?.name || "Member"
  }

  return profile?.name || "Member"
}

function getPlanBadge(plan: string) {
  if (plan === "pro_plus") {
    return "Pro+"
  }

  if (plan === "family_pro_plus") {
    return "Family Pro+"
  }

  if (plan === "pro") {
    return "Pro"
  }

  if (plan === "family_pro") {
    return "Family Pro"
  }

  return "Free"
}

function weeklyDots(streak: number) {
  const litCount = Math.max(0, Math.min(streak, 7))
  return Array.from({ length: 7 }, (_, index) => index < litCount)
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgradePlan = searchParams.get("upgrade")
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState("free")
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null)
  const [trainingEnabled, setTrainingEnabled] = useState(true)
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [memberLimit, setMemberLimit] = useState<number | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [membershipId, setMembershipId] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [upgradeMessage, setUpgradeMessage] = useState("")
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [isLeavingFamily, setIsLeavingFamily] = useState(false)

  useEffect(() => {
    let active = true

    const fallbackPlan = {
      userId: "",
      timelineDays: 365,
      segmentsPerDay: 1,
      trainingEnabled: true,
      estimatedDays: 365,
    }

    async function loadDashboard() {
      try {
        const supabase = createClient()
        const currentPlan = await getPlanType()

        if (!active) return
        setPlan(currentPlan)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace("/login")
          return
        }

        if (!active) return
        setUserId(user.id)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("name, handle, onboarding_complete, xp, streak")
          .eq("id", user.id)
          .single()

        if (
          profileError ||
          !profile ||
          profile.onboarding_complete !== true
        ) {
          router.replace("/onboarding")
          return
        }

        const [userPlan, progress, masteryRes, membershipRes] = await Promise.all([
          getUserPlan(),
          getProgramProgress("genesis"),
          supabase
            .from("user_segment_mastery")
            .select("segment, mastered")
            .eq("user_id", user.id),
          supabase
            .from("family_members")
            .select("id, family_id, role")
            .eq("user_id", user.id)
            .is("removed_at", null)
            .maybeSingle(),
        ])
        const membership = membershipRes.data

        const resolvedPlan = userPlan || {
          ...fallbackPlan,
          userId: user.id,
        }

        const program = getProgramById("genesis")
        if (!program) {
          if (active) setLoading(false)
          return
        }

        const masteryRows = (masteryRes.data || []) as MasteryRow[]
        const masteredSegments = new Set(
          masteryRows
            .filter((row) => row.mastered)
            .map((row) => row.segment.replaceAll("_", "-"))
        )

        const resumeIndex = getResumeSegmentIndex(progress, program.segments.length)
        const currentSegment = program.segments[resumeIndex] || program.segments[0]
        const nextSegment =
          program.segments[Math.min(resumeIndex + 1, program.segments.length - 1)] ||
          currentSegment
        const currentMissionMeta = getGenesisMissionMeta(
          currentSegment.segment.replaceAll("-", "_")
        )
        const nextMissionMeta = getGenesisMissionMeta(
          nextSegment.segment.replaceAll("-", "_")
        )
        const masteryCount = program.segments.filter((segment) =>
          masteredSegments.has(segment.segment)
        ).length
        const masteryPercent = Math.round(
          (masteryCount / Math.max(program.segments.length, 1)) * 100
        )
        const completedMissionCount = getCompletedProgramSegmentCount(
          progress,
          program.segments.length
        )
        const genesisProgressPercent = Math.round(
          (completedMissionCount / Math.max(program.segments.length, 1)) * 100
        )
        const paidAccess =
          currentPlan === "pro" ||
          currentPlan === "pro_plus" ||
          currentPlan === "family_pro" ||
          currentPlan === "family_pro_plus"
        const continueHref = paidAccess
          ? `/quiz?program=genesis&segment=${currentSegment.segment}&depth=10`
          : `/quiz?program=genesis&segment=${currentSegment.segment}&depth=5`

        if (!active) return

        setTrainingEnabled(resolvedPlan.trainingEnabled)
        setDashboardState({
          playerName: profile.name || "Athlete",
          currentSegmentLabel: currentSegment.label,
          segmentNumber: Math.min(resumeIndex + 1, program.segments.length),
          totalSegments: program.segments.length,
          completedMissionCount,
          genesisProgressPercent,
          masteryCount,
          masteryPercent,
          missionTitle: currentMissionMeta.title,
          missionSubtitle: currentMissionMeta.subtitle,
          missionAtmosphere: currentMissionMeta.atmosphere,
          missionArt: getGenesisMissionArt(currentSegment.segment),
          continueHref,
          currentCampaignHref: "/explore/book/genesis",
          dailyMissionComplete: hasCompletedToday(),
          xpEarned: profile.xp || 0,
          streak: profile.streak || 0,
          nextMissionTitle: nextMissionMeta.title,
          nextMissionLabel: nextSegment.label,
        })

        if (!membership?.family_id) {
          setMembershipId(membership?.id || null)
          setIsOwner(membership?.role === "owner")
          setLoading(false)
          return
        }

        const nextFamilyId = membership.family_id
        setMembershipId(membership.id)
        setFamilyId(nextFamilyId)
        setIsOwner(membership.role === "owner")

        const [{ count }, { data: family }, { data: familyMembers }] = await Promise.all([
          supabase
            .from("family_members")
            .select("*", { count: "exact", head: true })
            .eq("family_id", nextFamilyId)
            .is("removed_at", null),
          supabase
            .from("families")
            .select("member_limit")
            .eq("id", nextFamilyId)
            .maybeSingle(),
          supabase
            .from("family_members")
            .select(`
              id,
              user_id,
              role,
              profiles (
                name
              )
            `)
            .eq("family_id", nextFamilyId)
            .is("removed_at", null)
            .order("role", { ascending: true }),
        ])

        if (!active) return

        setMemberCount(count || 0)
        setMemberLimit(family?.member_limit || 4)
        setMembers((familyMembers || []) as FamilyMember[])
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [router])

  useEffect(() => {
    if (!upgradePlan) return

    const planNameMap: Record<string, string> = {
      pro: "Pro",
      pro_plus: "Pro+",
      family_pro: "Family Pro",
      family_pro_plus: "Family Pro+",
    }

    setUpgradeMessage(`You're now upgraded to ${planNameMap[upgradePlan] || upgradePlan} 🎉`)
    router.refresh()

    const timeout = setTimeout(() => {
      router.replace("/dashboard")
    }, 2000)

    return () => clearTimeout(timeout)
  }, [upgradePlan, router])

  const handleInvite = async () => {
    if (!email || !familyId) return

    const supabase = createClient()
    const token = crypto.randomUUID()
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    const { data: existing } = await supabase
      .from("family_invites")
      .select("*")
      .eq("family_id", familyId)
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle()

    let error = null

    if (existing) {
      const res = await supabase
        .from("family_invites")
        .update({
          token,
          expires_at,
        })
        .eq("id", existing.id)

      error = res.error
    } else {
      const res = await supabase.from("family_invites").insert({
        family_id: familyId,
        email,
        token,
        expires_at,
      })

      error = res.error
    }

    if (error) {
      setMessage("Error sending invite")
      return
    }

    const res = await fetch("/api/send-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, token }),
    })

    if (res.ok) {
      setMessage("Invite sent successfully")
      setEmail("")
    } else {
      setMessage("Invite saved but email failed")
    }
  }

  const removeMember = async (memberId: string, memberUserId: string) => {
    if (!familyId || !isOwner || memberUserId === userId) return

    const supabase = createClient()
    setRemovingMemberId(memberId)
    setMessage("")

    const { error } = await supabase
      .from("family_members")
      .update({ removed_at: new Date().toISOString() })
      .eq("id", memberId)
      .eq("family_id", familyId)
      .is("removed_at", null)

    if (error) {
      setMessage("Error removing member")
      setRemovingMemberId(null)
      return
    }

    setMembers((prev) => prev.filter((member) => member.id !== memberId))
    setMemberCount((prev) => (prev !== null ? Math.max(prev - 1, 0) : prev))
    setRemovingMemberId(null)
    setMessage("Member removed successfully")
  }

  const leaveFamily = async () => {
    if (!membershipId || isOwner) return

    const supabase = createClient()
    setIsLeavingFamily(true)
    setMessage("")

    const { error } = await supabase
      .from("family_members")
      .update({ removed_at: new Date().toISOString() })
      .eq("id", membershipId)
      .is("removed_at", null)

    if (error) {
      setMessage("Error leaving family")
      setIsLeavingFamily(false)
      return
    }

    setMembers([])
    setMemberCount(0)
    setMemberLimit(null)
    setFamilyId(null)
    setMembershipId(null)
    setIsOwner(false)
    router.refresh()
    router.push("/family")
  }

  const isFamilyFull =
    memberCount !== null &&
    memberLimit !== null &&
    memberCount >= memberLimit

  const weeklyStreakDots = useMemo(
    () => weeklyDots(dashboardState?.streak || 0),
    [dashboardState?.streak]
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 text-white">
        Loading dashboard...
      </div>
    )
  }

  const continueHref = dashboardState?.continueHref || "/explore"

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#1a2440_0%,_#0c1220_38%,_#05070d_100%)] px-4 py-6 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-40 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-[25rem] h-56 w-56 rounded-full bg-cyan-400/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,36,0.94),rgba(9,12,20,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100/84">
                Personal Command Center
              </div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                {getPlanBadge(plan)}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                  Welcome back, Athlete.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Your mission. His Word. Your growth.
                </p>
                <p className="mt-2 text-sm font-medium text-amber-100/78">
                  Signed in as {dashboardState?.playerName || "Athlete"}
                </p>
              </div>
              <div className="flex gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    XP Earned
                  </div>
                  <div className="mt-1 text-xl font-black text-white">
                    {dashboardState?.xpEarned || 0}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Streak
                  </div>
                  <div className="mt-1 text-xl font-black text-white">
                    🔥 {dashboardState?.streak || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[2.2rem] shadow-[0_30px_100px_rgba(0,0,0,0.34)]">
              <div className="absolute inset-0">
                <Image
                  src={dashboardState?.missionArt || "/explorer/pentateuch/region.png"}
                  alt=""
                  fill
                  priority
                  className="object-cover object-center brightness-[1.06] saturate-[1.08]"
                  sizes="(max-width: 1280px) 100vw, 70vw"
                />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,226,153,0.24),transparent_26%),linear-gradient(180deg,rgba(13,10,6,0.06),rgba(13,10,6,0.16)_40%,rgba(7,6,4,0.66))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(0,0,0,0.34),transparent_34%),linear-gradient(90deg,rgba(7,6,4,0.58),rgba(7,6,4,0.18)_46%,transparent_76%),linear-gradient(180deg,transparent_0%,rgba(7,6,4,0.08)_46%,rgba(7,6,4,0.30)_100%)]" />

              <div className="relative z-10 flex min-h-[34rem] flex-col justify-between px-5 py-6 sm:px-7 sm:py-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100/74">
                    Continue Mission
                  </div>
                  <div className="text-right text-[11px] font-medium uppercase tracking-[0.24em] text-amber-50/72">
                    Genesis Campaign
                  </div>
                </div>

                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/74 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                    {dashboardState?.missionAtmosphere || "The Foundations of Creation"}
                  </p>
                  <h2 className="mt-4 text-4xl font-black leading-[0.94] tracking-[-0.04em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-5xl">
                    {dashboardState?.missionTitle || "In the Beginning"}
                  </h2>
                  <p className="mt-3 text-lg font-semibold text-amber-100/82">
                    {dashboardState?.currentSegmentLabel || "Genesis 1–3"}
                  </p>
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-100/84 drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)]">
                    {dashboardState?.missionSubtitle || "The foundations of creation. Understand where it all began."}
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4 backdrop-blur-sm sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                        Mission Progress
                      </div>
                      <div className="mt-2 text-3xl font-black text-white">
                        Mission {dashboardState?.segmentNumber || 1} of {dashboardState?.totalSegments || 16}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                        Campaign
                      </div>
                      <div className="mt-2 text-3xl font-black text-white">
                        {dashboardState?.genesisProgressPercent || 0}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-[7px] overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-100 via-yellow-200 to-orange-300 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                      style={{ width: `${dashboardState?.genesisProgressPercent || 0}%` }}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push(continueHref)}
                        className="w-full rounded-full bg-amber-200 px-5 py-4 text-lg font-black text-[#2c1600] shadow-[0_0_36px_rgba(251,191,36,0.22)] transition hover:scale-[1.01] active:scale-95"
                      >
                        Continue Mission
                      </button>
                      <button
                        onClick={() => router.push(dashboardState?.currentCampaignHref || "/explore/book/genesis")}
                        className="w-full rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/14 active:scale-95"
                      >
                        Open Genesis Campaign
                      </button>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                        Next Up
                      </div>
                      <div className="mt-2 text-lg font-black text-white">
                        {dashboardState?.nextMissionTitle || "The First Family"}
                      </div>
                      <div className="mt-2 text-sm text-slate-300">
                        {dashboardState?.nextMissionLabel || "Genesis 4–6"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,22,36,0.96),rgba(8,12,20,0.98))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.26em] text-amber-200/80">
                    Personal Stats
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    Your momentum in Scripture
                  </h3>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Genesis Progress
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {dashboardState?.genesisProgressPercent || 0}%
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Missions Completed
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {dashboardState?.completedMissionCount || 0}
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Mastery
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {dashboardState?.masteryPercent || 0}%
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    XP Earned
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {dashboardState?.xpEarned || 0}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(12,16,27,0.98))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-amber-200/80">
                  Recommended For You
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Pick up momentum fast
                </h3>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <button
                  onClick={() => router.push("/quiz?mode=quick")}
                  className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/8"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7ee69c]">
                    Recommended
                  </div>
                  <div className="mt-2 text-xl font-black text-white">
                    Weak Areas to Train
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Jump into a quick training run and sharpen the areas that need reinforcement.
                  </p>
                </button>

                <button
                  onClick={() => router.push(continueHref)}
                  className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/8"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
                    Momentum
                  </div>
                  <div className="mt-2 text-xl font-black text-white">
                    Keep Your Streak Alive
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Re-enter your active mission and keep today’s momentum moving forward.
                  </p>
                </button>

                <button
                  onClick={() => router.push("/explore")}
                  className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/8"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
                    Discovery
                  </div>
                  <div className="mt-2 text-xl font-black text-white">
                    Explore the World
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Step back into the Bible world map and see the regions that await beyond Genesis.
                  </p>
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,36,0.96),rgba(10,13,22,0.98))] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-amber-200/80">
                Daily Mission
              </p>
              <h3 className="mt-3 text-2xl font-black text-white">
                {dashboardState?.dailyMissionComplete
                  ? "Mission Complete"
                  : "Daily Mission Available"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {dashboardState?.dailyMissionComplete
                  ? "The next mission arrives tomorrow. Genesis remains open for mastery and deeper study today."
                  : "Your current mission is ready. Step back into Scripture and continue the campaign now."}
              </p>
              <button
                onClick={() => router.push(continueHref)}
                className="mt-5 w-full rounded-full border border-amber-100/18 bg-amber-100/10 px-5 py-3 text-sm font-black text-amber-50 transition hover:bg-amber-100/14"
              >
                {dashboardState?.dailyMissionComplete ? "Replay Mission" : "Continue Mission"}
              </button>
            </section>

            <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,22,36,0.96),rgba(8,12,20,0.98))] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-[#7ee69c]">
                Streak
              </p>
              <h3 className="mt-3 text-3xl font-black text-white">
                🔥 {dashboardState?.streak || 0} days
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Stay consistent in the Word and let your weekly rhythm keep building.
              </p>
              <div className="mt-5 flex items-center justify-between gap-2">
                {weeklyStreakDots.map((active, index) => (
                  <div
                    key={index}
                    className={`h-3 w-3 rounded-full ${
                      active
                        ? "bg-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.28)]"
                        : "bg-white/12"
                    }`}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(12,16,27,0.98))] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-cyan-200/80">
                Quick Access
              </p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => router.push("/quiz?mode=quick")}
                  className="w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/8"
                >
                  <div className="text-base font-black text-white">
                    Start Training
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {trainingEnabled
                      ? "Protect the streak with a fast training burst."
                      : "Quick training is still available anytime."}
                  </div>
                </button>
                <button
                  onClick={() => router.push("/explore")}
                  className="w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/8"
                >
                  <div className="text-base font-black text-white">
                    Open Explore
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    Re-enter the Bible world and browse the wider campaign map.
                  </div>
                </button>
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,19,30,0.96),rgba(9,11,19,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-amber-200/80">
                Account & Family
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Account tools stay within reach
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Manage access, family membership, and plan details here without pulling focus from your active mission.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
              Current Plan: {getPlanBadge(plan)}
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {upgradeMessage && (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-200 xl:col-span-2">
                {upgradeMessage}
              </div>
            )}

            {plan === "free" && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                Free Plan - Limited access remains active.
              </div>
            )}

            {plan === "pro" && (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-200">
                Pro Plan - Full access is active.
              </div>
            )}

            {(plan === "pro_plus" || plan === "family_pro_plus") && (
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200">
                Pro+ access is active across your mastery system.
              </div>
            )}

            {memberCount !== null && memberLimit !== null && (
              isFamilyFull ? (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-6 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
                    Family is Full
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {memberCount} / {memberLimit} members used
                  </p>
                  <p className="mt-2 text-sm text-amber-100">
                    You’ve reached your family member limit.
                  </p>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-black transition hover:bg-amber-200"
                  >
                    Upgrade to Add More Members
                  </button>
                </div>
              ) : (
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
              )
            )}

            {members.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 xl:col-span-2">
                <h3 className="text-lg font-bold text-white">
                  Family Members
                </h3>

                <div className="mt-4 flex flex-col gap-3">
                  {members.map((member) => {
                    const isCurrentUser = member.user_id === userId
                    const canRemove = isOwner && !isCurrentUser
                    const isRemoving = removingMemberId === member.id

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {isCurrentUser ? "You" : getProfileName(member.profiles)}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                            {member.role}
                            {isCurrentUser ? " • You" : ""}
                          </p>
                        </div>

                        {canRemove && (
                          <button
                            onClick={() => removeMember(member.id, member.user_id)}
                            disabled={isRemoving}
                            className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isRemoving ? "Removing..." : "Remove"}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {isOwner && (
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5">
                <h3 className="text-lg font-bold text-white">
                  Invite Family Member
                </h3>

                <div className="mt-4 flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-400 outline-none"
                  />

                  <button
                    onClick={handleInvite}
                    className="w-full rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-black transition hover:bg-emerald-200"
                  >
                    Send Invite
                  </button>
                </div>

                {message && (
                  <p className="mt-3 text-sm text-emerald-100">
                    {message}
                  </p>
                )}
              </div>
            )}

            {!isOwner && membershipId && (
              <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-5">
                <h3 className="text-lg font-bold text-white">
                  Leave Family
                </h3>
                <p className="mt-2 text-sm leading-6 text-orange-100">
                  If needed, you can safely leave the family without affecting your mission progress.
                </p>
                <button
                  onClick={leaveFamily}
                  disabled={isLeavingFamily}
                  className="mt-4 w-full rounded-xl bg-orange-400 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLeavingFamily ? "Leaving Family..." : "Leave Family"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
