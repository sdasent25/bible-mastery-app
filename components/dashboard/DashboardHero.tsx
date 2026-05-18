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
          className="object-cover object-[62%_48%]"
          sizes="(max-width: 1024px) 100vw, 760px"
        />
      </div>
      <div className="ba-hero-overlay" />
      <div className="ba-hero-vignette" />

      <div className="relative z-10 flex h-full min-h-[22.5rem] flex-col px-4 py-4 sm:min-h-[18rem] sm:px-5 lg:min-h-[18.2rem] lg:px-5 lg:py-4">
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

        <div className="mt-3.5 max-w-[17rem] sm:mt-4 sm:max-w-[22rem] lg:mt-4 lg:max-w-[22.5rem]">
          <h2 className="ba-text-title text-[1.86rem] text-[#fff5e7] sm:text-[2.45rem] lg:text-[3rem]">
            {title}
          </h2>
          <p className="ba-text-body mt-2 whitespace-pre-line text-[0.9rem] leading-[1.38] text-[#eadfce] sm:mt-2.5 sm:max-w-[17rem] sm:text-[0.94rem] lg:max-w-[17.8rem] lg:text-[0.96rem]">
            {subtitle}
          </p>
          <p className="ba-font-ui mt-2.5 text-[0.82rem] font-semibold tracking-[0.01em] text-cyan-200 sm:mt-3 sm:text-[0.9rem]">
            {referenceLine}
          </p>
        </div>

        <div className="mt-auto rounded-[1.1rem] border border-amber-200/14 bg-[linear-gradient(180deg,rgba(5,8,14,0.88),rgba(5,8,13,0.76))] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-[12px] sm:px-3.5 sm:py-2.5">
          <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)_18rem] lg:items-center lg:gap-3.5">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/10 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.12)]">
                {renderNavIcon("verse-memory", "h-4 w-4")}
              </span>
              <div className="min-w-0">
                <div className="ba-text-section-label text-[0.56rem] text-amber-100/62">
                  Focus Passage
                </div>
                <div className="ba-font-ui truncate text-[0.92rem] font-semibold text-[#f8f2e8] lg:text-[0.98rem]">
                  {focusPassage}
                </div>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="ba-text-section-label mb-1 flex items-center justify-between text-[0.48rem] text-white/48">
                  <span>Mission Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="ba-progress-track h-1.5">
                  <div
                    className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(243,194,82,0.98),rgba(103,232,249,0.78),rgba(244,114,182,0.65))]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="ba-text-section-label mt-1.25 text-[0.48rem] text-white/44">
                  Genesis campaign progression
                </div>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="ba-hero-cta ba-premium-cta dashboard-hero-cta group w-full max-w-none lg:min-h-[4rem]"
            >
              <span className="ba-hero-cta-medallion">
                {renderNavIcon("brand", "h-[1rem] w-[1rem]")}
              </span>
              <span className="ba-hero-cta-label">Continue Training</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
