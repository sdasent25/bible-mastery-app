"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"

import { getProgramById } from "@/lib/programs"
import { getProgramProgress } from "@/lib/programProgress"

type NodeState = "complete" | "active" | "locked"

export default function JourneyPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [nodes, setNodes] = useState<
    { label: string; segment: string; state: NodeState }[]
  >([])

  const PROGRAM_ID = "genesis"

  useEffect(() => {
    async function load() {
      const program = getProgramById(PROGRAM_ID)
      if (!program) return

      const progress = await getProgramProgress(PROGRAM_ID)

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

    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        Loading journey...
      </div>
    )
  }

  const activeNode = nodes.find((n) => n.state === "active")

  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-4 md:px-8 py-8">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Genesis</h1>
        <p className="text-gray-400 mt-2">
          The beginning of everything
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* PATH */}
        <div className="flex-1 flex flex-col items-center relative">

          {/* GLOW PATH */}
          <div className="absolute top-0 bottom-0 w-2 bg-gradient-to-b from-yellow-400/40 to-transparent blur-sm" />
          <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-transparent" />

          <div className="flex flex-col items-center gap-16 py-10">
            {nodes.map((node, index) => (
              <Node
                key={index}
                node={node}
                onClick={() => {
                  if (node.state !== "locked") {
                    router.push(
                      `/quiz?program=${PROGRAM_ID}&segment=${node.segment}`
                    )
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:w-80 w-full bg-[#121A2B] rounded-2xl p-6 shadow-xl h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4">Progress</h2>

          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-1">
              Current
            </div>
            <div className="text-lg font-semibold">
              {activeNode?.label || "Complete"}
            </div>
          </div>

          <button
            onClick={() => {
              if (activeNode) {
                router.push(
                  `/quiz?program=${PROGRAM_ID}&segment=${activeNode.segment}`
                )
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-lg transition-all active:scale-95"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

function Node({
  node,
  onClick,
}: {
  node: { label: string; segment: string; state: NodeState }
  onClick: () => void
}) {
  const isActive = node.state === "active"
  const isComplete = node.state === "complete"
  const isLocked = node.state === "locked"

  return (
    <motion.div
      whileTap={{ scale: 0.92 }}
      className="flex flex-col items-center cursor-pointer"
      onClick={onClick}
    >
      {/* NODE */}
      <motion.div
        animate={
          isActive
            ? { scale: [1, 1.08, 1] }
            : { scale: 1 }
        }
        transition={{
          repeat: isActive ? Infinity : 0,
          duration: 1.5,
        }}
        className={`
          w-24 h-24 md:w-28 md:h-28 rounded-full
          flex items-center justify-center
          border-2 transition-all duration-300
          ${
            isLocked
              ? "bg-gray-700 border-gray-600 opacity-50"
              : "bg-gradient-to-br from-[#1E2A44] to-[#0F172A]"
          }
          ${isActive ? "border-yellow-400 shadow-[0_0_25px_rgba(255,200,0,0.6)]" : "border-gray-600"}
        `}
      >
        <Image
          src="/globe.svg"
          alt="node"
          width={40}
          height={40}
          className={`${isLocked ? "grayscale" : ""}`}
        />
      </motion.div>

      {/* LABEL */}
      <div className="mt-3 text-center">
        <div className="font-semibold text-sm md:text-base">
          {node.label}
        </div>

        {isActive && (
          <div className="text-yellow-400 text-xs mt-1">Start</div>
        )}

        {isComplete && (
          <div className="text-green-400 text-xs mt-1">Complete</div>
        )}

        {isLocked && (
          <div className="text-gray-500 text-xs mt-1">Locked</div>
        )}
      </div>

      {/* ACTIVE PULSE */}
      {isActive && (
        <motion.div
          className="absolute w-28 h-28 rounded-full border-2 border-yellow-400"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.div>
  )
}