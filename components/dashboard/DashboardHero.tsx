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
    <section className="ba-hero-card ba-soft-aura rounded-[2.4rem]">
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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,9,16,0.94)_0%,rgba(6,10,18,0.86)_28%,rgba(8,11,18,0.56)_48%,rgba(8,11,18,0.18)_72%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,220,138,0.06),rgba(10,12,20,0.05)_34%,rgba(7,10,16,0.42)_100%)]" />

      <div className="relative z-10 flex min-h-[34rem] flex-col justify-between px-5 py-6 sm:px-7 sm:py-8 lg:min-h-[38rem] lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.26em] text-amber-100/84">
            <span className="text-amber-100">{renderNavIcon("brand", "h-3.5 w-3.5")}</span>
            Today&apos;s Mission
          </div>
          <button
            type="button"
            aria-label="Mission details"
            className="ba-glass-panel inline-flex h-10 w-10 items-center justify-center rounded-full text-white/82"
          >
            {renderNavIcon("info", "h-4 w-4")}
          </button>
        </div>

        <div className="max-w-[36rem]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/84">TODAY&apos;S MISSION</p>
          <h2 className="mt-4 text-[2.6rem] font-black leading-[0.92] tracking-[-0.05em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.38)] sm:text-[3.35rem] lg:text-[4rem]">
            {title}
          </h2>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-[2px] w-36 rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.9),rgba(250,204,21,0.14))]" />
            <span className="h-2 w-2 rounded-full bg-amber-200/80 shadow-[0_0_12px_rgba(251,191,36,0.45)]" />
          </div>
          <p className="mt-4 max-w-[32rem] text-base leading-7 text-slate-100/86 lg:text-lg lg:leading-8">
            {subtitle}
          </p>
          <p className="mt-4 text-[1.1rem] text-cyan-200/92">{referenceLine}</p>
        </div>

        <div className="rounded-[1.65rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,18,0.06),rgba(7,11,18,0.14))] p-4 backdrop-blur-[5px] sm:p-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/10 text-amber-50">
                {renderNavIcon("verse-memory", "h-5 w-5")}
              </span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/62">
                  Focus Passage
                </div>
                <div className="mt-1 text-2xl font-black text-white">{focusPassage}</div>
              </div>
            </div>
            <div className="h-[6px] overflow-hidden rounded-full bg-white/10">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.98),rgba(103,232,249,0.92),rgba(244,114,182,0.84))]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <button
              onClick={onContinue}
              className="ba-gold-cta ba-shimmer motion-safe mx-auto inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#2a1600] shadow-[0_0_34px_rgba(251,191,36,0.28)] sm:max-w-[32rem]"
            >
              {renderNavIcon("brand", "h-4 w-4")}
              Continue Training
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
