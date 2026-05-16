"use client"

import Image from "next/image"

import { renderNavIcon } from "@/lib/navigation"

type DashboardStatCardProps = {
  title: string
  value: string
  supporting: string
  caption?: string
  accent: "cyan" | "amber" | "violet" | "sapphire"
  iconSrc: string
}

const accentMap = {
  cyan: {
    label: "text-cyan-200",
    ring: "shadow-[0_0_28px_rgba(34,211,238,0.16)]",
    aura: "from-cyan-400/18 via-transparent to-transparent",
  },
  amber: {
    label: "text-amber-200",
    ring: "shadow-[0_0_28px_rgba(251,191,36,0.16)]",
    aura: "from-amber-400/18 via-transparent to-transparent",
  },
  violet: {
    label: "text-fuchsia-200",
    ring: "shadow-[0_0_28px_rgba(244,114,182,0.14)]",
    aura: "from-fuchsia-400/18 via-transparent to-transparent",
  },
  sapphire: {
    label: "text-sky-200",
    ring: "shadow-[0_0_28px_rgba(96,165,250,0.18)]",
    aura: "from-sky-400/18 via-transparent to-transparent",
  },
} as const

export default function DashboardStatCard({
  title,
  value,
  supporting,
  caption,
  accent,
  iconSrc,
}: DashboardStatCardProps) {
  const tone = accentMap[accent]

  return (
    <article className="ba-stat-card">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone.aura} opacity-90`} />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className={`text-[0.62rem] font-semibold uppercase tracking-[0.22em] ${tone.label}`}>
          {title}
        </div>
        <span className="inline-flex h-5.5 w-5.5 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/46">
          {renderNavIcon("info", "h-3 w-3")}
        </span>
      </div>

      <div className="relative z-10 mt-2.5 flex flex-col items-center text-center">
        <div className={`relative flex h-[3.9rem] w-[3.9rem] shrink-0 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(12,18,30,0.96))] ${tone.ring}`}>
          <Image
            src={iconSrc}
            alt=""
            width={66}
            height={66}
            className="h-[2.85rem] w-[2.85rem] object-contain"
          />
        </div>

        <div className="mt-2 min-w-0">
          <div className={`truncate leading-none text-white ${accent === "sapphire" ? "ba-serif-display text-[1.55rem]" : "text-[1.5rem] font-semibold tracking-[-0.045em]"}`}>
            {value}
          </div>
          <div className="mt-1 text-[0.74rem] leading-4 text-white/78">
            {supporting}
          </div>
        </div>
      </div>

      {caption ? (
        <div className="relative z-10 mt-2 text-center text-[0.56rem] uppercase tracking-[0.16em] text-white/42">
          {caption}
        </div>
      ) : null}
    </article>
  )
}
