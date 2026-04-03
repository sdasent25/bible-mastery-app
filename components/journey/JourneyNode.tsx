type JourneyNodeProps = {
  title: string
  status: "locked" | "available" | "complete"
  isBoss?: boolean
}

const labelStyles = {
  locked: "text-slate-500 dark:text-slate-400",
  available: "text-slate-700 dark:text-slate-200",
  complete: "text-slate-700 dark:text-slate-200"
} as const

function StatusIcon({ status }: Pick<JourneyNodeProps, "status">) {
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
    ? "w-20 h-20 text-base md:w-24 md:h-24"
    : "w-16 h-16"

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className={[
          "relative rounded-full flex items-center justify-center text-white font-bold transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-blue-300 dark:focus:ring-offset-slate-950",
          sizeClass,
          status === "complete"
            ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg hover:scale-105 active:scale-95"
            : "",
          status === "available"
            ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-[0_8px_0_rgba(30,64,175,0.8)] ring-4 ring-blue-400/40 animate-pulse hover:scale-105 active:scale-95"
            : "",
          status === "locked"
            ? "bg-slate-700 shadow-inner opacity-60 cursor-not-allowed"
            : "cursor-pointer"
        ].join(" ")}
        aria-label={`${title} ${status}`}
      >
        <div className="absolute inset-1 rounded-full bg-white/10 blur-sm" />
        {status === "complete" && (
          <div className="absolute top-1 right-1 text-xs">✓</div>
        )}
        <span className="relative z-10">
          <StatusIcon status={status} />
        </span>
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
