'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

import { getProgramById } from "@/lib/programs"

import JourneyNode from "@/components/journey/JourneyNode"
import Flame from "@/components/Flame"

type JourneyNodeType = {
  title: string
  status: "locked" | "available" | "complete"
  segment?: string
  isBoss?: boolean
}

const nodes: JourneyNodeType[] = [
  { title: "Creation", status: "complete", segment: "genesis_1_3" },
  { title: "Adam & Eve", status: "complete", segment: "genesis_1_3" },
  { title: "Cain & Abel", status: "available", segment: "genesis_4_6" },
  { title: "Noah", status: "locked", segment: "genesis_7_9" },
  { title: "Tower of Babel", status: "locked", segment: "genesis_10_11" },
  { title: "Genesis Mastery", status: "locked", isBoss: true }
]

export default function JourneyPath() {
  const router = useRouter()
  const [completedSegments, setCompletedSegments] = useState<Record<string, boolean>>({})
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null)
  const [programComplete, setProgramComplete] = useState(false)

  useEffect(() => {
    const fetchProgress = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const program = getProgramById("genesis")
      const { data } = await supabase
        .from("user_program_progress")
        .select("current_segment_index, completed")
        .eq("user_id", user.id)
        .eq("program_id", "genesis")
        .maybeSingle()

      const totalSegments = program?.segments.length ?? 0
      const completedCount = data?.completed
        ? totalSegments
        : Math.min(data?.current_segment_index ?? 0, totalSegments)

      const map: Record<string, boolean> = {}
      for (const segment of program?.segments.slice(0, completedCount) || []) {
        map[segment.segment.replaceAll("-", "_")] = true
      }

      setCompletedSegments(map)
      const nextSegment = data?.completed
        ? null
        : program?.segments[Math.max(data?.current_segment_index ?? 0, 0)]?.segment ?? null
      setCurrentSegmentId(nextSegment ? nextSegment.replaceAll("-", "_") : null)
      setProgramComplete(data?.completed === true)
    }

    void fetchProgress()
  }, [])

  const computedNodes = nodes.map((node, index) => {
    if (!node.segment) return node

    const isCompleted = completedSegments[node.segment]
    const isCurrent = !programComplete && node.segment === currentSegmentId

    if (isCompleted) {
      return { ...node, status: "complete" as const }
    }

    if (index === 0 || isCurrent) {
      return { ...node, status: "available" as const }
    }

    return { ...node, status: "locked" as const }
  })

  const handleNodeClick = (node: JourneyNodeType) => {
    if (node.status === "locked") return

    if (!node.segment) return

    router.push(`/quiz?program=genesis&segment=${node.segment.replaceAll("_", "-")}`)
  }

  return (
    <div className="relative mx-auto w-full max-w-xl px-4 py-8">
      <div className="flex justify-center">
        <div className="relative flex flex-col items-center gap-20">
          <div className="absolute top-0 bottom-0 left-1/2 w-[3px] -translate-x-1/2 bg-gradient-to-b from-blue-500/60 to-transparent" />
          {computedNodes.map((node, index) => {
            const alignmentClass =
              index % 2 === 0 ? "-translate-x-20" : "translate-x-20"
            const pathAccentClass =
              node.status === "complete"
                ? "before:absolute before:left-1/2 before:top-1/2 before:h-24 before:w-[3px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-blue-300/50"
                : node.status === "locked"
                  ? ""
                  : ""

            return (
              <div key={node.title} className={`relative transition-all duration-200 ${alignmentClass} ${pathAccentClass}`}>
                <div
                  onClick={() => handleNodeClick(node)}
                  className="relative cursor-pointer shadow-lg transition-all hover:scale-105"
                >
                  <div className="relative">
                    {node.status === "available" && (
                      <div
                        className="absolute -right-10 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      >
                        <Flame state="super" size={72} />
                      </div>
                    )}
                    <div
                      className={
                        node.status === "available"
                          ? "rounded-full ring-4 ring-blue-400/50 animate-pulse"
                          : ""
                      }
                    >
                      <JourneyNode
                        title={node.title}
                        status={node.status}
                        isBoss={node.isBoss}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
