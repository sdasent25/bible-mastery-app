"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { getProgramById, programs } from "@/lib/programs"
import { bibleSections } from "@/lib/bibleStructure"
import { getProgramProgress } from "@/lib/programProgress"
import { getXp } from "@/lib/xp"
import { getIncorrectQuestions } from "@/lib/review"
import { playSound } from "@/lib/sound"

type NodeState = "complete" | "active" | "locked"

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

function generatePreviewSegments(bookName: string) {
  const segments = []

  for (let i = 1; i <= 10; i++) {
    segments.push({
      label: `${bookName} ${i * 3 - 2}–${i * 3}`,
      segment: `${bookName.toLowerCase()}-${i}`,
    })
  }

  return segments
}

export default function JourneyPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Pentateuch: true,
  })
  const [selectedProgram, setSelectedProgram] = useState("genesis")

  const [nodes, setNodes] = useState<
    { label: string; segment: string; state: NodeState }[]
  >([])
  const [activeIndex, setActiveIndex] = useState(0)

  const [xp, setXp] = useState(0)
  const [weakCount, setWeakCount] = useState(0)
  const [completedPrograms, setCompletedPrograms] = useState<string[]>([])
  const [streak, setStreak] = useState(3)
  const [dailyProgress, setDailyProgress] = useState(1)
  const dailyGoal = 2
  let startX = 0

  const handleTrainWeak = () => {
    router.push("/quiz?mode=training")
  }

  const handleStart = (e: any) => {
    startX = e.touches ? e.touches[0].clientX : e.clientX
  }

  const handleEnd = (e: any) => {
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const diff = startX - endX

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

      setXp(xpVal)
      setWeakCount(incorrect.length)

      const completed: string[] = []

      for (const program of programs) {
        const progress = await getProgramProgress(program.id)
        if (progress.completed) {
          completed.push(program.id)
        }
      }

      setCompletedPrograms(completed)
    }

    loadAllProgress()
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

        return {
          label: seg.label,
          segment: seg.segment,
          state,
        }
      })

      setNodes(mapped)
      setLoading(false)
    }

    loadProgram()
  }, [selectedProgram])

  useEffect(() => {
    const idx = nodes.findIndex(n => n.state === "active")
    if (idx >= 0) setActiveIndex(idx)
    else setActiveIndex(0)
  }, [nodes])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Loading...
      </div>
    )
  }

  const activeNode = nodes.find(n => n.state === "active")
  const completedCount = nodes.filter(n => n.state === "complete").length
  const totalCount = nodes.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)
  const program = getProgramById(selectedProgram)
  const renderSections = (
    <div className="mt-8">
      <h3 className="text-sm text-slate-400 mb-3">Sections</h3>

      {bibleSections.map((section) => {
        const isOpen = openSections[section.name]

        return (
          <div key={section.name} className="mb-4">

            {/* SECTION HEADER */}
            <div
              onClick={() =>
                setOpenSections(prev => ({
                  ...prev,
                  [section.name]: !prev[section.name],
                }))
              }
              className="flex justify-between items-center cursor-pointer text-xs text-slate-400 uppercase tracking-wide mb-2 hover:text-white"
            >
              <span>{section.name}</span>
              <span>{isOpen ? "−" : "+"}</span>
            </div>

            {/* BOOKS */}
            {isOpen && section.books.map((book) => {

              const program = programs.find(p =>
                p.title.replace(" Program","") === book
              )

              return (
                <div
                  key={book}
                  onClick={() => {
                    setSelectedProgram(program?.id || book)
                  }}
                  className={`
                    px-3 py-2 rounded-lg mb-1 text-sm transition-all
                    ${selectedProgram === (program?.id || book) ? "bg-blue-600 text-white" : "text-slate-300"}
                    hover:bg-slate-800
                  `}
                >
                  {book}
                  {book !== "Genesis" && " 🔒"}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex relative">

      {/* LEFT NAV */}
      <aside className="hidden lg:flex w-72 flex-col p-6 border-r border-white/10">

        <h2 className="text-xl font-bold mb-6">Bible Athlete</h2>

        <NavItem label="Journey" active />
        <NavItem label="Training" />
        <NavItem label="Review" />
        <NavItem label="Programs" />
        <NavItem label="Dashboard" />

        {/* BOOK SELECTOR */}
        {renderSections}
      </aside>

      {/* MAIN */}
      <div className="flex-1 px-4 md:px-8 py-6">
        <div className="flex justify-center mb-8">
          <div className="text-center max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold">
              {getProgramById(selectedProgram)?.title?.replace(" Program","") || selectedProgram}
            </h1>

            <p className="text-slate-300 mt-1">
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
              <span className="text-slate-300">
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
              className="
                w-full
                bg-purple-600 hover:bg-purple-500
                text-white
                py-3
                rounded-xl
                font-semibold
                text-sm
                transition-all duration-150
                hover:scale-[1.02]
                shadow-md hover:shadow-lg
                active:scale-95
                active:brightness-90
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              ⚡ Train Weak Areas
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

          {/* PATH */}
          <div className="flex-1 relative">
            <div className="hidden md:flex justify-between mb-4">
              <button
                onClick={() => activeIndex > 0 && setActiveIndex(activeIndex - 1)}
                className="bg-slate-800 px-4 py-2 rounded-lg text-white"
              >
                ←
              </button>

              <button
                onClick={() =>
                  activeIndex < nodes.length - 1 && setActiveIndex(activeIndex + 1)
                }
                className="bg-slate-800 px-4 py-2 rounded-lg text-white"
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
                        <div className="absolute inset-0 z-0 rounded-2xl bg-yellow-400/30 blur-xl animate-pulse-glow" />
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
                          transition-all duration-200
                          active:scale-95
                          hover:scale-[1.03]
                          ${isActive
                            ? "border-yellow-400 shadow-[0_0_40px_rgba(255,200,0,0.9)]"
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
                    ${i === activeIndex ? "bg-yellow-400 scale-125" : "bg-slate-600"}
                  `}
                />
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:w-80 w-full bg-[#121A2B] rounded-2xl p-6 shadow-xl h-fit space-y-6">

            <h2 className="text-xl font-bold mb-4">Your Progress</h2>

            <div className="space-y-2">
              <div className="text-sm text-slate-300 mb-1">
                {completedCount} / {totalCount} complete
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {!program && (
              <div className="mt-4 text-sm text-yellow-400">
                🔒 Complete previous book to unlock this one
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm text-slate-300">XP</div>
              <div className="text-lg font-bold">{xp}</div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-2">
              <div className="text-sm text-slate-300">Weak Areas</div>
              <div className="text-lg font-semibold">
                {weakCount > 0 ? `${weakCount} to review` : "None"}
              </div>
            </div>

            {weakCount > 0 && (
              <button
                onClick={handleTrainWeak}
                className="
                  w-full
                  bg-purple-600 hover:bg-purple-500
                  text-white
                  py-3
                  rounded-xl
                  font-semibold
                  transition-all duration-150
                  hover:scale-[1.02]
                  shadow-md hover:shadow-lg
                  active:scale-95
                  active:brightness-90
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  mt-2
                "
              >
                Train Weak Areas →
              </button>
            )}

            <div className="h-px bg-white/5" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  🔥 Streak
                </span>

                <span className="text-orange-400 font-semibold">
                  {streak} days
                </span>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-2">
              <div className="text-sm text-slate-300 mb-1">
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

              <div className="text-xs text-slate-400 mt-1">
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-lg transition-all duration-150 hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>

          </div>
        </div>
      </div>

    </div>
  )
}
