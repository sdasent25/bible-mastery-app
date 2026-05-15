"use client"

import Image from "next/image"

import { renderNavIcon } from "@/lib/navigation"

type DashboardRecommendationCardProps = {
  title: string
  copy: string
  badge: string
  accent: "training" | "memory"
  imageSrc: string
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
  copy,
  badge,
  accent,
  imageSrc,
  onClick,
}: DashboardRecommendationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`ba-recommendation-card group relative overflow-hidden rounded-[1.95rem] text-left transition duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${accentStyles[accent]}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 before:absolute before:inset-0 before:content-['']" />
      <div className="absolute inset-y-0 left-0 w-[42%] sm:w-[40%]">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover object-center opacity-[0.98]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 560px"
        />
      </div>
      <div className="absolute inset-y-0 left-[36%] right-0 bg-[linear-gradient(90deg,rgba(6,10,18,0)_0%,rgba(6,10,18,0.7)_12%,rgba(6,10,18,0.96)_30%,rgba(6,10,18,0.985)_100%)]" />
      <div
        className={`absolute inset-0 ${
          accent === "training"
            ? "bg-[linear-gradient(90deg,rgba(8,11,18,0.02)_0%,rgba(8,11,18,0.12)_18%,rgba(8,11,18,0.4)_45%,rgba(8,11,18,0.86)_100%)]"
            : "bg-[linear-gradient(90deg,rgba(17,11,14,0.02)_0%,rgba(17,11,14,0.12)_18%,rgba(11,11,17,0.42)_45%,rgba(9,10,16,0.9)_100%)]"
        }`}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_28%,rgba(7,10,16,0.24)_100%)]" />

      <div className="relative z-10 flex min-h-[220px] flex-col p-4 pl-[40%] sm:min-h-[236px] sm:p-5 sm:pl-[40%] lg:min-h-[244px] lg:p-6 lg:pl-[41%]">
        <div className="flex items-start justify-between gap-4">
          <div />
          <div
            className={`rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] backdrop-blur-sm sm:px-3 sm:text-[10px] sm:tracking-[0.18em] ${
              accent === "training"
                ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                : "border-fuchsia-300/18 bg-fuchsia-400/8 text-fuchsia-100"
            }`}
          >
            {badge}
          </div>
        </div>

        <div className="mt-6 flex flex-1 items-end">
          <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_72px] lg:items-end">
            <div>
              <h3 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.03em] text-white sm:text-[1.95rem]">{title}</h3>
              <p className="mt-3 max-w-[19rem] text-[0.96rem] leading-6 text-slate-100 sm:text-[1rem] sm:leading-7">{copy}</p>
            </div>

            <div className="flex items-center justify-start lg:justify-center">
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${
                  accent === "training"
                    ? "border-amber-200/28 bg-amber-200/10 text-amber-50 shadow-[0_0_28px_rgba(251,191,36,0.18)]"
                    : "border-fuchsia-200/24 bg-fuchsia-200/10 text-rose-50 shadow-[0_0_28px_rgba(244,114,182,0.16)]"
                } transition group-hover:scale-[1.04]`}
              >
                {renderNavIcon("chevron-right", "h-5 w-5")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
