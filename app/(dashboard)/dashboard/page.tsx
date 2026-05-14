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
import { renderNavIcon } from "@/lib/navigation"

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

function getDailyRhythmLabel(date: Date) {
  const hour = date.getHours()

  if (hour < 12) return "Morning Watch"
  if (hour < 17) return "Midday Rhythm"
  if (hour < 21) return "Evening Focus"
  return "Night Reflection"
}

function getFocusRankLabel(progressPercent: number, masteryPercent: number) {
  const combined = Math.round((progressPercent + masteryPercent) / 2)

  if (combined >= 90) return "Crowned Focus"
  if (combined >= 75) return "Steady Focus"
  if (combined >= 55) return "Growing Focus"
  return "Early Focus"
}

function getFocusRankTone(progressPercent: number, masteryPercent: number) {
  const combined = Math.round((progressPercent + masteryPercent) / 2)

  if (combined >= 90) {
    return {
      border: "border-cyan-300/28",
      bg: "bg-cyan-300/10",
      text: "text-cyan-100",
    }
  }

  if (combined >= 75) {
    return {
      border: "border-violet-300/24",
      bg: "bg-violet-300/10",
      text: "text-violet-100",
    }
  }

  return {
    border: "border-amber-300/24",
    bg: "bg-amber-300/10",
    text: "text-amber-100",
  }
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
          currentCampaignHref: "/training",
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

    setUpgradeMessage(`You're now upgraded to ${planNameMap[upgradePlan] || upgradePlan}.`)
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
  const now = new Date()
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(now)
  const rhythmLabel = getDailyRhythmLabel(now)
  const athleteLevel = Math.max(1, Math.floor((dashboardState?.xpEarned || 0) / 250) + 1)
  const xpIntoLevel = (dashboardState?.xpEarned || 0) % 250
  const xpToNextLevel = Math.max(250 - xpIntoLevel, 0)
  const levelProgress = Math.max(10, Math.min(100, (xpIntoLevel / 250) * 100))
  const focusRankLabel = getFocusRankLabel(
    dashboardState?.genesisProgressPercent || 0,
    dashboardState?.masteryPercent || 0
  )
  const focusRankTone = getFocusRankTone(
    dashboardState?.genesisProgressPercent || 0,
    dashboardState?.masteryPercent || 0
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 text-white">
        Loading dashboard...
      </div>
    )
  }

  const continueHref = dashboardState?.continueHref || "/training"

  return (
    <main className="ba-shell-bg min-h-screen overflow-x-hidden px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-32 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-[24rem] h-56 w-56 rounded-full bg-cyan-400/8 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[9rem] h-44 w-44 rounded-full bg-violet-400/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <section className="ba-sacred-surface rounded-[2rem] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/18 bg-amber-200/10 text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
                  {renderNavIcon("brand", "h-5 w-5")}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-black tracking-[-0.03em] text-white">
                    Bible Athlete
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/44">
                    Training Command
                  </div>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/14 bg-cyan-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-100">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cyan-50">
                  {renderNavIcon("upgrade", "h-3.5 w-3.5")}
                </span>
                Athlete Level {athleteLevel}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="ba-glass-card inline-flex h-11 w-11 items-center justify-center rounded-full text-white/84 transition hover:text-white"
              aria-label="Open settings"
            >
              {renderNavIcon("settings", "h-[1.05rem] w-[1.05rem]")}
            </button>
          </div>

          <div className="mt-4 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/46">
                  XP to Next Level
                </div>
                <div className="mt-2 text-xl font-black text-white">{xpToNextLevel} XP</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/46">
                  Current Plan
                </div>
                <div className="mt-2 text-sm font-semibold text-amber-100">{getPlanBadge(plan)}</div>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(103,232,249,0.95),rgba(250,204,21,0.95),rgba(244,114,182,0.92))]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-5 flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100/72">
                  Welcome back.
                </p>
                <h1 className="mt-2 text-[2.15rem] font-black tracking-[-0.05em] text-white sm:text-5xl">
                  Train today. Grow stronger daily.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                  Build discipline. Strengthen your spirit.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/84">
                {formattedDate} · {rhythmLabel}
              </div>
            </div>

            <section className="ba-card-aura relative overflow-hidden rounded-[2.2rem] border border-amber-200/18 shadow-[0_30px_100px_rgba(0,0,0,0.34)]">
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,226,153,0.24),transparent_26%),linear-gradient(180deg,rgba(13,10,6,0.06),rgba(13,10,6,0.16)_40%,rgba(7,6,4,0.72))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_14%,rgba(103,232,249,0.16),transparent_22%),radial-gradient(circle_at_18%_28%,rgba(0,0,0,0.34),transparent_34%),linear-gradient(90deg,rgba(7,6,4,0.58),rgba(7,6,4,0.18)_46%,transparent_76%),linear-gradient(180deg,transparent_0%,rgba(7,6,4,0.08)_46%,rgba(7,6,4,0.34)_100%)]" />

              <div className="relative z-10 flex min-h-[33rem] flex-col justify-between px-5 py-6 sm:px-7 sm:py-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.26em] text-amber-100/82">
                    Today&apos;s Mission
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78">
                    {dashboardState?.dailyMissionComplete ? "Replay Ready" : "Ready Now"}
                  </div>
                </div>

                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/74 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                    {dashboardState?.missionAtmosphere || "The Foundations of Creation"}
                  </p>
                  <h2 className="mt-4 text-[2.25rem] font-black leading-[0.94] tracking-[-0.04em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-5xl">
                    {dashboardState?.missionTitle || "In the Beginning"}
                  </h2>
                  <p className="mt-3 text-lg font-semibold text-amber-100/82">
                    {dashboardState?.dailyMissionComplete
                      ? "Return for a steadier second pass."
                      : "Step back into Scripture and keep the mission moving."}
                  </p>
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-100/84 drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)]">
                    {dashboardState?.missionSubtitle || "The foundations of creation. Understand where it all began."}
                  </p>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-black/24 p-4 backdrop-blur-sm sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                        Focus Passage
                      </div>
                      <div className="mt-2 text-2xl font-black text-white">
                        {dashboardState?.currentSegmentLabel || "Genesis 1–3"}
                      </div>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">
                        {dashboardState?.dailyMissionComplete
                          ? "You cleared today’s mission. Run it again for stronger recall and cleaner retention."
                          : "Today’s passage is ready. Continue where you left off and build fresh momentum."}
                      </p>

                      <div className="mt-5 h-[7px] overflow-hidden rounded-full bg-white/10">
                        <div
                          className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(103,232,249,0.92),rgba(250,204,21,0.96),rgba(244,114,182,0.88))]"
                          style={{ width: `${dashboardState?.genesisProgressPercent || 0}%` }}
                        />
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => router.push(continueHref)}
                          className="ba-gold-cta ba-shimmer ba-float-cta motion-safe w-full rounded-full px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#2c1600] sm:w-auto sm:min-w-[16rem]"
                        >
                          Continue Training
                        </button>
                        <button
                          onClick={() => router.push(dashboardState?.currentCampaignHref || "/training")}
                          className="ba-glass-card inline-flex w-full items-center justify-center rounded-full px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/[0.08] sm:w-auto"
                        >
                          Open Training Arena
                        </button>
                      </div>
                    </div>

                    <div className="ba-glass-card rounded-[1.45rem] p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                        Next Step
                      </div>
                      <div className="mt-2 text-xl font-black text-white">
                        {dashboardState?.nextMissionTitle || "The First Family"}
                      </div>
                      <div className="mt-2 text-sm text-slate-300">
                        {dashboardState?.nextMissionLabel || "Genesis 4–6"}
                      </div>
                      <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/44">
                          Campaign Progress
                        </div>
                        <div className="mt-2 text-2xl font-black text-white">
                          {dashboardState?.genesisProgressPercent || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <article className="ba-glass-card rounded-[1.45rem] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/72">
                      XP
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {dashboardState?.xpEarned || 0}
                    </div>
                  </div>
                  <div className="ba-rank-gem inline-flex h-10 w-10 items-center justify-center rounded-full text-cyan-100">
                    {renderNavIcon("brand", "h-4.5 w-4.5")}
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="ba-progress-glow h-full w-[72%] rounded-full bg-[linear-gradient(90deg,rgba(103,232,249,0.95),rgba(59,130,246,0.92))]" />
                </div>
              </article>

              <article className="ba-glass-card rounded-[1.45rem] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/72">
                      Streak
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {dashboardState?.streak || 0} days
                    </div>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-amber-100">
                    {renderNavIcon("training", "h-4.5 w-4.5")}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {weeklyStreakDots.map((active, index) => (
                    <div
                      key={index}
                      className={`h-2.5 flex-1 rounded-full ${
                        active
                          ? "bg-[linear-gradient(90deg,rgba(250,204,21,0.96),rgba(251,146,60,0.92))] shadow-[0_0_14px_rgba(251,191,36,0.18)]"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </article>

              <article className="ba-glass-card rounded-[1.45rem] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-100/72">
                      Mastery
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {dashboardState?.masteryPercent || 0}%
                    </div>
                  </div>
                  <div className="ba-rank-gem inline-flex h-10 w-10 items-center justify-center rounded-full text-violet-100">
                    {renderNavIcon("leaderboard", "h-4.5 w-4.5")}
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(244,114,182,0.9),rgba(196,181,253,0.95),rgba(250,204,21,0.84))]"
                    style={{ width: `${dashboardState?.masteryPercent || 0}%` }}
                  />
                </div>
              </article>

              <article className="ba-glass-card rounded-[1.45rem] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/72">
                      Focus Rank
                    </div>
                    <div className="mt-2 text-xl font-black text-white">
                      {focusRankLabel}
                    </div>
                  </div>
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${focusRankTone.border} ${focusRankTone.bg} ${focusRankTone.text}`}>
                    {renderNavIcon("upgrade", "h-4.5 w-4.5")}
                  </div>
                </div>
                <div className="mt-4 text-sm text-white/72">
                  {dashboardState?.genesisProgressPercent || 0}% campaign focus
                </div>
              </article>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100/72">
                    Recommended
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                    Keep your momentum moving.
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <button
                  onClick={() => router.push("/training")}
                  className="ba-card-aura ba-sacred-surface relative overflow-hidden rounded-[1.85rem] p-5 text-left transition duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(103,232,249,0.94),rgba(250,204,21,0.92))]" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
                      {renderNavIcon("training", "h-5 w-5")}
                    </div>
                    <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">
                      Flagship
                    </div>
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-white">Training Arena</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Step back into your daily drills, sharpen recall, and keep building long-term mastery.
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-cyan-100">Continue the arena</span>
                    <span className="text-white/72">→</span>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/flashcards")}
                  className="ba-card-aura relative overflow-hidden rounded-[1.85rem] border border-amber-200/12 bg-[radial-gradient(circle_at_top_left,rgba(255,221,153,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.10),transparent_24%),linear-gradient(180deg,rgba(24,18,16,0.96),rgba(12,12,18,0.98))] p-5 text-left shadow-[0_24px_60px_rgba(0,0,0,0.3)] transition duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(251,191,36,0.92),rgba(244,114,182,0.88),rgba(34,211,238,0.84))]" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-amber-200/18 bg-amber-200/10 text-amber-100">
                      {renderNavIcon("verse-memory", "h-5 w-5")}
                    </div>
                    <div className="rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100">
                      Warm Focus
                    </div>
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-white">Verse Memory</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Hide God&apos;s Word in your heart with guided review, repetition, and calm recall workouts.
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-100">Open memory workout</span>
                    <span className="text-white/72">→</span>
                  </div>
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="ba-sacred-surface rounded-[1.9rem] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100/72">
                    Today&apos;s Rhythm
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    {dashboardState?.dailyMissionComplete ? "Mission complete" : "Mission available"}
                  </h3>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/10 text-amber-100">
                  {renderNavIcon("training", "h-4.5 w-4.5")}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {dashboardState?.dailyMissionComplete
                  ? "Today’s mission is complete. Return for another disciplined pass or move into Verse Memory."
                  : "Your mission is open now. A short, focused session keeps the rhythm alive."}
              </p>
              <button
                onClick={() => router.push(continueHref)}
                className="ba-gold-cta mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-black uppercase tracking-[0.18em]"
              >
                {dashboardState?.dailyMissionComplete ? "Replay mission" : "Continue mission"}
              </button>
            </section>

            <section className="ba-glass-card rounded-[1.85rem] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-100/72">
                Focus Summary
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/46">Current Passage</div>
                  <div className="mt-2 text-lg font-black text-white">{dashboardState?.currentSegmentLabel || "Genesis 1–3"}</div>
                </div>
                <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/46">Missions Cleared</div>
                  <div className="mt-2 text-lg font-black text-white">{dashboardState?.completedMissionCount || 0}</div>
                </div>
                <button
                  onClick={() => router.push("/quiz?mode=quick")}
                  className="ba-glass-card rounded-[1.15rem] p-4 text-left transition hover:bg-white/[0.08]"
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/72">Quick Burst</div>
                  <div className="mt-2 text-lg font-black text-white">Protect the rhythm fast</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {trainingEnabled
                      ? "Take a short training burst when you only have a minute."
                      : "Quick training stays available any time you want a focused review."}
                  </p>
                </button>
              </div>
            </section>
          </aside>
        </section>

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
              <div className="ba-card-success rounded-2xl p-4 text-emerald-100 xl:col-span-2">
                {upgradeMessage}
              </div>
            )}

            {plan === "free" && (
              <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-rose-100">
                Free Plan - Limited access remains active.
              </div>
            )}

            {plan === "pro" && (
              <div className="ba-card-success rounded-2xl p-4 text-emerald-100">
                Pro Plan - Full access is active.
              </div>
            )}

            {(plan === "pro_plus" || plan === "family_pro_plus") && (
              <div className="ba-card-pro-plus rounded-2xl p-4 text-amber-100">
                Pro+ access is active across your mastery system.
              </div>
            )}

            {memberCount !== null && memberLimit !== null && (
              isFamilyFull ? (
                <div className="ba-card-warning rounded-2xl px-5 py-6 text-center">
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
                    className="ba-button-primary mt-4 inline-flex items-center justify-center px-4 py-3 text-sm font-black"
                  >
                    Upgrade to Add More Members
                  </button>
                </div>
              ) : (
                <div className="ba-card-soft rounded-2xl px-5 py-6 text-center">
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
                            className="rounded-xl border border-rose-400/25 bg-rose-500/12 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60"
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
              <div className="ba-card-success rounded-2xl p-5">
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
                    className="ba-button-primary w-full px-4 py-3 text-sm font-black"
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
              <div className="ba-card-warning rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white">
                  Leave Family
                </h3>
                <p className="mt-2 text-sm leading-6 text-orange-100">
                  If needed, you can safely leave the family without affecting your mission progress.
                </p>
                <button
                  onClick={leaveFamily}
                  disabled={isLeavingFamily}
                  className="ba-button-warning mt-4 w-full px-4 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
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
