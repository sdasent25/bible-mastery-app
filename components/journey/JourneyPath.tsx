import JourneyNode from "@/components/journey/JourneyNode"

type JourneyNodeType = {
  title: string
  status: "locked" | "available" | "complete"
  isBoss?: boolean
}

const nodes: JourneyNodeType[] = [
  { title: "Creation", status: "complete" },
  { title: "Adam & Eve", status: "complete" },
  { title: "Cain & Abel", status: "available" },
  { title: "Noah", status: "locked" },
  { title: "Tower of Babel", status: "locked" },
  { title: "Genesis Mastery", status: "locked", isBoss: true }
]

export default function JourneyPath() {
  return (
    <div className="relative mx-auto w-full max-w-xl px-4 py-8">
      <div className="relative flex flex-col space-y-12">
        <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gray-300 dark:bg-gray-600" />
        {nodes.map((node, index) => {
          const alignmentClass =
            index % 2 === 0 ? "items-start pl-6" : "items-end pr-6"
          const flamePositionClass =
            index % 2 === 0 ? "left-[7.5rem] md:left-[6.5rem]" : "right-[7.5rem] md:right-[6.5rem]"

          return (
            <div key={node.title} className={`relative flex w-full ${alignmentClass}`}>
              {node.status === "available" && (
                <div
                  className={`absolute top-5 text-xl ${flamePositionClass}`}
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
          )
        })}
      </div>
    </div>
  )
}
