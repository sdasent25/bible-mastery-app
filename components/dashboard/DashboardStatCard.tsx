"use client"

import { renderNavIcon, type NavIconKey } from "@/lib/navigation"

type DashboardStatCardProps = {
  title: string
  value: string
  supporting: string
  accent: "cyan" | "amber" | "violet" | "sapphire"
  icon: NavIconKey
}

const accentMap = {
  cyan: {
    ring: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    meta: "text-cyan-100/72",
    bar: "bg-[linear-gradient(90deg,rgba(103,232,249,0.95),rgba(59,130,246,0.92))]",
  },
  amber: {
    ring: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    meta: "text-amber-100/72",
    bar: "bg-[linear-gradient(90deg,rgba(250,204,21,0.96),rgba(251,146,60,0.92))]",
  },
  violet: {
    ring: "border-violet-300/20 bg-violet-300/10 text-violet-100",
    meta: "text-violet-100/72",
    bar: "bg-[linear-gradient(90deg,rgba(244,114,182,0.9),rgba(196,181,253,0.95),rgba(250,204,21,0.84))]",
  },
  sapphire: {
    ring: "border-sky-300/20 bg-sky-300/10 text-sky-100",
    meta: "text-sky-100/72",
    bar: "bg-[linear-gradient(90deg,rgba(59,130,246,0.92),rgba(103,232,249,0.95))]",
  },
} as const

export default function DashboardStatCard({
  title,
  value,
  supporting,
  accent,
  icon,
}: DashboardStatCardProps) {
  const tone = accentMap[accent]
  const ringStyle =
    accent === "cyan"
      ? "conic-gradient(from 210deg, rgba(34,211,238,0.1), rgba(103,232,249,0.96) 30%, rgba(56,189,248,0.96) 78%, rgba(34,211,238,0.16) 100%)"
      : accent === "amber"
        ? "conic-gradient(from 210deg, rgba(245,158,11,0.12), rgba(250,204,21,0.98) 30%, rgba(251,146,60,0.96) 80%, rgba(245,158,11,0.12) 100%)"
        : accent === "violet"
          ? "conic-gradient(from 210deg, rgba(244,114,182,0.14), rgba(244,114,182,0.88) 28%, rgba(196,181,253,0.98) 70%, rgba(250,204,21,0.7) 92%, rgba(244,114,182,0.16) 100%)"
          : "conic-gradient(from 210deg, rgba(59,130,246,0.12), rgba(96,165,250,0.96) 26%, rgba(103,232,249,0.98) 72%, rgba(59,130,246,0.14) 100%)"

  return (
    <article className="ba-stat-card rounded-[1.55rem] p-4 text-center sm:p-5">
      <div className="flex items-start justify-between gap-3 text-left">
        <div className={`text-[10px] font-bold uppercase tracking-[0.22em] ${tone.meta}`}>
          {title}
        </div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/58">
          {renderNavIcon("info", "h-3.5 w-3.5")}
        </span>
      </div>

      <div className="mt-4 flex justify-center">
        <div
          className="relative flex h-[8.75rem] w-[8.75rem] items-center justify-center rounded-full"
          style={{ background: ringStyle }}
        >
          <div className="absolute inset-[11px] rounded-full bg-[radial-gradient(circle_at_top,rgba(12,19,31,0.96),rgba(7,10,16,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
          <div className={`relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(255,255,255,0.04)] ${tone.ring}`}>
            {renderNavIcon(icon, "h-6 w-6")}
          </div>
        </div>
      </div>

      <div className="mt-4 text-[2.05rem] font-black leading-none text-white">{value}</div>
      <div className="mt-2 text-sm text-white/68">{supporting}</div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: "72%" }} />
      </div>
    </article>
  )
}
