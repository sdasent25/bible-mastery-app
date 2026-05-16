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

export default function DashboardRecommendationCard({
  title,
  copy,
  badge,
  accent,
  imageSrc,
  onClick,
}: DashboardRecommendationCardProps) {
  const badgeClass =
    accent === "training"
      ? "border-cyan-300/18 bg-cyan-300/10 text-cyan-100"
      : "border-fuchsia-300/18 bg-fuchsia-300/10 text-fuchsia-100"

  return (
    <button
      onClick={onClick}
      className="ba-recommendation-card group text-left"
    >
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          className={`object-cover ${accent === "training" ? "object-[42%_50%]" : "object-[50%_42%]"}`}
          sizes="(max-width: 1024px) 100vw, 520px"
        />
      </div>
      <div className="ba-recommendation-overlay" />

      <div className="relative z-10 flex min-h-[8.65rem] flex-col justify-end px-3.5 py-3">
        <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_2.4rem] md:items-end">
          <div className="min-w-0">
            <h3 className="ba-serif-display text-[0.98rem] text-white">
              {title}
            </h3>
            <p className="mt-1 max-w-[12.5rem] text-[0.68rem] leading-4.5 text-white/74">
              {copy}
            </p>
            <div className={`mt-2 inline-flex rounded-full border px-2.25 py-0.9 text-[0.46rem] font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
              {badge}
            </div>
          </div>

          <div className="flex items-center justify-start md:justify-end">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/20 bg-black/28 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.14)] transition group-hover:scale-[1.05]">
              {renderNavIcon("chevron-right", "h-3.5 w-3.5")}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
