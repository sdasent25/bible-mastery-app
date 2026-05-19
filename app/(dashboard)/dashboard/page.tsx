"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import DashboardHero from "@/components/dashboard/DashboardHero"
import DashboardRecommendationCard from "@/components/dashboard/DashboardRecommendationCard"
import DashboardRightRail from "@/components/dashboard/DashboardRightRail"
import DashboardStatCard from "@/components/dashboard/DashboardStatCard"
import DashboardTopBar from "@/components/dashboard/DashboardTopBar"
import { getCompletedProgramSegmentCount } from "@/lib/campaignProgress"
import { canAccessFlashcards } from "@/lib/flashcardAccess"
import { getGenesisMissionMeta } from "@/lib/genesisCampaign"
import { getUserPlan as getPlanType } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"
import { getProgramById } from "@/lib/programs"
import { getProgramProgress, getResumeSegmentIndex } from "@/lib/programProgress"
import { hasCompletedToday } from "@/lib/streak"
import { createClient } from "@/lib/supabase/client"
import { getUserPlan } from "@/lib/userPlan"

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
  continueHref: string
  dailyMissionComplete: boolean
  xpEarned: number
  streak: number
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
  if (plan === "pro_plus") {
    return hasFamily ? "Shared with your family access." : "Premium training access is active."
  }
  if (plan === "pro") {
    return hasFamily ? "Shared plan access is active." : "Your training plan is active."
  }
  return "Upgrade anytime for deeper training access."
}

function resolveMissionContent(segmentId: string, segmentLabel: string) {
  const missionMeta = getGenesisMissionMeta(segmentId)
  const fallbackTitle = "Today's Mission"
  const fallbackSubtitle = "Continue your current Bible training mission."

  const hasRealTitle = missionMeta.title && missionMeta.title !== segmentId
  const hasRealSubtitle =
    missionMeta.subtitle &&
    missionMeta.subtitle !==
      "Continue through Genesis and deepen your mastery of the next sacred passage."

  return {
    title: hasRealTitle ? missionMeta.title : fallbackTitle,
    subtitle: hasRealSubtitle ? missionMeta.subtitle : fallbackSubtitle,
    referenceLine: segmentLabel || "Current Segment",
  }
}

function formatPassageLabel(label: string) {
  return label.replace(/(\d)\s*-\s*(\d)/g, "$1–$2")
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgradePlan = searchParams.get("upgrade")
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState("free")
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null)
  const [, setTrainingEnabled] = useState(true)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [upgradeMessage, setUpgradeMessage] = useState("")

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
        const currentSegmentId = currentSegment.segment.replaceAll("-", "_")
        const currentMissionContent = resolveMissionContent(
          currentSegmentId,
          currentSegment.label
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
          missionTitle: currentMissionContent.title,
          missionSubtitle: currentMissionContent.subtitle,
          continueHref,
          dailyMissionComplete: hasCompletedToday(),
          xpEarned: profile.xp || 0,
          streak: profile.streak || 0,
        })

        if (!membership?.family_id) {
          setLoading(false)
          return
        }

        if (!active) return
        setFamilyId(membership.family_id)
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
  const formattedCurrentSegmentLabel = formatPassageLabel(
    dashboardState?.currentSegmentLabel || "Current Segment"
  )
  const referenceLine = formattedCurrentSegmentLabel
  const focusPassage = formattedCurrentSegmentLabel
  const heroImageSrc = "/images/dashboard/dashboard-hero-walk-in-faith.png"
  const isProPlusPlan = plan === "pro_plus" || plan === "family_pro_plus"
  const planBadge = getPlanBadge(plan)
  const planMeta = getPlanMeta(plan, Boolean(familyId))
  const planActive = plan !== "free"
  const canAccessQuests = isProPlusPlan
  const canAccessVerseMemory = canAccessFlashcards(plan)
  const isPaidTrainingPlan =
    plan === "pro" ||
    plan === "pro_plus" ||
    plan === "family_pro" ||
    plan === "family_pro_plus"
  const trainingArenaBadge = isPaidTrainingPlan ? "Challenging • 5 Rounds" : "Preview Available"
  const trainingArenaCopy = isPaidTrainingPlan
    ? "Build discipline. Strengthen your spirit."
    : "Limited training access. Begin your first rounds."
  const questsBadge = canAccessQuests ? "Daily Quest Available" : "Unlock with Pro+"
  const questsCopy = canAccessQuests
    ? "Special challenges for Scripture mastery."
    : "Pro+ challenge mode for elite Scripture mastery."
  const verseMemoryBadge = canAccessVerseMemory
    ? "Daily Workout • 10 Verses"
    : "Unlock with Pro"

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
      caption: `Level ${athleteLevel}`,
      accent: "cyan" as const,
      iconSrc: "/images/icons/dashboard/xp-laurel-ring-transparent.png",
    },
    {
      title: "STREAK",
      value: String(dashboardState?.streak || 0),
      supporting: `${dashboardState?.streak || 0} Day${dashboardState?.streak === 1 ? "" : "s"}`,
      caption: "Current streak",
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
      title: "GENESIS PROGRESS",
      value: `${dashboardState?.genesisProgressPercent || 0}%`,
      supporting: "Genesis Campaign",
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
            <div className="ba-dashboard-main-scroll ba-scrollbar-hidden space-y-3 pb-1 sm:space-y-3.5 lg:space-y-3">
              <DashboardTopBar
                athleteLevel={athleteLevel}
                xpToNextLevel={xpToNextLevel}
                levelProgress={levelProgress}
                streak={dashboardState?.streak || 0}
                playerName={dashboardState?.playerName || "Athlete"}
                onUpgrade={() => router.push("/upgrade")}
                onSettings={() => router.push("/settings")}
              />

              <section className="flex flex-col gap-2 border-b border-amber-200/10 pb-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="ba-text-section-label mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-cyan-300/10 px-2.5 py-1 text-[10px] text-cyan-100">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.6)]" />
                    Genesis Campaign
                  </div>
                  <h1 className="ba-text-title text-[1.88rem] sm:text-[2.12rem] xl:text-[2.48rem]">
                    Welcome back, {dashboardState?.playerName || "Athlete"}.
                  </h1>
                  <p className="ba-text-body mt-0.75 max-w-2xl text-[0.88rem] leading-[1.45] text-[#f1c86a] sm:text-[0.92rem]">
                    Your mission. His Word. Your growth.
                  </p>
                  {upgradeMessage ? (
                    <p className="ba-font-ui mt-1.5 text-[0.72rem] text-cyan-100/88">
                      {upgradeMessage}
                    </p>
                  ) : null}
                </div>

                <div className="inline-flex items-center gap-2.5 self-start rounded-[1rem] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(9,16,28,0.92),rgba(5,10,18,0.92))] px-2.75 py-1.75 text-sm text-white/84 shadow-[0_14px_28px_rgba(0,0,0,0.16),0_0_24px_rgba(34,211,238,0.06)] sm:self-auto">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-[0.8rem] border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
                    {renderNavIcon("info", "h-3.5 w-3.5")}
                  </span>
                  <div>
                    <div className="ba-font-ui text-right text-[0.88rem] font-medium text-[#e8ddd1]">
                      {shortFormattedDate}
                    </div>
                    <div className="ba-text-section-label ba-text-cyan mt-0.25 text-right text-[0.56rem]">
                      {formattedCurrentSegmentLabel}
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

              <section className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 lg:grid-cols-4">
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

              <section className="space-y-0.5">
                <div className="ba-section-header">
                  <p className="ba-text-section-label text-[10px] text-[#f0e6d9]">
                    CHOOSE YOUR TRAINING MODE
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/training")}
                    className="ba-font-ui inline-flex items-center gap-1.5 text-[0.73rem] font-medium text-cyan-100/88 transition hover:text-white"
                  >
                    View All Modes
                    <span>{renderNavIcon("chevron-right", "h-4 w-4")}</span>
                  </button>
                </div>

                <div className="mt-1.5 grid gap-2.5 lg:grid-cols-3">
                  <DashboardRecommendationCard
                    title="Training Arena"
                    copy={trainingArenaCopy}
                    badge={trainingArenaBadge}
                    accent="training"
                    imageSrc="/images/dashboard/training-arena-hero-sanctum.png"
                    onClick={() => router.push("/training")}
                  />
                  <DashboardRecommendationCard
                    title="Quests"
                    copy={questsCopy}
                    badge={questsBadge}
                    lockedLabel="Pro+ Locked"
                    accent="quests"
                    imageSrc="/training/sections/pentateuch.png"
                    locked={!canAccessQuests}
                    onClick={() => router.push("/quests")}
                  />
                  <DashboardRecommendationCard
                    title="Verse Memory"
                    copy="Hide God&apos;s Word in your heart."
                    badge={verseMemoryBadge}
                    lockedLabel="Pro Locked"
                    accent="memory"
                    imageSrc="/images/dashboard/verse-memory-hero-gods-word.png"
                    locked={!canAccessVerseMemory}
                    onClick={() => router.push("/flashcards")}
                  />
                </div>
              </section>

              <div className="xl:hidden">
                <DashboardRightRail
                  currentMissionTitle={missionTitle}
                  dailyMissionComplete={dashboardState?.dailyMissionComplete || false}
                  streak={dashboardState?.streak || 0}
                  athleteLevel={athleteLevel}
                  xpEarned={dashboardState?.xpEarned || 0}
                  xpToNextLevel={xpToNextLevel}
                  levelProgress={levelProgress}
                  planLabel={planBadge}
                  planMeta={planMeta}
                  planActive={planActive}
                  onOpenMission={() => router.push(continueHref)}
                  onManagePlan={() => router.push("/upgrade")}
                />
              </div>
            </div>
          </div>

          <div className="ba-dashboard-right-rail hidden xl:block">
            <DashboardRightRail
              currentMissionTitle={missionTitle}
              dailyMissionComplete={dashboardState?.dailyMissionComplete || false}
              streak={dashboardState?.streak || 0}
              athleteLevel={athleteLevel}
              xpEarned={dashboardState?.xpEarned || 0}
              xpToNextLevel={xpToNextLevel}
              levelProgress={levelProgress}
              planLabel={planBadge}
              planMeta={planMeta}
              planActive={planActive}
              onOpenMission={() => router.push(continueHref)}
              onManagePlan={() => router.push("/upgrade")}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
