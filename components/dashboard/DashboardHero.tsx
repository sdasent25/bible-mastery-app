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

      <div className="relative z-10 flex h-full min-h-[20.5rem] flex-col px-5 py-5 sm:px-6 lg:min-h-[19.25rem] lg:px-7 lg:py-6">
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

        <div className="mt-5 max-w-[21rem] lg:mt-5 lg:max-w-[21.5rem]">
          <h2 className="text-[2.1rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#fff6e9] sm:text-[2.45rem] lg:text-[3.1rem]">
            {title}
          </h2>
          <p className="mt-4 whitespace-pre-line text-[0.96rem] leading-7 text-[#ece0cb] lg:text-[1rem]">
            {subtitle}
          </p>
          <p className="mt-4 text-[0.78rem] font-semibold tracking-[0.02em] text-cyan-200">
            {referenceLine}
          </p>
        </div>

        <div className="mt-auto rounded-[1.2rem] border border-amber-200/12 bg-[linear-gradient(180deg,rgba(8,12,18,0.82),rgba(7,10,16,0.72))] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[10px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/10 text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.12)]">
                {renderNavIcon("verse-memory", "h-4.5 w-4.5")}
              </span>
              <div className="min-w-0">
                <div className="text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-amber-100/62">
                  Focus Passage
                </div>
                <div className="truncate text-[0.98rem] font-semibold text-white lg:text-[1.05rem]">
                  {focusPassage}
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-4 lg:max-w-[14rem]">
              <div className="min-w-0 flex-1">
                <div className="ba-progress-track h-[5px]">
                  <div
                    className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(243,194,82,0.98),rgba(103,232,249,0.78),rgba(244,114,182,0.65))]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[0.52rem] uppercase tracking-[0.18em] text-white/44">
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
