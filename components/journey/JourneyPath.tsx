'use client'

import { useRouter } from "next/navigation"

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

  const handleNodeClick = (node: JourneyNodeType) => {
    if (node.status === "locked") return

    if (!node.segment) return

    router.push(`/quiz?segment=${node.segment}`)
  }

  return (
    <div className="relative mx-auto w-full max-w-xl px-4 py-8">
      <div className="relative flex flex-col space-y-12">
        <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gray-300/40 dark:bg-gray-600/30" />
        {nodes.map((node, index) => {
          const alignmentClass =
            index % 2 === 0 ? "items-start pl-6" : "items-end pr-6"

          return (
            <div key={node.title} className={`relative flex w-full ${alignmentClass}`}>
              <div
                onClick={() => handleNodeClick(node)}
                className="relative cursor-pointer"
              >
                {node.status === "available" && (
                  <div
                    className="absolute right-0 top-0 z-10 translate-x-1/2 -translate-y-1/2 text-2xl"
                    aria-hidden="true"
                  >
                    🔥
                  </div>
                )}
                <JourneyNode
                  title={node.title}
                  status={node.status}
                  isBoss={node.isBoss}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
