"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { getProgramById } from "@/lib/programs"
import { getProgramProgress } from "@/lib/programProgress"
import { getXp } from "@/lib/xp"
import { getIncorrectQuestions } from "@/lib/review"
import { playSound } from "@/lib/sound"
import { supabase } from "@/lib/supabase"
import Paywall from "@/components/Paywall"

type NodeState = "complete" | "active" | "locked"
type JourneyPlanType = "trial" | "pro" | "pro_plus"
type JourneyLockReason =
  | "TRIAL_LIMIT"
  | "PRO_REQUIRES_UPGRADE"
  | "UPGRADE_REQUIRED"
  | null

type JourneyAccessResult = {
  locked: boolean
  reason: JourneyLockReason
}

type JourneyNode = {
  label: string
  segment: string
  state: NodeState
  access: JourneyAccessResult
}

function getSegmentAccess(planType: JourneyPlanType, segment: string): JourneyAccessResult {
  const match = segment.match(/^([a-z]+)-(\d+)-(\d+)$/)
  if (!match) {
    return {
      locked: true,
      reason: "UPGRADE_REQUIRED",
    }
  }

  const [, bookSlug, , endChapter] = match
  const book = bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1)
  const chapter = Number(endChapter)

  if (planType === "trial") {
    if (book !== "Genesis" || chapter > 3) {
      return {
        locked: true,
        reason: "TRIAL_LIMIT",
      }
    }

    return {
      locked: false,
      reason: null,
    }
  }

  if (planType === "pro") {
    return {
      locked: true,
      reason: "PRO_REQUIRES_UPGRADE",
    }
  }

  if (planType === "pro_plus") {
    return {
      locked: false,
      reason: null,
    }
  }

  return {
    locked: true,
    reason: "UPGRADE_REQUIRED",
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
  const [nodes, setNodes] = useState<JourneyNode[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [planType, setPlanType] = useState<JourneyPlanType>("trial")
  const [xp, setXp] = useState(0)
  const [weakCount, setWeakCount] = useState(0)
  const selectedProgram = "genesis"
  const streak = 3
  const dailyProgress = 1
  const dailyGoal = 2
  const startX = useRef(0)

  const handleTrainWeak = () => {
    router.push("/quiz?mode=training")
  }

  const handleStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    startX.current = "touches" in event ? event.touches[0].clientX : event.clientX
  }

  const handleEnd = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const endX = "changedTouches" in event ? event.changedTouches[0].clientX : event.clientX
    const diff = startX.current - endX

    if (diff > 50 && activeIndex < nodes.length - 1) {
      setActiveIndex(activeIndex + 1)
    } else if (diff < -50 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }

  useEffect(() => {
    async function loadAllProgress() {
      const xpVal = await getXp()
      const incorrect = getIncorrectQuestions()
      const { data: userRes } = await supabase.auth.getUser()

      if (userRes?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type")
          .eq("id", userRes.user.id)
          .single()

        const nextPlan = profile?.plan_type
        setPlanType(
          nextPlan === "trial" || nextPlan === "pro" || nextPlan === "pro_plus"
            ? nextPlan
            : "trial",
        )
      } else {
        setPlanType("trial")
      }

      setProfileLoaded(true)

      setXp(xpVal)
      setWeakCount(incorrect.length)
    }

    void loadAllProgress()
  }, [])

  useEffect(() => {
    async function loadProgram() {
      const program = getProgramById(selectedProgram)
      let segments = []

      if (program) {
        segments = program.segments
      } else {
        segments = Array.from({ length: 10 }).map((_, i) => ({
          label: `${selectedProgram} ${i * 3 + 1}–${i * 3 + 3}`,
          segment: `${selectedProgram.toLowerCase()}-${i}`,
        }))
      }

      const progress = program
        ? await getProgramProgress(selectedProgram)
        : { completed: false, currentSegmentIndex: -1 }

      const mapped = segments.map((seg, index) => {
        let state: NodeState = "locked"

        if (!program || selectedProgram !== "genesis") {
          state = "locked"
        } else if (program) {
          if (progress.completed) {
            state = "complete"
          } else if (index < progress.currentSegmentIndex) {
            state = "complete"
          } else if (index === progress.currentSegmentIndex) {
            state = "active"
          }
        }

        const access = getSegmentAccess(planType, seg.segment)

        if (access.locked) {
          state = "locked"
        }

        return {
          label: seg.label,
          segment: seg.segment,
          state,
          access,
        }
      })

      let firstActiveIndex = mapped.findIndex((node) => node.state === "active")

      if (firstActiveIndex === -1 && mapped.length > 0) {
        mapped[0].state = "active"
        firstActiveIndex = 0
      }

      setNodes(mapped)
      setActiveIndex(firstActiveIndex)
      setLoading(false)
    }

    void loadProgram()
  }, [planType, selectedProgram])

  if (loading || !profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Loading...
      </div>
    )
  }

  const activeNode = nodes.find(n => n.state === "active")
  const focusedNode = nodes[activeIndex]
  const completedCount = nodes.filter(n => n.state === "complete").length
  const totalCount = nodes.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const program = getProgramById(selectedProgram)
  const focusedReason = focusedNode?.access.reason
  const paywallReason = (() => {
    if (!profileLoaded || nodes.length === 0) return null

    const currentNode = nodes[activeIndex] || nodes[0]
    if (!currentNode) return null

    const match = currentNode.segment.match(/^([a-z]+)-(\d+)-(\d+)$/)
    const currentBook = match
      ? match[1].charAt(0).toUpperCase() + match[1].slice(1)
      : null
    const currentChapter = match ? Number(match[3]) : null

    if (planType === "trial" && (currentBook !== "Genesis" || (currentChapter !== null && currentChapter > 3))) {
      return "TRIAL_LIMIT"
    }

    if (planType === "pro") {
      return "PRO_REQUIRES_UPGRADE"
    }

    return null
  })()

  if (paywallReason) {
    return (
      <Paywall
        reason={paywallReason}
        onSelectPlan={(plan) => {
          if (plan === "pro") {
            window.location.href = "/upgrade?plan=pro"
          }

          if (plan === "pro_plus") {
            window.location.href = "/upgrade?plan=pro_plus"
          }
        }}
      />
    )
  }

  return (
    <div className="relative flex min-h-screen bg-[#0B0F1A] text-white">
      <div className="absolute left-1/2 top-[-120px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-green-500 opacity-10 blur-[140px]" />
      <div className="absolute right-[-100px] top-[200px] h-[400px] w-[400px] rounded-full bg-blue-500 opacity-10 blur-[120px]" />
      <div className="relative flex-1 px-4 py-6 md:px-8">
        <div className="transition-opacity duration-300">
        <div className="flex justify-center mb-8">
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

        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">

          {/* PATH */}
          <div className="flex-1 relative">
            <div className="hidden md:flex justify-between mb-4">
              <button
                onClick={() => activeIndex > 0 && setActiveIndex(activeIndex - 1)}
                className="rounded-lg border border-gray-700 bg-[#1A2233] px-4 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                ←
              </button>

              <button
                onClick={() =>
                  activeIndex < nodes.length - 1 && setActiveIndex(activeIndex + 1)
                }
                className="rounded-lg border border-gray-700 bg-[#1A2233] px-4 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                →
              </button>
            </div>

            <div
              className="
                relative flex items-center justify-center
                h-[480px] md:h-[520px]
                overflow-hidden
                touch-pan-x
              "
              onMouseDown={handleStart}
              onMouseUp={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={handleEnd}
            >
              {nodes.map((node, index) => {
                const offset = index - activeIndex
                const isActive = offset === 0
                const isLocked = node.state === "locked"
                const translateX = offset * 160
                const scale = isActive ? 1.08 : 0.85
                const zIndex = 100 - Math.abs(offset)

                return (
                  <div
                    key={index}
                    className="absolute transition-all duration-300"
                    style={{
                      transform: `
                        translateX(${translateX}px)
                        translateY(${isActive ? "-10px" : "0px"})
                        scale(${scale})
                      `,
                      willChange: "transform",
                      zIndex,
                      opacity: Math.abs(offset) > 2 ? 0 : Math.abs(offset) > 0 ? 0.85 : 1,
                    }}
                  >
                    <div className="relative flex flex-col items-center">
                      {isActive && (
                        <div className="absolute inset-0 z-0 rounded-2xl border border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.45)] transition-all duration-300" />
                      )}

                      {isLocked && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 rounded-2xl">
                          <span className="text-xl">🔒</span>
                        </div>
                      )}

                      <div
                        onClick={() => {
                          if (index === activeIndex) {
                            if (!isLocked) {
                              playSound("/sounds/tap.mp3")
                              router.push(`/segment?program=${selectedProgram}&segment=${node.segment}`)
                            }
                          } else {
                            setActiveIndex(index)
                          }
                        }}
                        className={`
                          relative w-56 md:w-64 h-72 md:h-80
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

            <div className="flex justify-center mt-6 gap-2">
              {nodes.map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all
                    ${i === activeIndex ? "bg-green-400 scale-125" : "bg-gray-600"}
                  `}
                />
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="h-fit w-full space-y-6 rounded-2xl border border-gray-800 bg-[#121826] p-6 shadow-lg transition-all duration-300 hover:shadow-xl backdrop-blur-sm lg:w-80">

            <h2 className="text-xl font-bold mb-4">Your Progress</h2>

            <div className="space-y-2">
              <div className="text-sm text-gray-200 mb-1">
                {completedCount} / {totalCount} complete
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {!program && (
              <div className="mt-4 text-sm text-yellow-400">
                🔒 Complete previous book to unlock this one
              </div>
            )}

            {focusedReason === "TRIAL_LIMIT" && (
              <div className="mt-4 text-sm text-yellow-400">
                Trial access is limited to Genesis 1-3.
              </div>
            )}

            {focusedReason === "PRO_REQUIRES_UPGRADE" && (
              <div className="mt-4 text-sm text-yellow-400">
                Pro access requires an upgrade to Pro Plus for Journey chapters.
              </div>
            )}

            {focusedReason === "UPGRADE_REQUIRED" && (
              <div className="mt-4 text-sm text-yellow-400">
                Upgrade required to continue this Journey path.
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
                  style={{ width: `${(dailyProgress / dailyGoal) * 100}%` }}
                />
              </div>

              <div className="text-xs text-gray-200 mt-1">
                {dailyProgress} / {dailyGoal}
              </div>
            </div>

            <button
              onClick={() => {
                if (!program) return
                if (activeNode) {
                  playSound("/sounds/click.mp3")
                  router.push(`/segment?program=${selectedProgram}&segment=${activeNode.segment}`)
                }
              }}
              className="w-full rounded-xl bg-green-500 px-6 py-3 text-lg font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!activeNode}
            >
              Continue →
            </button>

          </div>
        </div>
        </div>
      </div>

    </div>
  )
}
