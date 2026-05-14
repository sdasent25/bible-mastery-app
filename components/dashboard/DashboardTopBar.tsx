"use client"

import { renderNavIcon } from "@/lib/navigation"

type DashboardTopBarProps = {
  athleteLevel: number
  xpToNextLevel: number
  levelProgress: number
  onUpgrade: () => void
  onSettings: () => void
}

export default function DashboardTopBar({
  athleteLevel,
  xpToNextLevel,
  levelProgress,
  onUpgrade,
  onSettings,
}: DashboardTopBarProps) {
  return (
    <section className="ba-dashboard-topbar ba-card-aura rounded-[2rem] px-4 py-4 sm:px-5 lg:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="ba-icon-badge ba-gold-edge flex h-14 w-14 items-center justify-center rounded-[1.2rem] text-amber-50 sm:h-16 sm:w-16 sm:rounded-[1.35rem]">
            {renderNavIcon("brand", "h-6 w-6 sm:h-7 sm:w-7")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold tracking-[0.1em] text-amber-50 sm:text-[1.55rem] lg:text-[1.85rem]">
              BIBLE ATHLETE
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/46 sm:text-[11px]">
              Sacred Athletic Dashboard
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onUpgrade}
              className="ba-topbar-icon h-11 w-11 text-amber-50 sm:h-12 sm:w-12"
              aria-label="Open upgrade options"
            >
              {renderNavIcon("crown", "h-4.5 w-4.5")}
            </button>
            <button
              type="button"
              onClick={onSettings}
              className="ba-topbar-icon h-11 w-11 text-white/84 sm:h-12 sm:w-12"
              aria-label="Open profile settings"
            >
              {renderNavIcon("profile", "h-4.5 w-4.5")}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border border-amber-300/22 bg-[linear-gradient(180deg,rgba(35,26,14,0.98),rgba(14,11,11,0.98))] text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/8 text-xl font-black sm:text-[1.4rem]">
              {athleteLevel}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2">
              <div>
                <p className="text-[0.92rem] font-medium text-white/88">Athlete Level</p>
                <p className="mt-1 text-[1.2rem] font-semibold tracking-[-0.03em] text-white sm:text-[1.4rem] lg:text-[1.65rem]">
                  {xpToNextLevel.toLocaleString()} XP to next level
                </p>
              </div>
            </div>
            <div className="ba-progress-track mt-3 h-2.5">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(241,185,63,1),rgba(250,214,117,0.98),rgba(147,229,255,0.4))]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-white/44">
              <span>Progression Track</span>
              <span>{Math.round(levelProgress)}% charged</span>
            </div>
          </div>

          <button
            type="button"
            className="ba-topbar-icon hidden text-cyan-100 xl:inline-flex"
            aria-label="Open notifications"
          >
            {renderNavIcon("bell", "h-5 w-5")}
          </button>
        </div>
      </div>
    </section>
  )
}
