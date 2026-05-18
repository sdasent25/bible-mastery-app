"use client"

import Image from "next/image"

import { renderNavIcon } from "@/lib/navigation"

type DashboardRecommendationCardProps = {
  title: string
  copy: string
  badge?: string
  accent: "training" | "quests" | "memory"
  imageSrc: string
  locked?: boolean
  actionLabel?: string
  onClick: () => void
}

export default function DashboardRecommendationCard({
  title,
  copy,
  badge,
  accent,
  imageSrc,
  locked = false,
  actionLabel = "Open",
  onClick,
}: DashboardRecommendationCardProps) {
  const badgeClass =
    accent === "training"
      ? "border-cyan-300/18 bg-cyan-300/10 text-cyan-100"
      : accent === "quests"
        ? "border-amber-300/20 bg-amber-300/12 text-amber-100"
        : "border-fuchsia-300/18 bg-fuchsia-300/10 text-fuchsia-100"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`ba-recommendation-card ba-recommendation-card--${accent} group text-left ${locked ? "is-locked" : ""}`}
    >
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          className={`object-cover ${
            accent === "training"
              ? "object-[56%_58%]"
              : accent === "quests"
                ? "object-[58%_50%]"
                : "object-[60%_44%]"
          }`}
          sizes="(max-width: 1024px) 100vw, 520px"
        />
      </div>
      <div className="ba-recommendation-overlay" />
      {locked ? <div className="ba-recommendation-lock" /> : null}

      <div className="relative z-10 flex min-h-[7.85rem] flex-col justify-end px-3.25 py-2.5 sm:min-h-[8rem]">
        {locked ? (
          <div className="mb-auto flex justify-end">
            <span className="ba-text-section-label rounded-full border border-amber-200/18 bg-[#130d09]/76 px-2.25 py-0.9 text-[0.48rem] text-amber-100">
              Locked
            </span>
          </div>
        ) : null}
        <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_2.55rem] md:items-end">
          <div className="min-w-0">
            <h3 className="ba-font-display text-[1.14rem] font-bold tracking-[-0.03em] text-[#f7eee3]">
              {title}
            </h3>
            <p className="ba-font-ui mt-0.75 max-w-none text-[0.64rem] leading-[1.38] text-[#efe4d5]/82 md:max-w-[12rem]">
              {copy}
            </p>
            {badge ? (
              <div className={`ba-text-section-label mt-2 inline-flex max-w-full rounded-full border px-2.2 py-0.8 text-[0.45rem] ${badgeClass}`}>
                {badge}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-start md:justify-end">
            <span className="ba-recommendation-arrow" aria-label={actionLabel}>
              {renderNavIcon("chevron-right", "h-3.5 w-3.5")}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
