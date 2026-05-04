"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getProgramById } from "@/lib/programs"
import { nodes } from "@/lib/nodes"
import { getProgramProgress, getResumeSegmentIndex } from "@/lib/programProgress"
import { getUserPlan } from "@/lib/getUserPlan"
import { hasCompletedToday } from "@/lib/streak"
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
  title?: string
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
  const [activeIndex, setActiveIndex] = useState(1)
  const [selectedSegment, setSelectedSegment] = useState(nodes[0]?.id)
  const [planType, setPlanType] = useState<JourneyPlanType | null>(null)
  const [xp, setXp] = useState(0)
  const [weakCount, setWeakCount] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(1)
  const [dailyProgress, setDailyProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState("")
  const [completionMode, setCompletionMode] = useState(false)
  const selectedProgram = "genesis"
  const streak = 3
  const startX = useRef(0)

  useEffect(() => {
    const checkCompletion = async () => {
      const completed = await hasCompletedToday()
      setCompletionMode(completed)
    }

    checkCompletion()
  }, [])

  useEffect(() => {
    if (completionMode) {
      setActiveIndex(1)
    }
  }, [completionMode])

  useEffect(() => {
    const container = document.querySelector("#node-scroll")

    if (!container) return

    const handleScroll = () => {
      const scrollEl = container as HTMLElement
      const track = scrollEl.firstElementChild as HTMLElement | null
      if (!track) return

      const children = Array.from(track.children)
      const center = scrollEl.scrollLeft + scrollEl.offsetWidth / 2

      let closest = 0
      let minDist = Infinity

      children.forEach((child, index) => {
        const el = child as HTMLElement
        const childCenter = el.offsetLeft + el.offsetWidth / 2
        const dist = Math.abs(center - childCenter)

        if (dist < minDist) {
          minDist = dist
          closest = Number(el.dataset.nodeIndex ?? index)
        }
      })

      setActiveIndex(closest)
    }

    container.addEventListener("scroll", handleScroll)

    return () => container.removeEventListener("scroll", handleScroll)
  }, [completionMode])

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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setHours(24, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / (1000 * 60)) % 60)

      setTimeLeft(`${hours}h ${minutes}m`)
    }, 1000)

    return () => clearInterval(interval)
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
        const nextPlan = currentPlan ?? "free"
        setPlanType(nextPlan as JourneyPlanType)
        console.log("SET PLAN TYPE:", nextPlan)
      } else {
        setPlanType("free")
      }

      setProfileLoaded(true)

      setXp(xpVal)
      setWeakCount(incorrect.length)
    }

    void loadAllProgress()
  }, [])

  useEffect(() => {
    if (!profileLoaded || planType === null) return

    async function loadProgram() {
      const segments = nodes

      const progress = await getProgramProgress(selectedProgram)
      const currentSegmentIndex = getResumeSegmentIndex(progress, segments.length)
      const start = currentSegmentIndex
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
        const isLocked = index > currentSegmentIndex
        let isAccessible = false

        if (ACCESS.journey && !isLocked) {
          isAccessible = true
        } else if (ACCESS.preview && index === 0) {
          isAccessible = true
        }

        const isCompleted =
          hasPaidAccess && (progress.completed || index < currentSegmentIndex)
        const isActive =
          (hasPaidAccess && !progress.completed && index === currentSegmentIndex) ||
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
          currentSegmentIndex,
          isAccessible,
        })

        return {
          title: (seg as { title?: string }).title,
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
  }, [dailyGoal, planType, selectedProgram])

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
  const progress = dailyProgress
  const progressPercent = Math.min(
    (dailyProgress / dailyGoal) * 100,
    100,
  )
  const program = getProgramById(selectedProgram)
  const nextSegment = nodes[safeCurrentIndex + 1]
  const isFree = planType === "free"
  const isPro =
    planType === "pro" || planType === "family_pro"
  const isProPlus =
    planType === "pro_plus" || planType === "family_pro_plus"
  const ACCESS = {
    journey: isPro || isProPlus,
    preview: isFree,
  }
  const devBypass =
    process.env.NEXT_PUBLIC_DEV_BYPASS === "true"
  const dailyLimitReached =
    isFree && dailyProgress >= 1
  const effectiveDailyLimitReached =
    devBypass ? false : dailyLimitReached
  const isPlanReady = planType !== null

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute left-1/2 top-[-120px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-green-500 opacity-10 blur-[140px]" />
      <div className="absolute right-[-100px] top-[200px] h-[400px] w-[400px] rounded-full bg-blue-500 opacity-10 blur-[120px]" />
      <div className="relative flex-1 px-4 py-6 md:px-8">
        <div className="transition-opacity duration-300">
          <div className="flex flex-col lg:flex-row w-full">

            <div className="flex-1 flex flex-col items-center px-4">
              {completionMode ? (
                <div className="w-full flex flex-col items-center">
                  <div className="text-center mt-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      🔥 Day 1 Complete
                    </h1>
                    <p className="text-yellow-300 mt-2">
                      You showed up today. Keep it going tomorrow.
                    </p>
                  </div>
                  <div className="text-center mt-4 text-white/80">
                    📖 Genesis
                  </div>

                  <div
                    id="node-scroll"
                    className="
                      w-full
                      overflow-x-auto
                      flex
                      justify-start
                      gap-6
                      px-6
                      snap-x snap-mandatory
                      scroll-smooth
                    "
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    <div
                      className="flex items-center gap-6"
                      onMouseDown={handleStart}
                      onMouseUp={handleEnd}
                      onTouchStart={handleStart}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={handleEnd}
                    >
                      <div className="min-w-[40%] md:min-w-[30%]" />
                      {visibleNodes.map((node) => {
                        const index = journeyNodes.findIndex((journeyNode) => journeyNode.segment === node.segment)
                        const isActive = index === activeIndex
                        const isCompletedNode = completionMode && index === 0
                        const isNextNode = completionMode && index === 1
                        const isFutureNode = completionMode && index > 1

                        return (
                          <div
                            key={index}
                            data-node-index={index}
                            className="snap-center flex-shrink-0"
                          >
                            <div
                              className={`
                                relative
                                w-[220px] md:w-[260px]
                                aspect-[9/16]
                                transition-all duration-300 ease-out
                                ${isActive ? "scale-110 z-20" : "scale-90"}
                                ${isNextNode ? "shadow-[0_0_40px_rgba(34,197,94,0.35)] animate-[pulse_2.5s_ease-in-out_infinite]" : ""}
                                ${isCompletedNode ? "opacity-60" : ""}
                                ${isFutureNode ? "opacity-30" : ""}
                                ${isActive ? "translate-y-0" : "translate-y-2"}
                              `}
                            >
                              <img
                                src={`/icons/genesis/${getNodeIcon(node.label)}`}
                                className="w-full h-full object-contain"
                                alt={node.label}
                              />

                              {isNextNode && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-black/60 rounded-full p-4 text-white text-xl">
                                    🔒
                                  </div>
                                </div>
                              )}

                              {isCompletedNode && (
                                <div className="absolute bottom-2 w-full text-center text-white text-sm">
                                  ✔ Completed
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <div className="min-w-[40%] md:min-w-[30%]" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="text-center mt-6">
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

                  <div className="mt-8 md:mt-16 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
                    <div className="hidden md:flex justify-between mb-4 w-full max-w-[960px] px-4">
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
                      id="node-scroll"
                      className="
                        w-full
                        overflow-x-auto
                        flex
                        justify-start
                        gap-6
                        px-6
                        snap-x snap-mandatory
                        scroll-smooth
                      "
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      <div
                        className="flex items-center gap-6"
                        onMouseDown={handleStart}
                        onMouseUp={handleEnd}
                        onTouchStart={handleStart}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={handleEnd}
                      >
                        <div className="min-w-[40%] md:min-w-[30%]" />
                        {visibleNodes.map((node) => {
                          const index = journeyNodes.findIndex((journeyNode) => journeyNode.segment === node.segment)
                          const dayNumber = index + 1
                          const displayTitle = `Day ${dayNumber}: ${node.title || node.label}`
                          const isActive = index === activeIndex
                          const isLocked = node.state === "locked"
                          const isAccessible = node.isAccessible
                          const isCompletedNode = completionMode && index === 0
                          const isNextNode = completionMode && index === 1
                          const isFutureNode = completionMode && index > 1
                          const isLockedToday = completionMode
                          const isDailyLocked = (isFree && effectiveDailyLimitReached && isActive) || isLockedToday

                          return (
                            <div
                              key={index}
                              data-node-index={index}
                              className="snap-center flex-shrink-0"
                            >
                              <div
                              className={`
                                  relative
                                  w-[220px] md:w-[260px]
                                  aspect-[9/16]
                                  transition-all duration-300 ease-out
                                  ${isActive ? "scale-110 z-20" : "scale-90"}
                                  ${isNextNode ? "shadow-[0_0_40px_rgba(34,197,94,0.35)] animate-[pulse_2.5s_ease-in-out_infinite]" : ""}
                                  ${isCompletedNode ? "opacity-60" : ""}
                                  ${isFutureNode ? "opacity-30" : ""}
                                  ${isActive ? "translate-y-0" : "translate-y-2"}
                               `}
                             >
                              <div className="relative flex flex-col items-center h-full">
                                {node.isTodayTarget && !isLocked && !isLockedToday && (
                                  <div className="absolute inset-[-10px] z-0 rounded-[1.75rem] border border-cyan-400/40 bg-cyan-400/5 shadow-[0_0_35px_rgba(34,211,238,0.18)]" />
                                )}

                                {isActive && !isLockedToday && (
                                  <div className="absolute inset-0 z-0 rounded-2xl border border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.45)] transition-all duration-300" />
                                )}

                                {isLocked && (
                                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl">
                                    <span className="text-xl">🔒</span>
                                  </div>
                                )}

                                {isDailyLocked && !isLocked && (
                                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl">
                                    <div className="text-center">
                                      <div className="text-xl">🔒</div>
                                      <div className="mt-2 text-xs font-semibold text-white">You've completed today's mission</div>
                                    </div>
                                  </div>
                                )}

                                <div
                                  onClick={() => {
                                    if (completionMode) return
                                    const isFirstNode = index === 0

                                    if (isFree && !isFirstNode) {
                                      console.error("REDIRECT TRIGGERED HERE", {
                                        location: "app/journey/page.tsx",
                                        planType,
                                        isPro,
                                        isProPlus,
                                        activeProgramId: null,
                                        segmentParam: node.segment,
                                        safeDepth: null
                                      });
                                      router.push("/pricing")
                                      return
                                    }

                                    if (isFree && isFirstNode) {
                                      playSound("/sounds/tap.mp3")

                                      router.push(`/segment?segment=${node.segment}`)
                                      return
                                    }

                                    if (isLocked) return

                                    if (index === activeIndex) {
                                      if (isFree && effectiveDailyLimitReached) {
                                        return
                                      }

                                      if (!isAccessible) {
                                        return
                                      }

                                      playSound("/sounds/tap.mp3")

                                      if (isFree) {
                                        router.push(`/segment?segment=${node.segment}`)
                                        return
                                      }

                                      router.push(`/segment?program=${selectedProgram}&segment=${node.segment}`)
                                    } else {
                                      setActiveIndex(index)
                                      setSelectedSegment(node.segment)
                                    }
                                  }}
                                  className={`
                                    relative
                                    w-full h-full
                                    rounded-2xl overflow-hidden
                                    ${isLocked || isDailyLocked ? "cursor-not-allowed" : "cursor-pointer"}
                                    border
                                    transition-all duration-300
                                    active:scale-[0.98]
                                    hover:scale-[1.02]
                                    hover:shadow-xl
                                    ${isActive ? "border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.45)]" : "border-gray-600"}
                                  `}
                                >
                                  <img
                                    src={`/icons/genesis/${getNodeIcon(node.label)}`}
                                    alt={node.label}
                                    className={`w-full h-full object-contain ${(isLocked || isDailyLocked) ? "opacity-50 saturate-90" : ""}`}
                                  />

                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                  {isNextNode && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="bg-black/60 rounded-full p-4 text-white text-xl">
                                        🔒
                                      </div>
                                    </div>
                                  )}

                                  {isCompletedNode && (
                                    <div className="absolute bottom-2 w-full text-center text-white text-sm">
                                      ✔ Completed
                                    </div>
                                  )}
                                </div>

                                {isActive && !isLocked && !isLockedToday && (
                                  <div className="absolute -top-6 text-yellow-300 font-bold text-sm animate-float-slow">
                                    START
                                  </div>
                                )}

                                <div className="mt-3 text-center">
                                  <div className="font-semibold text-white">
                                    {displayTitle}
                                  </div>
                                  <div className="text-sm text-slate-300">
                                    {node.label}
                                  </div>
                                  {isActive && (
                                    <div className="text-center mt-2 text-white font-semibold">
                                      {index === 1 ? "The Fall" : ""}
                                    </div>
                                  )}
                                </div>
                            </div>
                              </div>
                            </div>
                          )
                        })}
                        <div className="min-w-[40%] md:min-w-[30%]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full lg:w-[320px] mt-6 lg:mt-0 lg:ml-6">
              <div className="lg:sticky lg:top-6">
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

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="text-xs text-gray-200 mt-1">
                {completionMode ? "✅ Completed" : `${progress} / 1`}
              </div>
            </div>

            <div className="flex-shrink-0 pb-4">
              <button
                onClick={() => {
                  if (!program || !activeNode || !isPlanReady || (isFree && effectiveDailyLimitReached) || completionMode) return

                  playSound("/sounds/click.mp3")

                  // FREE -> normal access
                  if (planType === "free") {
                    router.push(`/segment?segment=${activeNode.segment}`)
                    return
                  }

                  // ALL PAID PLANS -> full access
                  router.push(`/segment?program=${selectedProgram}&segment=${activeNode.segment}`)
                }}
                className="w-full rounded-xl bg-green-500 px-6 py-3 text-lg font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!activeNode || !isPlanReady || (isFree && effectiveDailyLimitReached) || completionMode}
              >
                {completionMode ? "Come Back Tomorrow" : "Continue →"}
              </button>
            </div>

            {!(!ACCESS.journey && isFree) && effectiveDailyLimitReached && (
              <div className="mt-4 text-center text-sm text-yellow-400">
                {"You've completed today's mission. Come back tomorrow."}
              </div>
            )}

            {isFree && effectiveDailyLimitReached && nextSegment && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 opacity-50 blur-[1px] pointer-events-none">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Tomorrow&apos;s Mission
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-base font-semibold text-white">
                    {nextSegment.label}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    Next mission in {timeLeft}
                  </div>
                </div>
              </div>
            )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
