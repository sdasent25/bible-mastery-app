"use client"

import Image from "next/image"

import { renderNavIcon } from "@/lib/navigation"

type DashboardHeroProps = {
  title: string
  subtitle: string
  referenceLine: string
  focusPassage: string
  onContinue: () => void
  progressPercent: number
  imageSrc: string
  missionProgressLabel: string
  dailyMissionComplete: boolean
}

export default function DashboardHero({
  title,
  subtitle,
  referenceLine,
  focusPassage,
  onContinue,
  progressPercent,
  imageSrc,
  missionProgressLabel,
  dailyMissionComplete,
}: DashboardHeroProps) {
  return (
    <section className="ba-hero-card">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          className="object-cover object-[68%_48%]"
          sizes="(max-width: 1024px) 100vw, 700px"
        />
      </div>
      <div className="ba-hero-overlay" />
      <div className="ba-hero-vignette" />

      <div className="relative z-10 flex h-full min-h-[19rem] flex-col px-5 py-4.5 sm:px-6 lg:min-h-[18.2rem] lg:px-6 lg:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="ba-hero-chip ba-hero-chip-gold">
              <span className="text-amber-100">{renderNavIcon("brand", "h-3 w-3")}</span>
              Today&apos;s Mission
            </div>
            <div className="ba-hero-chip ba-hero-chip-dark">{missionProgressLabel}</div>
            {dailyMissionComplete ? (
              <div className="ba-hero-chip ba-hero-chip-success">Completed Today</div>
            ) : null}
          </div>

          <button
            type="button"
            className="ba-hero-info"
            aria-label="Mission info"
          >
            {renderNavIcon("info", "h-4 w-4")}
          </button>
        </div>

        <div className="mt-4 max-w-[18.5rem] lg:mt-4 lg:max-w-[18.75rem]">
          <h2 className="ba-serif-display text-[1.95rem] leading-[0.98] text-[#fff6e9] sm:text-[2.2rem] lg:text-[2.75rem]">
            {title}
          </h2>
          <p className="mt-3 whitespace-pre-line text-[0.88rem] leading-6 text-[#ece0cb] lg:text-[0.9rem]">
            {subtitle}
          </p>
          <p className="mt-3 text-[0.72rem] font-semibold tracking-[0.02em] text-cyan-200">
            {referenceLine}
          </p>
        </div>

        <div className="mt-auto rounded-[1.08rem] border border-amber-200/12 bg-[linear-gradient(180deg,rgba(8,12,18,0.82),rgba(7,10,16,0.72))] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[10px]">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/10 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.12)]">
                {renderNavIcon("verse-memory", "h-4 w-4")}
              </span>
              <div className="min-w-0">
                <div className="text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-amber-100/62">
                  Focus Passage
                </div>
                <div className="truncate text-[0.92rem] font-semibold text-white lg:text-[0.98rem]">
                  {focusPassage}
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-4 lg:max-w-[12rem]">
              <div className="min-w-0 flex-1">
                <div className="ba-progress-track h-[5px]">
                  <div
                    className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(243,194,82,0.98),rgba(103,232,249,0.78),rgba(244,114,182,0.65))]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[0.48rem] uppercase tracking-[0.16em] text-white/44">
                  <span>Genesis Progression</span>
                  <span>{progressPercent}% complete</span>
                </div>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="ba-hero-cta"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#8c6312]/28 bg-[#fff5dc]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                {renderNavIcon("brand", "h-[1rem] w-[1rem]")}
              </span>
              Continue Training
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
