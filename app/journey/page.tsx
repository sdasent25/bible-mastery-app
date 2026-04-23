"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { getProgramById } from "@/lib/programs"
import { nodes } from "@/lib/nodes"
import { getProgramProgress } from "@/lib/programProgress"
import { getUserPlan } from "@/lib/getUserPlan"
import { getXp } from "@/lib/xp"
import { getIncorrectQuestions } from "@/lib/review"
import { playSound } from "@/lib/sound"
import { supabase } from "@/lib/supabase"

type NodeState = "complete" | "active" | "locked"
type JourneyPlanType =
  | "free"
  | "pro"
  | "pro_plus"
  | "family_pro"
  | "family_pro_plus"
type JourneyLockReason = "UPGRADE_REQUIRED" | null

type JourneyAccessResult = {
  locked: boolean
  reason: JourneyLockReason
}

type JourneyNode = {
  label: string
  segment: string
  state: NodeState
  access: JourneyAccessResult
  isAccessible: boolean
  isTodayTarget: boolean
}

function getSegmentAccess(
  planType: JourneyPlanType,
  isAccessible: boolean,
): JourneyAccessResult {
  return {
    locked: !isAccessible,
    reason: !isAccessible ? "UPGRADE_REQUIRED" : null,
  }
}

function getNodeIcon(label: string) {
  if (label.includes("1–3")) return "creation.png"
  if (label.includes("4–6")) return "people.png"
  if (label.includes("7–9")) return "flood.png"
  if (label.includes("10–12")) return "tower.png"
  if (label.includes("13–15")) return "promise.png"
  if (label.includes("16–18")) return "covenant.png"
  if (label.includes("19–21")) return "fire.png"
  if (label.includes("22–24")) return "sacrifice.png"
  if (label.includes("25–27")) return "twins.png"
  if (label.includes("28–30")) return "ladder.png"
  if (label.includes("31–33")) return "reunion.png"
  if (label.includes("34–36")) return "conflict.png"
  if (label.includes("37–39")) return "coat.png"
  if (label.includes("40–42")) return "prison.png"
  if (label.includes("43–46")) return "provision.png"
  if (label.includes("47–50")) return "egypt.png"

  return "globe.svg"
}

export default function JourneyPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedSegment, setSelectedSegment] = useState(nodes[0]?.id)
  const [planType, setPlanType] = useState<JourneyPlanType | null>(null)
  const [xp, setXp] = useState(0)
  const [weakCount, setWeakCount] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(1)
  const [dailyProgress, setDailyProgress] = useState(0)
  const [previewCompleted, setPreviewCompleted] = useState(false)
  const selectedProgram = "genesis"
  const streak = 3
  const startX = useRef(0)

  useEffect(() => {
    const loadPlan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("user_settings")
        .select("segments_per_day")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Error loading plan:", error)
        return
      }

      if (data?.segments_per_day) {
        setDailyGoal(data.segments_per_day)
      }
    }

    void loadPlan()
  }, [])

  useEffect(() => {
    const loadDailyProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split("T")[0]

      const { data } = await supabase
        .from("daily_progress")
        .select("segments_completed")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle()

      if (data?.segments_completed) {
        setDailyProgress(data.segments_completed)
      }
    }

    void loadDailyProgress()
  }, [])

  const handleTrainWeak = () => {
    router.push("/quiz?mode=training")
  }

  const handleStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    startX.current = "touches" in event ? event.touches[0].clientX : event.clientX
  }

  const handleEnd = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const endX = "changedTouches" in event ? event.changedTouches[0].clientX : event.clientX
    const diff = startX.current - endX

    if (diff > 50 && activeIndex < journeyNodes.length - 1) {
      const nextIndex = activeIndex + 1
      setActiveIndex(nextIndex)
      setSelectedSegment(journeyNodes[nextIndex]?.segment)
    } else if (diff < -50 && activeIndex > 0) {
      const nextIndex = activeIndex - 1
      setActiveIndex(nextIndex)
      setSelectedSegment(journeyNodes[nextIndex]?.segment)
    }
  }

  useEffect(() => {
    async function loadAllProgress() {
      const xpVal = await getXp()
      const incorrect = getIncorrectQuestions()
      const { data: userRes } = await supabase.auth.getUser()
      const currentPlan = await getUserPlan()

      if (userRes?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("preview_completed")
          .eq("id", userRes.user.id)
          .single()

        const nextPlan = currentPlan ?? "free"
        setPlanType(nextPlan as JourneyPlanType)
        console.log("SET PLAN TYPE:", nextPlan)
        setPreviewCompleted(profile?.preview_completed === true)
      } else {
        setPlanType("free")
        setPreviewCompleted(false)
      }

      setProfileLoaded(true)

      setXp(xpVal)
      setWeakCount(incorrect.length)
      setDailyGoal(2)
    }

    void loadAllProgress()
  }, [])

  useEffect(() => {
    if (!profileLoaded || planType === null) return

    async function loadProgram() {
      const segments = nodes

      let progress = await getProgramProgress(selectedProgram)

      if (!progress || progress.currentSegmentIndex === undefined) {
        progress = {
          programId: selectedProgram,
          completed: false,
          currentSegmentIndex: 0,
          bonusAwarded: false,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: masteryData } = user
        ? await supabase
          .from("user_segment_mastery")
          .select("segment, mastered")
          .eq("user_id", user.id)
        : { data: null }

      const masteredSet = new Set(
        (masteryData || [])
          .filter(m => m.mastered)
          .map(m => m.segment)
      )

      let unlockIndex = 0

      for (let i = 0; i < nodes.length; i++) {
        if (masteredSet.has(nodes[i].id)) {
          unlockIndex = i + 1
        } else {
          break
        }
      }

      const { data: completionProfile } = user
        ? await supabase
          .from("profiles")
          .select("last_completed_date")
          .eq("id", user.id)
          .single()
        : { data: null }

      const today = new Date().toISOString().split("T")[0]

      const alreadyCompletedToday =
        completionProfile?.last_completed_date === today

      if (alreadyCompletedToday) {
        unlockIndex = Math.max(0, unlockIndex - 1)
      }

      // TODO: update last_completed_date after quiz completion

      const start = unlockIndex
      const end = start + dailyGoal
      const isFree = planType === "free"
      const isPro =
        planType === "pro" || planType === "family_pro"
      const isProPlus =
        planType === "pro_plus" || planType === "family_pro_plus"
      const hasPaidAccess = isPro || isProPlus
      const ACCESS = {
        journey: isPro || isProPlus,
        preview: isFree,
      }

      const mapped = segments.map((seg, index) => {
        const segmentId = seg.id
        const isLocked = index > unlockIndex
        let isAccessible = false

        if (ACCESS.journey && !isLocked) {
          isAccessible = true
        } else if (ACCESS.preview && index === 0) {
          isAccessible = true
        }

        const isCompleted =
          hasPaidAccess && masteredSet.has(segmentId)
        const isActive =
          (hasPaidAccess && index === unlockIndex) ||
          (isFree && index === 0)

        const access = getSegmentAccess(
          (planType ?? "free") as JourneyPlanType,
          isAccessible
        )
        const isTodayTarget = index >= start && index < end
        let state: NodeState = "locked"

        if (isCompleted) {
          state = "complete"
        } else if (isActive) {
          state = "active"
        }

        console.log("NODE DEBUG:", {
          index,
          label: seg.label,
          planType,
          currentSegmentIndex: progress.currentSegmentIndex,
          unlockIndex,
          isAccessible,
        })

        return {
          label: seg.label,
          segment: segmentId,
          state,
          access,
          isAccessible,
          isTodayTarget,
        }
      })

      const firstActiveIndex = mapped.findIndex((node) => node.state === "active")

      setJourneyNodes(mapped)
      const nextActiveIndex = firstActiveIndex === -1 ? 0 : firstActiveIndex
      setActiveIndex(nextActiveIndex)
      setSelectedSegment(mapped[nextActiveIndex]?.segment)
      setLoading(false)
    }

    void loadProgram()
  }, [dailyGoal, planType, previewCompleted, selectedProgram])

  useEffect(() => {
    console.log("JOURNEY FINAL PLAN:", planType)
  }, [planType])

  useEffect(() => {
    console.log("FINAL PLAN STATE:", planType)
  }, [planType])

  if (loading || !profileLoaded || planType === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Loading...
      </div>
    )
  }

  const activeNode = journeyNodes.find(n => n.state === "active")
  const currentIndex = journeyNodes.findIndex(n => n.segment === selectedSegment)
  const safeCurrentIndex = currentIndex === -1 ? activeIndex : currentIndex
  const visibleNodes = journeyNodes.slice(
    Math.max(0, safeCurrentIndex - 2),
    safeCurrentIndex + 3
  )
  const completedCount = journeyNodes.filter(n => n.state === "complete").length
  const totalCount = journeyNodes.length
  const overallProgressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const progressPercent = Math.min(
    (dailyProgress / dailyGoal) * 100,
    100,
  )
  const program = getProgramById(selectedProgram)
  const isFree = planType === "free"
  const isPro =
    planType === "pro" || planType === "family_pro"
  const isProPlus =
    planType === "pro_plus" || planType === "family_pro_plus"
  const ACCESS = {
    journey: isPro || isProPlus,
    preview: isFree,
  }
  const hasJourneyAccess = isPro || isProPlus
  const isPlanReady = planType !== null

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute left-1/2 top-[-120px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-green-500 opacity-10 blur-[140px]" />
      <div className="absolute right-[-100px] top-[200px] h-[400px] w-[400px] rounded-full bg-blue-500 opacity-10 blur-[120px]" />
      <div className="relative flex-1 px-4 py-6 md:px-8">
        <div className="transition-opacity duration-300">
        <div className="flex-shrink-0 flex justify-center mb-8">
          <div className="text-center max-w-md">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              {getProgramById(selectedProgram)?.title?.replace(" Program","") || selectedProgram}
            </h1>

            <p className="text-gray-200 mt-1">
              Progress through Scripture
            </p>
          </div>
        </div>

        <div className="lg:hidden sticky top-0 z-30 mb-4">
          <div className="bg-[#121A2B] rounded-xl px-4 py-3 shadow-md">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-orange-400 font-semibold animate-pulse">
                🔥 {streak}
              </span>
              <span className="text-gray-200">
                🎯 Goal
              </span>
              <span className="font-semibold text-white">
                {dailyProgress} / {dailyGoal}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400"
                style={{ width: `${(dailyProgress / dailyGoal) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {weakCount > 0 && (
          <div className="lg:hidden mb-4">
            <button
              onClick={handleTrainWeak}
              className="w-full rounded-xl border border-gray-700 bg-[#1A2233] px-6 py-3 text-white transition-all duration-200 hover:scale-105 hover:bg-[#222C40] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Train Weak Areas
            </button>
          </div>
        )}

        <div className="flex w-full flex-col lg:flex-row justify-center gap-12 px-8">

          {/* PATH */}
          <div className="mt-16 flex flex-col items-center justify-center flex-1 max-w-4xl">
            <div className="hidden md:flex justify-between mb-4">
              <button
                onClick={() => {
                  if (activeIndex <= 0) return
                  const nextIndex = activeIndex - 1
                  setActiveIndex(nextIndex)
                  setSelectedSegment(journeyNodes[nextIndex]?.segment)
                }}
                className="rounded-lg border border-gray-700 bg-[#1A2233] px-4 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                ←
              </button>

              <button
                onClick={() => {
                  if (activeIndex >= journeyNodes.length - 1) return
                  const nextIndex = activeIndex + 1
                  setActiveIndex(nextIndex)
                  setSelectedSegment(journeyNodes[nextIndex]?.segment)
                }}
                className="rounded-lg border border-gray-700 bg-[#1A2233] px-4 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                →
              </button>
            </div>

            <div
              className="
                flex items-center justify-center gap-6 relative
                touch-pan-x
              "
              onMouseDown={handleStart}
              onMouseUp={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={handleEnd}
            >
              {visibleNodes.map((node) => {
                const index = journeyNodes.findIndex((journeyNode) => journeyNode.segment === node.segment)
                const offset = index - activeIndex
                const isActive = offset === 0
                const isLocked = node.state === "locked"
                const isAccessible = node.isAccessible

                return (
                  <div
                    key={index}
                    className={`transition-all duration-300 ${
                      isActive ? "scale-125 z-20" : "scale-95 opacity-60"
                    }`}
                  >
                    <div className="relative flex flex-col items-center">
                      {node.isTodayTarget && !isLocked && (
                        <div className="absolute inset-[-10px] z-0 rounded-[1.75rem] border border-cyan-400/40 bg-cyan-400/5 shadow-[0_0_35px_rgba(34,211,238,0.18)]" />
                      )}

                      {isActive && (
                        <div className="absolute inset-0 z-0 rounded-2xl border border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.45)] transition-all duration-300" />
                      )}

                      {isLocked && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl">
                          <span className="text-xl">🔒</span>
                        </div>
                      )}

                      <div
                        onClick={() => {
                          if (isLocked) return

                          if (index === activeIndex) {
                            if (!isAccessible) {
                              router.push("/pricing?source=journey_locked")
                              return
                            }

                            playSound("/sounds/tap.mp3")

                            if (isFree) {
                              router.push(`/segment?program=${selectedProgram}&segment=${node.segment}&preview=true`)
                              return
                            }

                            router.push(`/segment?program=${selectedProgram}&segment=${node.segment}`)
                          } else {
                            setActiveIndex(index)
                            setSelectedSegment(node.segment)
                          }
                        }}
                        className={`
                          relative min-w-[320px] max-w-[320px] h-72 md:h-80
                          rounded-2xl overflow-hidden
                          cursor-pointer
                          border
                          transition-all duration-300
                          active:scale-[0.98]
                          hover:scale-[1.02]
                          hover:shadow-xl
                          ${isActive
                            ? "border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.45)]"
                            : "border-gray-600"}
                        `}
                      >
                        <Image
                          src={`/icons/genesis/${getNodeIcon(node.label)}`}
                          alt="node"
                          fill
                          className={`
                            object-cover
                            ${isLocked ? "opacity-70 saturate-90" : ""}
                          `}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>

                      {isActive && !isLocked && (
                        <div className="absolute -top-6 text-yellow-300 font-bold text-sm animate-float-slow">
                          START
                        </div>
                      )}

                      <div className="mt-3 text-center">
                        <div className="font-semibold text-white">
                          {node.label}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="w-[320px] flex-shrink-0">
          <div className="h-fit w-full space-y-6 rounded-2xl border border-gray-800 bg-[#121826] p-6 shadow-lg transition-all duration-300 hover:shadow-xl backdrop-blur-sm lg:w-80">

            <h2 className="text-xl font-bold mb-4">Your Progress</h2>

            <div className="space-y-2">
              <div className="text-sm text-gray-200 mb-1">
                {completedCount} / {totalCount} complete
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>

            {!program && (
              <div className="mt-4 text-sm text-yellow-400">
                🔒 Complete previous book to unlock this one
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm text-gray-200">XP</div>
              <div className="text-lg font-bold">{xp}</div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-2">
              <div className="text-sm text-gray-200">Weak Areas</div>
              <div className="text-lg font-semibold">
                {weakCount > 0 ? `${weakCount} to review` : "None"}
              </div>
            </div>

            {weakCount > 0 && (
              <button
                onClick={handleTrainWeak}
                className="mt-2 w-full rounded-xl border border-gray-700 bg-[#1A2233] px-6 py-3 text-white transition-all duration-200 hover:scale-105 hover:bg-[#222C40] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Train Weak Areas →
              </button>
            )}

            <div className="h-px bg-white/5" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">
                  🔥 Streak
                </span>

                <span className="text-orange-400 font-semibold">
                  {streak} days
                </span>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-2">
              <div className="text-sm text-gray-200 mb-1">
                🎯 Daily Goal
              </div>

              <div className="text-sm font-semibold mb-2">
                Complete {dailyGoal} segments
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="text-xs text-gray-200 mt-1">
                {dailyProgress} / {dailyGoal}
              </div>
            </div>

            <div className="flex-shrink-0 pb-4">
              <button
                onClick={() => {
                  if (!program || !activeNode || !isPlanReady) return

                  playSound("/sounds/click.mp3")

                  // FREE -> preview only
                  if (planType === "free") {
                    router.push(`/segment?program=${selectedProgram}&segment=${activeNode.segment}&preview=true`)
                    return
                  }

                  // ALL PAID PLANS -> full access
                  router.push(`/segment?program=${selectedProgram}&segment=${activeNode.segment}`)
                }}
                className="w-full rounded-xl bg-green-500 px-6 py-3 text-lg font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!activeNode || !isPlanReady}
              >
                Continue →
              </button>
            </div>

            {isFree && (
              <div className="mt-4 text-center text-sm text-yellow-400">
                Preview mode: Complete this first segment to explore.
                Upgrade to unlock your full journey.
              </div>
            )}

          </div>
          </div>
        </div>
        </div>
      </div>

    </div>
  )
}
