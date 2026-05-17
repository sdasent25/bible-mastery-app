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
      className={`ba-recommendation-card ba-recommendation-card--${accent} group text-left`}
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

      <div className="relative z-10 flex min-h-[9.1rem] flex-col justify-end px-3.5 py-3 sm:min-h-[8.65rem]">
        <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_2.4rem] md:items-end">
          <div className="min-w-0">
            <h3 className="ba-font-display text-[1.02rem] font-bold tracking-[-0.03em] text-[#f7eee3]">
              {title}
            </h3>
            <p className="ba-font-ui mt-1 max-w-none text-[0.66rem] leading-[1.48] text-[#e7dccd]/74 md:max-w-[12.5rem]">
              {copy}
            </p>
            <div className={`ba-text-section-label mt-2 inline-flex rounded-full border px-2.25 py-0.9 text-[0.45rem] ${badgeClass}`}>
              {badge}
            </div>
          </div>

          <div className="flex items-center justify-start md:justify-end">
            <span className="ba-recommendation-arrow">
              {renderNavIcon("chevron-right", "h-3.5 w-3.5")}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
