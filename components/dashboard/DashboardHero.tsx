"use client"

import Image from "next/image"

import { renderNavIcon } from "@/lib/navigation"

type DashboardHeroProps = {
  title: string
  subtitle: string
  referenceLine: string
  focusPassage: string
  continueHref: string
  onContinue: () => void
  onOpenTraining: () => void
  nextTitle: string
  nextLabel: string
  progressPercent: number
  missionArt?: string
}

export default function DashboardHero({
  title,
  subtitle,
  referenceLine,
  focusPassage,
  onContinue,
  onOpenTraining,
  nextTitle,
  nextLabel,
  progressPercent,
  missionArt,
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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,17,0.82),rgba(8,10,17,0.46)_48%,rgba(8,10,17,0.22)_74%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,215,118,0.02),rgba(8,10,17,0.14)_38%,rgba(8,10,17,0.72))]" />

      {missionArt ? (
        <div className="absolute right-6 top-6 hidden h-32 w-32 overflow-hidden rounded-[1.8rem] border border-white/14 bg-black/25 shadow-[0_18px_42px_rgba(0,0,0,0.3)] lg:block">
          <Image src={missionArt} alt="" fill className="object-cover object-center opacity-78" sizes="128px" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(7,10,16,0.48))]" />
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-[34rem] flex-col justify-between px-5 py-6 sm:px-7 sm:py-8 lg:min-h-[38rem] lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.26em] text-amber-100/84">
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/74">{referenceLine}</p>
          <h2 className="mt-4 text-[2.6rem] font-black leading-[0.92] tracking-[-0.05em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.38)] sm:text-[3.35rem] lg:text-[4rem]">
            {title}
          </h2>
          <p className="mt-4 max-w-[32rem] text-base leading-7 text-slate-100/86 lg:text-lg lg:leading-8">
            {subtitle}
          </p>
        </div>

        <div className="rounded-[1.85rem] border border-white/10 bg-black/28 p-4 backdrop-blur-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
            <div>
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
              <div className="mt-5 h-[7px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.98),rgba(103,232,249,0.92),rgba(244,114,182,0.84))]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={onContinue}
                  className="ba-gold-cta ba-shimmer ba-float-cta motion-safe inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#2a1600] sm:w-auto sm:min-w-[18rem]"
                >
                  {renderNavIcon("upgrade", "h-4 w-4")}
                  Continue Training
                </button>
                <button
                  onClick={onOpenTraining}
                  className="ba-glass-panel inline-flex w-full items-center justify-center rounded-full px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/[0.08] sm:w-auto"
                >
                  Open Training Arena
                </button>
              </div>
            </div>

            <div className="ba-glass-panel rounded-[1.45rem] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/68">
                Next Step
              </div>
              <div className="mt-2 text-xl font-black text-white">{nextTitle}</div>
              <div className="mt-2 text-sm text-slate-300">{nextLabel}</div>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-amber-100">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/16 bg-amber-200/10 text-amber-50">
                  {renderNavIcon("chevron-right", "h-4 w-4")}
                </span>
                Stay in rhythm
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
