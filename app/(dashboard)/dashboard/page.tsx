"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import DashboardHero from "@/components/dashboard/DashboardHero"
import DashboardRecommendationCard from "@/components/dashboard/DashboardRecommendationCard"
import DashboardRightRail from "@/components/dashboard/DashboardRightRail"
import DashboardStatCard from "@/components/dashboard/DashboardStatCard"
import DashboardTopBar from "@/components/dashboard/DashboardTopBar"
import {
  getGenesisMissionArt,
  getGenesisMissionMeta,
} from "@/lib/genesisCampaign"
import { getUserPlan as getPlanType } from "@/lib/getUserPlan"
import { getProgramById } from "@/lib/programs"
import { getCompletedProgramSegmentCount } from "@/lib/campaignProgress"
import { getProgramProgress, getResumeSegmentIndex } from "@/lib/programProgress"
import { renderNavIcon } from "@/lib/navigation"
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
  if (plan === "pro_plus") return "Pro+"
  if (plan === "family_pro_plus") return "Family Pro+"
  if (plan === "pro") return "Pro"
  if (plan === "family_pro") return "Family Pro"
  return "Free"
}

function getPlanMeta(plan: string, hasFamily: boolean) {
  if (plan === "family_pro_plus") return "Family access currently active."
  if (plan === "family_pro") return "Family plan access is active."
  if (plan === "pro_plus") return hasFamily ? "Shared with your family access." : "Premium training access is active."
  if (plan === "pro") return hasFamily ? "Shared plan access is active." : "Your training plan is active."
  return "Upgrade anytime for deeper training access."
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgradePlan = searchParams.get("upgrade")
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState("free")
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null)
  const [, setTrainingEnabled] = useState(true)
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

        if (profileError || !profile || profile.onboarding_complete !== true) {
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
        if (active) setLoading(false)
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

  const now = new Date()
  const shortFormattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now)
  const athleteLevel = Math.max(1, Math.floor((dashboardState?.xpEarned || 0) / 250) + 1)
  const xpIntoLevel = (dashboardState?.xpEarned || 0) % 250
  const xpToNextLevel = Math.max(250 - xpIntoLevel, 0)
  const levelProgress = Math.max(10, Math.min(100, (xpIntoLevel / 250) * 100))
  const missionTitle = dashboardState?.missionTitle || "Today's Mission"
  const missionSubtitle =
    dashboardState?.missionSubtitle ||
    "Continue your current Bible training mission."
  const referenceLine = dashboardState?.currentSegmentLabel || "Current Segment"
  const focusPassage = dashboardState?.currentSegmentLabel || "Genesis 1"
  const heroImageSrc = "/images/dashboard/dashboard-hero-walk-in-faith.png"
  const memberNames = members.map((member) =>
    member.user_id === userId ? "You" : getProfileName(member.profiles)
  )
  const planBadge = getPlanBadge(plan)
  const planMeta = getPlanMeta(plan, Boolean(familyId))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 text-white">
        Loading dashboard...
      </div>
    )
  }

  const continueHref = dashboardState?.continueHref || "/training"

  const statCards = [
    {
      title: "XP",
      value: (dashboardState?.xpEarned || 0).toLocaleString(),
      supporting: `${xpToNextLevel.toLocaleString()} XP to Level ${athleteLevel + 1}`,
      caption: `${(dashboardState?.xpEarned || 0).toLocaleString()} / 15,000`,
      accent: "cyan" as const,
      iconSrc: "/images/icons/dashboard/xp-laurel-ring-transparent.png",
    },
    {
      title: "STREAK",
      value: String(dashboardState?.streak || 0),
      supporting: `${dashboardState?.streak || 0} Day${dashboardState?.streak === 1 ? "" : "s"}`,
      caption: "Keep it going!",
      accent: "amber" as const,
      iconSrc: "/images/icons/dashboard/streak-flame-ring-transparent.png",
    },
    {
      title: "MASTERY",
      value: `${dashboardState?.masteryPercent || 0}%`,
      supporting: "Overall Mastery",
      caption: `${dashboardState?.masteryCount || 0} of ${dashboardState?.totalSegments || 0} segments`,
      accent: "violet" as const,
      iconSrc: "/images/icons/dashboard/mastery-purple-shield-transparent.png",
    },
    {
      title: "GENESIS",
      value: `${dashboardState?.genesisProgressPercent || 0}%`,
      supporting: "Campaign Progress",
      caption: `${dashboardState?.completedMissionCount || 0} of ${dashboardState?.totalSegments || 0} missions`,
      accent: "sapphire" as const,
      iconSrc: "/images/icons/dashboard/focus-rank-sapphire-transparent.png",
    },
  ]

  return (
    <main className="ba-dashboard-page md:h-full">
      <div className="ba-dashboard-shell md:h-full">
        <div className="ba-dashboard-grid md:h-full">
          <div className="ba-dashboard-main-column">
            <div className="ba-dashboard-main-scroll ba-scrollbar-hidden space-y-3 lg:space-y-3.5">
              <DashboardTopBar
                athleteLevel={athleteLevel}
                xpToNextLevel={xpToNextLevel}
                levelProgress={levelProgress}
                playerName={dashboardState?.playerName || "Athlete"}
                onUpgrade={() => router.push("/upgrade")}
                onSettings={() => router.push("/settings")}
              />

              <section className="flex flex-col gap-3 border-b border-amber-200/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="ba-text-section-label mb-2.5 inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-cyan-300/10 px-2.5 py-1 text-[10px] text-cyan-100">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.6)]" />
                    Genesis Campaign
                  </div>
                  <h1 className="ba-text-title text-[2rem] sm:text-[2.35rem] xl:text-[2.65rem]">
                    Welcome back.
                  </h1>
                  <p className="ba-text-body mt-1.5 max-w-2xl text-[0.9rem] leading-[1.58] text-[#d7cab9] sm:text-[0.94rem]">
                    Train today. Grow stronger daily.
                  </p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white/84 shadow-[0_14px_28px_rgba(0,0,0,0.16)]">
                  <span className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
                    {renderNavIcon("sun", "h-3.5 w-3.5")}
                  </span>
                  <div>
                    <div className="ba-font-ui text-right text-[0.72rem] font-medium text-[#e8ddd1]">{shortFormattedDate}</div>
                    <div className="ba-text-section-label ba-text-cyan mt-0.5 text-right text-[0.58rem]">
                      {dashboardState?.currentSegmentLabel || "Current Mission"}
                    </div>
                  </div>
                </div>
              </section>

              <DashboardHero
                title={missionTitle}
                subtitle={missionSubtitle}
                referenceLine={referenceLine}
                focusPassage={focusPassage}
                onContinue={() => router.push(continueHref)}
                progressPercent={dashboardState?.genesisProgressPercent || 0}
                imageSrc={heroImageSrc}
                missionProgressLabel={`Mission ${dashboardState?.segmentNumber || 1} of ${dashboardState?.totalSegments || 1}`}
                dailyMissionComplete={dashboardState?.dailyMissionComplete || false}
              />

              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {statCards.map((card) => (
                  <DashboardStatCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    supporting={card.supporting}
                    caption={card.caption}
                    accent={card.accent}
                    iconSrc={card.iconSrc}
                  />
                ))}
              </section>

              <section>
                <div className="ba-section-header">
                  <p className="ba-text-section-label text-[10px] text-[#f0e6d9]">
                    RECOMMENDED FOR YOU
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/training")}
                    className="ba-font-ui inline-flex items-center gap-1.5 text-[0.73rem] font-medium text-cyan-100/88 transition hover:text-white"
                  >
                    View All
                    <span>{renderNavIcon("chevron-right", "h-4 w-4")}</span>
                  </button>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <DashboardRecommendationCard
                    title="Training Arena"
                    copy="Build discipline. Strengthen your spirit. Level up through guided challenges."
                    badge="Challenging • 5 Rounds"
                    accent="training"
                    imageSrc="/images/dashboard/training-arena-hero-sanctum.png"
                    onClick={() => router.push("/training")}
                  />
                  <DashboardRecommendationCard
                    title="Verse Memory"
                    copy="Hide God’s Word in your heart. Let it guide you every day."
                    badge="Daily Workout • 10 Verses"
                    accent="memory"
                    imageSrc="/images/dashboard/verse-memory-hero-gods-word.png"
                    onClick={() => router.push("/flashcards")}
                  />
                </div>
              </section>

              <section
                id="family-management"
                className="ba-account-panel xl:hidden"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-200/76">
                      Account & Family
                    </p>
                    <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-white">
                      Support systems stay within reach
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[0.72rem]">
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/78">
                      Current Plan: {planBadge}
                    </div>
                    <div className="rounded-full border border-cyan-300/14 bg-cyan-300/8 px-3 py-1.5 text-cyan-100">
                      Genesis Progress: {dashboardState?.genesisProgressPercent || 0}%
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {message ? (
                    <div className="ba-inline-feedback text-cyan-100 lg:col-span-2">{message}</div>
                  ) : null}

                  {upgradeMessage ? (
                    <div className="ba-inline-feedback ba-inline-feedback-success lg:col-span-2">
                      {upgradeMessage}
                    </div>
                  ) : null}

                  {memberCount !== null && memberLimit !== null ? (
                    <div className="ba-account-summary-card">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                        Family Usage
                      </p>
                      <p className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-white">
                        {memberCount} / {memberLimit}
                      </p>
                      <p className="mt-2 text-[0.78rem] text-white/58">Members currently using the plan.</p>
                    </div>
                  ) : null}

                  <div className="ba-account-summary-card">
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-amber-200">
                      Plan Status
                    </p>
                    <p className="mt-3 text-[1.35rem] font-semibold text-white">{planBadge}</p>
                    <p className="mt-2 text-[0.78rem] text-white/58">{planMeta}</p>
                    <button
                      onClick={() => router.push("/upgrade")}
                      className="ba-rail-button mt-4"
                    >
                      Manage Plan
                    </button>
                  </div>

                  {members.length > 0 ? (
                    <div className="ba-account-summary-card lg:col-span-2">
                      <h3 className="text-[1rem] font-semibold text-white">Family Members</h3>
                      <div className="mt-4 flex flex-col gap-2.5">
                        {members.map((member) => {
                          const isCurrentUser = member.user_id === userId
                          const canRemove = isOwner && !isCurrentUser
                          const isRemoving = removingMemberId === member.id

                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-3.5 py-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[0.84rem] font-medium text-white">
                                  {isCurrentUser ? "You" : getProfileName(member.profiles)}
                                </p>
                                <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/42">
                                  {member.role}
                                  {isCurrentUser ? " • You" : ""}
                                </p>
                              </div>

                              {canRemove ? (
                                <button
                                  onClick={() => removeMember(member.id, member.user_id)}
                                  disabled={isRemoving}
                                  className="rounded-full border border-rose-400/24 bg-rose-500/10 px-3 py-1.5 text-[0.72rem] font-medium text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isRemoving ? "Removing..." : "Remove"}
                                </button>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}

                  {isOwner ? (
                    <div className="ba-account-summary-card">
                      <h3 className="text-[1rem] font-semibold text-white">Invite Family Member</h3>
                      <div className="mt-4 flex flex-col gap-3">
                        <input
                          type="email"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-[0.95rem] border border-white/10 bg-black/24 px-4 py-3 text-white placeholder:text-white/34 outline-none"
                        />

                        <button
                          onClick={handleInvite}
                          className="ba-button-primary w-full px-4 py-3 text-sm font-black"
                        >
                          Send Invite
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {!isOwner && membershipId ? (
                    <div className="ba-account-summary-card">
                      <h3 className="text-[1rem] font-semibold text-white">Leave Family</h3>
                      <p className="mt-2 text-[0.8rem] leading-6 text-white/60">
                        Leave the family safely without affecting your mission progress.
                      </p>
                      <button
                        onClick={leaveFamily}
                        disabled={isLeavingFamily}
                        className="ba-button-warning mt-4 w-full px-4 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLeavingFamily ? "Leaving Family..." : "Leave Family"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>

          <div className="ba-dashboard-right-rail hidden xl:block">
            <DashboardRightRail
              currentMissionTitle={missionTitle}
              currentSegmentLabel={dashboardState?.currentSegmentLabel || "Current Mission"}
              genesisProgressPercent={dashboardState?.genesisProgressPercent || 0}
              dailyMissionComplete={dashboardState?.dailyMissionComplete || false}
              completedMissionCount={dashboardState?.completedMissionCount || 0}
              totalSegments={dashboardState?.totalSegments || 0}
              memberCount={memberCount}
              memberLimit={memberLimit}
              memberNames={memberNames}
              planLabel={planBadge}
              planMeta={planMeta}
              onContinueTraining={() => router.push(continueHref)}
              onInviteMember={() => router.push("/family")}
              onManagePlan={() => router.push("/upgrade")}
            />
          </div>
        </div>

        <section className="hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-200/76">
                Account & Family
              </p>
              <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-white sm:text-[2rem]">
                Support systems stay within reach
              </h2>
              <p className="mt-2 max-w-2xl text-[0.82rem] leading-6 text-slate-300">
                Manage access, family membership, and plan details here without pulling focus from your active mission.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[0.72rem]">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-slate-200">
                Current Plan: {planBadge}
              </div>
              <div className="inline-flex rounded-full border border-cyan-300/14 bg-cyan-300/8 px-3 py-1.5 font-medium text-cyan-100">
                Genesis Progress: {dashboardState?.genesisProgressPercent || 0}%
              </div>
              <div className="inline-flex rounded-full border border-fuchsia-300/14 bg-fuchsia-300/8 px-3 py-1.5 font-medium text-fuchsia-100">
                Family Seats: {memberCount !== null && memberLimit !== null ? `${memberCount}/${memberLimit}` : "Solo"}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {message && (
              <div className="ba-inline-feedback text-cyan-100 xl:col-span-2">
                {message}
              </div>
            )}

            {upgradeMessage && (
              <div className="ba-inline-feedback ba-inline-feedback-success xl:col-span-2">
                {upgradeMessage}
              </div>
            )}

            {plan === "free" && (
              <div className="ba-account-summary-card text-rose-100">
                Free Plan - Limited access remains active.
              </div>
            )}

            {plan === "pro" && (
              <div className="ba-account-summary-card text-emerald-100">
                Pro Plan - Full access is active.
              </div>
            )}

            {(plan === "pro_plus" || plan === "family_pro_plus") && (
              <div className="ba-account-summary-card text-amber-100">
                Pro+ access is active across your mastery system.
              </div>
            )}

            {memberCount !== null && memberLimit !== null && (
              isFamilyFull ? (
                <div className="ba-account-summary-card text-center">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-amber-200">
                    Family is Full
                  </p>
                  <p className="mt-3 text-[1.8rem] font-semibold text-white">
                    {memberCount} / {memberLimit} members used
                  </p>
                  <p className="mt-2 text-[0.8rem] text-amber-100">
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
                <div className="ba-account-summary-card text-center">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    Family Usage
                  </p>
                  <p className="mt-3 text-[2rem] font-semibold text-white">
                    {memberCount} / {memberLimit}
                  </p>
                  <p className="mt-2 text-[0.8rem] text-cyan-100">
                    Members used
                  </p>
                </div>
              )
            )}

            {members.length > 0 && (
              <div className="ba-account-summary-card xl:col-span-2">
                <h3 className="text-[1rem] font-semibold text-white">
                  Family Members
                </h3>

                <div className="mt-4 flex flex-col gap-2.5">
                  {members.map((member) => {
                    const isCurrentUser = member.user_id === userId
                    const canRemove = isOwner && !isCurrentUser
                    const isRemoving = removingMemberId === member.id

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-3.5 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[0.84rem] font-medium text-white">
                            {isCurrentUser ? "You" : getProfileName(member.profiles)}
                          </p>
                          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/42">
                            {member.role}
                            {isCurrentUser ? " • You" : ""}
                          </p>
                        </div>

                        {canRemove && (
                          <button
                            onClick={() => removeMember(member.id, member.user_id)}
                            disabled={isRemoving}
                            className="rounded-full border border-rose-400/25 bg-rose-500/12 px-3 py-1.5 text-[0.72rem] font-medium text-rose-100 transition hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60"
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
              <div className="ba-account-summary-card">
                <h3 className="text-[1rem] font-semibold text-white">
                  Invite Family Member
                </h3>

                <div className="mt-4 flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[0.95rem] border border-white/10 bg-black/24 px-4 py-3 text-white placeholder:text-white/34 outline-none"
                  />

                  <button
                    onClick={handleInvite}
                    className="ba-button-primary w-full px-4 py-3 text-sm font-black"
                  >
                    Send Invite
                  </button>
                </div>

              </div>
            )}

            {!isOwner && membershipId && (
              <div className="ba-account-summary-card">
                <h3 className="text-[1rem] font-semibold text-white">
                  Leave Family
                </h3>
                <p className="mt-2 text-[0.8rem] leading-6 text-orange-100">
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
