type JourneyNodeProps = {
  title: string
  status: "locked" | "available" | "complete"
  isBoss?: boolean
}

const statusStyles = {
  locked:
    "bg-slate-300 text-slate-600 shadow-slate-300/40 dark:bg-slate-800 dark:text-slate-400 dark:shadow-black/30 opacity-70",
  available:
    "bg-blue-500 text-white shadow-blue-500/30 dark:bg-blue-400 dark:text-slate-950 dark:shadow-blue-900/30",
  complete:
    "bg-emerald-500 text-white shadow-emerald-500/30 dark:bg-emerald-400 dark:text-slate-950 dark:shadow-emerald-900/30"
} as const

const labelStyles = {
  locked: "text-slate-500 dark:text-slate-400",
  available: "text-slate-700 dark:text-slate-200",
  complete: "text-slate-700 dark:text-slate-200"
} as const

function StatusIcon({ status }: Pick<JourneyNodeProps, "status">) {
  if (status === "complete") {
    return <span aria-hidden="true" className="text-lg font-bold">✓</span>
  }

  if (status === "locked") {
    return <span aria-hidden="true" className="text-lg">🔒</span>
  }

  return <span aria-hidden="true" className="text-lg">•</span>
}

export default function JourneyNode({
  title,
  status,
  isBoss = false
}: JourneyNodeProps) {
  const sizeClass = isBoss
    ? "h-24 w-24 text-base md:h-20 md:w-20"
    : "h-20 w-20 text-sm md:h-16 md:w-16"
  const availableStateClass =
    status === "available"
      ? "ring-4 ring-blue-400/50 animate-pulse"
      : ""

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className={[
          "flex items-center justify-center rounded-full border border-white/30 font-semibold",
          "shadow-lg transition duration-200 ease-out hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
          "dark:border-white/10 dark:focus:ring-blue-300 dark:focus:ring-offset-slate-950",
          sizeClass,
          availableStateClass,
          statusStyles[status]
        ].join(" ")}
        aria-label={`${title} ${status}`}
      >
        <StatusIcon status={status} />
      </button>
      <span
        className={[
          "max-w-[7rem] text-center text-sm font-medium",
          labelStyles[status]
        ].join(" ")}
      >
        {title}
      </span>
    </div>
  )
}
