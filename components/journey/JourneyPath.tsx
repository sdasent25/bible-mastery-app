import JourneyNode from "@/components/journey/JourneyNode"

const journeyNodes = [
  { title: "Creation", status: "complete" },
  { title: "Adam & Eve", status: "complete" },
  { title: "Cain & Abel", status: "available" },
  { title: "Noah", status: "locked" },
  { title: "Tower of Babel", status: "locked" },
  { title: "Genesis Mastery", status: "locked", isBoss: true }
] as const

export default function JourneyPath() {
  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-col gap-10 px-4 py-8">
      {journeyNodes.map((node, index) => {
        const alignmentClass = index % 2 === 0 ? "justify-start" : "justify-end"

        return (
          <div key={node.title} className={`flex w-full ${alignmentClass}`}>
            <JourneyNode
              title={node.title}
              status={node.status}
              isBoss={node.isBoss}
            />
          </div>
        )
      })}
    </div>
  )
}
