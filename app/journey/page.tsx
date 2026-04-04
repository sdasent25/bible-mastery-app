"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { getProgramById, programs } from "@/lib/programs"
import { getProgramProgress } from "@/lib/programProgress"
import { getXp } from "@/lib/xp"
import { getIncorrectQuestions } from "@/lib/review"

type NodeState = "complete" | "active" | "locked"

export default function JourneyPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState("genesis")

  const [nodes, setNodes] = useState<
    { label: string; segment: string; state: NodeState }[]
  >([])

  const [xp, setXp] = useState(0)
  const [weakCount, setWeakCount] = useState(0)
  const [completedPrograms, setCompletedPrograms] = useState<string[]>([])

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
      if (!program) return

      const progress = await getProgramProgress(selectedProgram)

      const mapped = program.segments.map((seg, index) => {
        let state: NodeState = "locked"

        if (progress.completed) {
          state = "complete"
        } else if (index < progress.currentSegmentIndex) {
          state = "complete"
        } else if (index === progress.currentSegmentIndex) {
          state = "active"
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
        <div className="mt-8">
          <h3 className="text-sm text-slate-400 mb-3">Books</h3>

          {programs.map((program, index) => {
            const isUnlocked =
              index === 0 || completedPrograms.includes(programs[index - 1].id)

            return (
              <div
                key={program.id}
                onClick={() => {
                  if (isUnlocked) setSelectedProgram(program.id)
                }}
                className={`
                  px-3 py-2 rounded-lg mb-1 cursor-pointer text-sm
                  ${selectedProgram === program.id ? "bg-blue-600 text-white" : "text-slate-300"}
                  ${!isUnlocked ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-800"}
                `}
              >
                {program.title}
                {!isUnlocked && " 🔒"}
              </div>
            )
          })}
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 px-4 md:px-8 py-6">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-white text-2xl font-bold"
          >
            ☰
          </button>

          <div className="text-lg font-semibold">Genesis</div>

          <div />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">
            {getProgramById(selectedProgram)?.title}
          </h1>
          <p className="text-slate-300 mt-1">
            Progress through Scripture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

          {/* PATH */}
          <div className="flex-1 flex flex-col items-center relative">

            <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-transparent" />

            <div className="flex flex-col items-center gap-14 py-6">
              {nodes.map((node, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center"
                  style={{
                    transform: `translateX(${Math.sin(index * 0.8) * 60}px)`,
                    marginTop: index % 2 === 0 ? "0px" : "10px"
                  }}
                >

                  {node.state === "active" && (
                    <div className="mb-2 text-yellow-400 font-bold text-sm animate-pulse">
                      START
                    </div>
                  )}

                  <div
                    onClick={() => {
                      if (node.state !== "locked") {
                        router.push(`/quiz?program=${selectedProgram}&segment=${node.segment}`)
                      }
                    }}
                    className={`
                      w-24 h-24 md:w-28 md:h-28 rounded-full
                      flex items-center justify-center
                      border-2 cursor-pointer
                      transition-all duration-200
                      active:scale-95 hover:scale-105
                      ${node.state === "locked" ? "bg-gray-700 border-gray-600 opacity-50" : "bg-[#1E2A44]"}
                      ${node.state === "active" ? "border-yellow-400 shadow-[0_0_25px_rgba(255,200,0,0.7)] animate-pulse" : "border-gray-600"}
                    `}
                  >
                    <Image
                      src="/globe.svg"
                      alt="node"
                      width={40}
                      height={40}
                      className={node.state === "locked" ? "grayscale" : ""}
                    />
                  </div>

                  <div className="mt-2 text-center">
                    <div className="font-semibold text-sm md:text-base">
                      {node.label}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:w-80 w-full bg-[#121A2B] rounded-2xl p-6 shadow-xl h-fit">

            <h2 className="text-xl font-bold mb-4">Your Progress</h2>

            <div className="mb-6">
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

            <div className="mb-6">
              <div className="text-sm text-slate-300">XP</div>
              <div className="text-lg font-bold">{xp}</div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-slate-300">Weak Areas</div>
              <div className="text-lg font-semibold">
                {weakCount > 0 ? `${weakCount} to review` : "None"}
              </div>
            </div>

            <button
              onClick={() => {
                if (activeNode) {
                  router.push(`/quiz?program=${selectedProgram}&segment=${activeNode.segment}`)
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-lg active:scale-95 transition-all"
            >
              Continue →
            </button>

          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#0B1220] z-50
          transform transition-transform duration-300
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:hidden
        `}
      >
        <div className="p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Menu</h2>
            <button onClick={() => setMenuOpen(false)}>✕</button>
          </div>

          <NavItem label="Journey" active />
          <NavItem label="Training" />
          <NavItem label="Review" />
          <NavItem label="Programs" />
          <NavItem label="Dashboard" />

          <div className="mt-6">
            <h3 className="text-sm text-slate-400 mb-2">Books</h3>

            {programs.map((program, index) => {
              const isUnlocked =
                index === 0 || completedPrograms.includes(programs[index - 1].id)

              return (
                <div
                  key={program.id}
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedProgram(program.id)
                      setMenuOpen(false)
                    }
                  }}
                  className={`
                    px-3 py-2 rounded-lg mb-1 text-sm
                    ${selectedProgram === program.id ? "bg-blue-600 text-white" : "text-slate-300"}
                    ${!isUnlocked ? "opacity-40" : "hover:bg-slate-800"}
                  `}
                >
                  {program.title}
                  {!isUnlocked && " 🔒"}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`px-4 py-3 rounded-xl mb-2 font-semibold cursor-pointer ${
        active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
      }`}
    >
      {label}
    </div>
  )
}
