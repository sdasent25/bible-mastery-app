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

  return (
    <article className="ba-stat-card rounded-[1.55rem] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-[0.22em] ${tone.meta}`}>
            {title}
          </div>
          <div className="mt-3 text-[1.85rem] font-black leading-none text-white">{value}</div>
          <div className="mt-2 text-sm text-white/60">{supporting}</div>
        </div>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(255,255,255,0.04)] ${tone.ring}`}>
          {renderNavIcon(icon, "h-5 w-5")}
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: "72%" }} />
      </div>
    </article>
  )
}
