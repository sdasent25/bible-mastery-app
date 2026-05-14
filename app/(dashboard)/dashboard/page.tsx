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

function getDailyRhythmLabel(date: Date) {
  const hour = date.getHours()

  if (hour < 12) return "Morning Watch"
  if (hour < 17) return "Midday Rhythm"
  if (hour < 21) return "Evening Focus"
  return "Night Reflection"
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
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(now)
  const rhythmLabel = getDailyRhythmLabel(now)
  const athleteLevel = Math.max(1, Math.floor((dashboardState?.xpEarned || 0) / 250) + 1)
  const xpIntoLevel = (dashboardState?.xpEarned || 0) % 250
  const xpToNextLevel = Math.max(250 - xpIntoLevel, 0)
  const levelProgress = Math.max(10, Math.min(100, (xpIntoLevel / 250) * 100))
  const missionTitle = dashboardState?.missionTitle || "Walk in Faith"
  const missionSubtitle =
    dashboardState?.missionSubtitle ||
    "Understand the foundation of all things. Let God’s Word be the beginning of your wisdom and walk."
  const referenceLine = dashboardState?.currentSegmentLabel || "Micah 6:8"
  const focusPassage = dashboardState?.currentSegmentLabel || "Psalm 119:105"
  const focusRankLabel = "SAPPHIRE II"
  const focusRankMeta = "Top 18%"
  const weeklySummary = {
    sessionsCompleted: dashboardState?.completedMissionCount || 5,
    versesMemorized: dashboardState?.masteryCount || 23,
    questsCompleted: Math.max(1, Math.floor((dashboardState?.segmentNumber || 1) / 3)),
    totalXpEarned: dashboardState?.xpEarned || 2150,
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 text-white">
        Loading dashboard...
      </div>
    )
  }

  const continueHref = dashboardState?.continueHref || "/training"

  return (
    <main className="ba-page-bg min-h-screen overflow-x-hidden px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-32 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-[24rem] h-56 w-56 rounded-full bg-cyan-400/8 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[9rem] h-44 w-44 rounded-full bg-violet-400/8 blur-3xl" />

      <div className="ba-dashboard-shell">
        <div className="ba-dashboard-grid">
          <div className="space-y-5">
            <DashboardTopBar
              athleteLevel={athleteLevel}
              xpToNextLevel={xpToNextLevel}
              levelProgress={levelProgress}
              onUpgrade={() => router.push("/upgrade")}
              onSettings={() => router.push("/settings")}
            />

            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-[2.65rem] font-black tracking-[-0.055em] text-white sm:text-5xl xl:text-[3.8rem]">
                  Welcome back.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-[1.15rem] sm:leading-8">
                  Train today. Grow stronger daily.
                </p>
              </div>
              <div className="ba-glass-panel inline-flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-white/84">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/16 bg-amber-200/10 text-amber-50">
                  {renderNavIcon("sun", "h-4 w-4")}
                </span>
                <span>
                  {formattedDate} · {rhythmLabel}
                </span>
              </div>
            </section>

            <DashboardHero
              title={missionTitle}
              subtitle={missionSubtitle}
              referenceLine={referenceLine}
              focusPassage={focusPassage}
              onContinue={() => router.push(continueHref)}
              progressPercent={dashboardState?.genesisProgressPercent || 0}
            />

            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <DashboardStatCard
                title="XP"
                value={(dashboardState?.xpEarned || 0).toLocaleString()}
                supporting="/ 15,000"
                accent="cyan"
                icon="brand"
              />
              <DashboardStatCard
                title="Streak"
                value={String(dashboardState?.streak || 0)}
                supporting="Days · Keep it going!"
                accent="amber"
                icon="training"
              />
              <DashboardStatCard
                title="Mastery"
                value={`${dashboardState?.masteryPercent || 0}%`}
                supporting="Overall Mastery"
                accent="violet"
                icon="leaderboard"
              />
              <DashboardStatCard
                title="Focus Rank"
                value={focusRankLabel}
                supporting={focusRankMeta}
                accent="sapphire"
                icon="upgrade"
              />
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100/72">
                  Recommended for you
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/training")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100/88 transition hover:text-white"
                >
                  View All
                  <span>{renderNavIcon("chevron-right", "h-4 w-4")}</span>
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                <DashboardRecommendationCard
                  title="TRAINING ARENA"
                  eyebrow="Flagship Lane"
                  copyPrimary="Build discipline. Strengthen your spirit."
                  copySecondary="Level up through guided challenges."
                  badge="Challenging • 5 Rounds"
                  accent="training"
                  imageSrc="/dashboard/training-arena-card.svg"
                  icon="training"
                  onClick={() => router.push("/training")}
                />
                <DashboardRecommendationCard
                  title="VERSE MEMORY"
                  eyebrow="Warm Focus"
                  copyPrimary="Hide God’s Word in your heart."
                  copySecondary="Let it guide you every day."
                  badge="Daily Workout • 10 Verses"
                  accent="memory"
                  imageSrc="/dashboard/verse-memory-card.svg"
                  icon="verse-memory"
                  onClick={() => router.push("/flashcards")}
                />
              </div>
            </section>
          </div>

          <div className="hidden xl:block">
            <DashboardRightRail
              missionTitle={missionTitle}
              referenceLine={referenceLine}
              rewardLine={`Complete to earn ${Math.max(200, Math.round((dashboardState?.segmentNumber || 1) * 25))} XP`}
              sessionsCompleted={weeklySummary.sessionsCompleted}
              versesMemorized={weeklySummary.versesMemorized}
              questsCompleted={weeklySummary.questsCompleted}
              totalXpEarned={weeklySummary.totalXpEarned}
              onContinue={() => router.push(continueHref)}
              onViewProgress={() => router.push("/leaderboard")}
            />
          </div>
        </div>

        <div className="mt-6 xl:hidden">
          <DashboardRightRail
            missionTitle={missionTitle}
            referenceLine={referenceLine}
            rewardLine={`Complete to earn ${Math.max(200, Math.round((dashboardState?.segmentNumber || 1) * 25))} XP`}
            sessionsCompleted={weeklySummary.sessionsCompleted}
            versesMemorized={weeklySummary.versesMemorized}
            questsCompleted={weeklySummary.questsCompleted}
            totalXpEarned={weeklySummary.totalXpEarned}
            onContinue={() => router.push(continueHref)}
            onViewProgress={() => router.push("/leaderboard")}
          />
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
