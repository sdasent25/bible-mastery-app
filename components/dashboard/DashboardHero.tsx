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
}

export default function DashboardHero({
  title,
  subtitle,
  referenceLine,
  focusPassage,
  onContinue,
  progressPercent,
}: DashboardHeroProps) {
  return (
    <section className="ba-hero-card ba-soft-aura rounded-[2.35rem]">
      <div className="absolute inset-0">
        <Image
          src="/dashboard/mission-hero.svg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1280px) 100vw, 900px"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,16,0.96)_0%,rgba(4,10,18,0.92)_28%,rgba(8,12,18,0.62)_48%,rgba(8,11,18,0.16)_72%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,220,138,0.05),rgba(10,12,20,0.05)_36%,rgba(7,10,16,0.52)_100%)]" />

      <div className="relative z-10 flex min-h-[34.5rem] flex-col justify-between px-5 py-6 sm:px-7 sm:py-8 lg:min-h-[39rem] lg:px-9">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/24 bg-[linear-gradient(180deg,rgba(65,44,17,0.54),rgba(28,18,10,0.44))] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.28em] text-amber-100/84 shadow-[0_0_24px_rgba(251,191,36,0.08)]">
            <span className="text-amber-100">{renderNavIcon("brand", "h-3.5 w-3.5")}</span>
            TODAY&apos;S MISSION
          </div>
          <button
            type="button"
            aria-label="Mission details"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/18 bg-black/26 text-white/86 shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur-md"
          >
            {renderNavIcon("info", "h-[1.05rem] w-[1.05rem]")}
          </button>
        </div>

        <div className="max-w-[35rem]">
          <h2 className="mt-2 text-[2.75rem] font-semibold leading-[0.94] tracking-[-0.055em] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.48)] sm:text-[3.6rem] lg:text-[4.35rem]">
            {title}
          </h2>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-[2px] w-40 rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(250,204,21,0.18))]" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-200/86 shadow-[0_0_14px_rgba(251,191,36,0.48)]" />
          </div>
          <p className="mt-5 max-w-[28rem] text-[1.02rem] leading-8 text-slate-100/88 lg:text-[1.16rem] lg:leading-9">
            {subtitle}
          </p>
          <p className="mt-4 text-[1.2rem] text-cyan-200/94">{referenceLine}</p>
        </div>

        <div className="rounded-[1.8rem] border border-amber-200/10 bg-[linear-gradient(180deg,rgba(7,11,18,0.08),rgba(7,11,18,0.16))] p-4 backdrop-blur-[6px] sm:p-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/22 bg-amber-200/10 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.12)]">
                {renderNavIcon("verse-memory", "h-5 w-5")}
              </span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/64">
                  Focus Passage
                </div>
                <div className="mt-1 text-[1.75rem] font-semibold tracking-[-0.035em] text-white">
                  {focusPassage}
                </div>
              </div>
            </div>
            <div className="h-[6px] overflow-hidden rounded-full bg-white/10">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.98),rgba(103,232,249,0.82),rgba(244,114,182,0.7))]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <button
              onClick={onContinue}
              className="ba-gold-cta ba-shimmer ba-float-cta motion-safe mx-auto inline-flex w-full items-center justify-center gap-3 rounded-[1.45rem] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#2a1600] shadow-[0_0_40px_rgba(251,191,36,0.34)] sm:max-w-[33rem] sm:text-[0.95rem]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#8a5a05]/18 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
                {renderNavIcon("brand", "h-5 w-5")}
              </span>
              CONTINUE TRAINING
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
