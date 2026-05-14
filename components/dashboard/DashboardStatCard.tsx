"use client"

import { renderNavIcon } from "@/lib/navigation"

type DashboardStatCardProps = {
  title: string
  value: string
  supporting: string
  accent: "cyan" | "amber" | "violet" | "sapphire"
  icon?: never
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
  accent,
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
          className={`relative flex h-[8.75rem] w-[8.75rem] items-center justify-center rounded-full ${tone.aura}`}
          style={{ background: ringStyle }}
        >
          <div className="absolute inset-[11px] rounded-full bg-[radial-gradient(circle_at_top,rgba(12,19,31,0.96),rgba(7,10,16,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
          <div className="relative z-10">{renderCenterArt(accent)}</div>
        </div>
      </div>

      <div className="relative z-10 mt-4 text-[2rem] font-semibold leading-none tracking-[-0.045em] text-white">
        {value}
      </div>
      <div className="relative z-10 mt-2 text-[0.95rem] leading-6 text-white/70">{supporting}</div>
    </article>
  )
}

function renderCenterArt(accent: DashboardStatCardProps["accent"]) {
  if (accent === "cyan") {
    return (
      <svg viewBox="0 0 80 80" className="h-16 w-16 text-amber-300" aria-hidden="true">
        <path d="M28 54c6-9 8-17 8-28 0-1 1-2 2-2h4c1 0 2 1 2 2 0 11 2 19 8 28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M25 52c4-3 7-8 8-14M55 52c-4-3-7-8-8-14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 56c2 3 4 4 6 4s4-1 6-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  if (accent === "amber") {
    return (
      <svg viewBox="0 0 80 80" className="h-16 w-16 text-amber-300" aria-hidden="true">
        <path d="M40 16c7 11 16 16 16 29 0 10-7 17-16 17s-16-7-16-17c0-13 9-18 16-29Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
        <path d="M40 28c4 7 8 10 8 18 0 5-3 9-8 9s-8-4-8-9c0-8 4-11 8-18Z" fill="currentColor" />
      </svg>
    )
  }

  if (accent === "violet") {
    return (
      <svg viewBox="0 0 88 88" className="h-[4.25rem] w-[4.25rem]" aria-hidden="true">
        <defs>
          <linearGradient id="crestMetal" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#f6c7ef" />
            <stop offset="45%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#f3c768" />
          </linearGradient>
        </defs>
        <path d="M44 11 24 18v18c0 16 8 29 20 35 12-6 20-19 20-35V18Z" fill="#201627" stroke="url(#crestMetal)" strokeWidth="3" />
        <path d="M44 24v25M35 34h18" stroke="url(#crestMetal)" strokeWidth="4" strokeLinecap="round" />
        <path d="M23 57c-7-4-12-11-14-19M65 57c7-4 12-11 14-19" stroke="url(#crestMetal)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 88 88" className="h-[4.15rem] w-[4.15rem]" aria-hidden="true">
      <defs>
        <linearGradient id="gemTone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b7ecff" />
          <stop offset="45%" stopColor="#4cc9ff" />
          <stop offset="100%" stopColor="#2f63ff" />
        </linearGradient>
      </defs>
      <path d="m44 12 22 12v24L44 76 22 48V24Z" fill="url(#gemTone)" stroke="#d5f3ff" strokeWidth="3" />
      <path d="M44 12v64M22 24h44M22 48h44M31 18l13 30 13-30M31 60l13-12 13 12" stroke="#dff7ff" strokeOpacity="0.72" strokeWidth="2" />
    </svg>
  )
}
