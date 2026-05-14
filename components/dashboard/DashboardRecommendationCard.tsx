"use client"

import Image from "next/image"

import { renderNavIcon, type NavIconKey } from "@/lib/navigation"

type DashboardRecommendationCardProps = {
  title: string
  eyebrow: string
  copyPrimary: string
  copySecondary: string
  badge: string
  accent: "training" | "memory"
  imageSrc: string
  icon: NavIconKey
  onClick: () => void
}

const accentStyles = {
  training:
    "bg-[linear-gradient(135deg,rgba(10,18,30,0.96),rgba(6,12,20,0.98))] before:bg-[linear-gradient(90deg,rgba(103,232,249,0.94),rgba(250,204,21,0.92))]",
  memory:
    "bg-[linear-gradient(135deg,rgba(24,18,16,0.96),rgba(12,12,18,0.98))] before:bg-[linear-gradient(90deg,rgba(251,191,36,0.92),rgba(244,114,182,0.88),rgba(34,211,238,0.84))]",
} as const

export default function DashboardRecommendationCard({
  title,
  eyebrow,
  copyPrimary,
  copySecondary,
  badge,
  accent,
  imageSrc,
  icon,
  onClick,
}: DashboardRecommendationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`ba-recommendation-card group relative overflow-hidden rounded-[1.95rem] text-left transition duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${accentStyles[accent]}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 before:absolute before:inset-0 before:content-['']" />
      <div className="grid gap-0 lg:grid-cols-[250px_minmax(0,1fr)_72px]">
        <div className="relative min-h-[230px] overflow-hidden lg:min-h-full">
          <Image src={imageSrc} alt="" fill className="object-cover object-center opacity-92" sizes="(max-width: 1024px) 100vw, 250px" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(7,10,16,0.34))]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/12 bg-white/[0.08] text-white shadow-[0_0_18px_rgba(255,255,255,0.04)]">
              {renderNavIcon(icon, "h-5 w-5")}
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/84">
              {badge}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/52">{eyebrow}</div>
            <h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.03em] text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{copyPrimary}</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">{copySecondary}</p>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 pb-5 lg:px-0 lg:pb-0">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white transition group-hover:border-amber-200/24 group-hover:text-amber-50">
            {renderNavIcon("chevron-right", "h-5 w-5")}
          </span>
        </div>
      </div>
    </button>
  )
}
