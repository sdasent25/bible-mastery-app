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
    label: "text-cyan-100/86",
    aura: "shadow-[0_0_36px_rgba(103,232,249,0.14)]",
    shell: "from-cyan-400/14 via-sky-400/8 to-transparent",
  },
  amber: {
    label: "text-amber-100/86",
    aura: "shadow-[0_0_36px_rgba(250,204,21,0.14)]",
    shell: "from-amber-400/14 via-orange-400/8 to-transparent",
  },
  violet: {
    label: "text-fuchsia-100/86",
    aura: "shadow-[0_0_36px_rgba(244,114,182,0.14)]",
    shell: "from-fuchsia-400/14 via-violet-400/10 to-transparent",
  },
  sapphire: {
    label: "text-sky-100/86",
    aura: "shadow-[0_0_36px_rgba(59,130,246,0.15)]",
    shell: "from-sky-400/14 via-blue-400/8 to-transparent",
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
  const ringStyle = {
    cyan:
      "conic-gradient(from 210deg, rgba(34,211,238,0.08), rgba(103,232,249,0.98) 28%, rgba(59,130,246,0.96) 80%, rgba(34,211,238,0.12) 100%)",
    amber:
      "conic-gradient(from 210deg, rgba(245,158,11,0.08), rgba(250,204,21,0.98) 28%, rgba(251,146,60,0.96) 80%, rgba(245,158,11,0.12) 100%)",
    violet:
      "conic-gradient(from 210deg, rgba(244,114,182,0.08), rgba(244,114,182,0.92) 22%, rgba(196,181,253,0.98) 68%, rgba(250,204,21,0.72) 92%, rgba(244,114,182,0.12) 100%)",
    sapphire:
      "conic-gradient(from 210deg, rgba(59,130,246,0.08), rgba(96,165,250,0.98) 20%, rgba(103,232,249,0.98) 68%, rgba(59,130,246,0.12) 100%)",
  }[accent]

  return (
    <article className="ba-stat-card rounded-[1.55rem] p-4 text-center sm:p-5">
      <div className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br ${tone.shell} opacity-80`} />
      <div className="flex items-start justify-between gap-3 text-left">
        <div className={`text-[11px] font-medium uppercase tracking-[0.18em] ${tone.label}`}>
          {title}
        </div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/58">
          {renderNavIcon("info", "h-3.5 w-3.5")}
        </span>
      </div>

      <div className="relative mt-5 flex justify-center">
        <div
          className={`relative flex h-[7.75rem] w-[7.75rem] items-center justify-center rounded-full ${tone.aura} sm:h-[8.75rem] sm:w-[8.75rem]`}
          style={{ background: ringStyle }}
        >
          <div className="absolute inset-[11px] rounded-full bg-[radial-gradient(circle_at_top,rgba(12,19,31,0.96),rgba(7,10,16,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
          <div className="relative z-10 flex h-16 w-16 items-center justify-center sm:h-[4.4rem] sm:w-[4.4rem]">
            <Image
              src={iconSrc}
              alt=""
              width={88}
              height={88}
              className="h-full w-full object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.16)]"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 text-[1.7rem] font-semibold leading-none tracking-[-0.045em] text-white sm:text-[2rem]">
        {value}
      </div>
      <div className="relative z-10 mt-2 text-[0.92rem] leading-6 text-white/82">{supporting}</div>
      {caption ? (
        <div className="relative z-10 mt-1 text-[0.78rem] leading-5 uppercase tracking-[0.16em] text-white/46">
          {caption}
        </div>
      ) : null}
    </article>
  )
}
