type JourneyNodeProps = {
  title: string
  status: "locked" | "available" | "complete"
  isBoss?: boolean
}

const iconMap = {
  "Creation": "/icons/creation.png",
  "Adam & Eve": "/icons/garden.png",
  "Cain & Abel": "/icons/offering.png",
  "Noah": "/icons/ark.png",
  "Tower of Babel": "/icons/tower.png",
}

const labelStyles = {
  locked: "text-slate-500 dark:text-slate-400",
  available: "text-slate-700 dark:text-slate-200",
  complete: "text-slate-700 dark:text-slate-200"
} as const

export default function JourneyNode({
  title,
  status,
  isBoss = false
}: JourneyNodeProps) {
  const sizeClass = "w-24 h-24"

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={[
          "relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-200",
          sizeClass,
          status === "complete"
            ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-[0_10px_0_rgba(0,0,0,0.35)] hover:scale-110 active:scale-95"
            : "",
          status === "available"
            ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-[0_10px_0_rgba(0,0,0,0.35)] ring-4 ring-blue-400/40 ring-green-400/60 animate-pulse animate-[unlockPop_0.4s_ease] hover:scale-110 active:scale-95"
            : "",
          status === "locked"
            ? "bg-slate-700 shadow-inner shadow-[0_10px_0_rgba(0,0,0,0.35)] opacity-50"
            : ""
        ].join(" ")}
      >
        <div className="absolute inset-2 rounded-full bg-white/10 blur-sm" />
        <img
          src={iconMap[title as keyof typeof iconMap] || "/icons/default.png"}
          alt={title}
          className="relative z-10 w-12 h-12 object-contain"
        />
        {status === "locked" && (
          <div className="absolute inset-0 flex items-center justify-center text-lg">
            🔒
          </div>
        )}
        {status === "complete" && (
          <div className="absolute top-1 right-1 text-xs">✓</div>
        )}
      </div>
      <span
        className={[
          "mt-3 max-w-[8rem] text-center text-xl font-semibold",
          labelStyles[status]
        ].join(" ")}
      >
        {title}
      </span>
    </div>
  )
}
