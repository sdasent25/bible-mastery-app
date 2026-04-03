'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

import JourneyNode from "@/components/journey/JourneyNode"

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
  const [mastery, setMastery] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchMastery = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data } = await supabase
        .from("user_segment_mastery")
        .select("segment, mastered")

      if (data) {
        const map: Record<string, boolean> = {}
        data.forEach((row) => {
          map[row.segment] = row.mastered
        })
        setMastery(map)
      }
    }

    fetchMastery()
  }, [])

  const computedNodes = nodes.map((node, index) => {
    if (!node.segment) return node

    const isMastered = mastery[node.segment]

    if (isMastered) {
      return { ...node, status: "complete" as const }
    }

    const previousNode = nodes[index - 1]

    if (!previousNode || (previousNode.segment && mastery[previousNode.segment])) {
      return { ...node, status: "available" as const }
    }

    return { ...node, status: "locked" as const }
  })

  const handleNodeClick = (node: JourneyNodeType) => {
    if (node.status === "locked") return

    if (!node.segment) return

    router.push(`/quiz?segment=${node.segment}`)
  }

  return (
    <div className="relative mx-auto w-full max-w-xl px-4 py-8">
      <div className="flex justify-center">
        <div className="relative flex flex-col items-center gap-12">
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-blue-500/50 to-transparent" />
          {computedNodes.map((node, index) => {
            const alignmentClass =
              index % 2 === 0 ? "-translate-x-16" : "translate-x-16"

            return (
              <div key={node.title} className={`relative ${alignmentClass}`}>
                <div
                  onClick={() => handleNodeClick(node)}
                  className="relative cursor-pointer shadow-lg transition-all hover:scale-105"
                >
                  <div className="relative">
                    {node.status === "available" && (
                      <div
                        className="absolute -right-6 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      >
                        🔥
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
