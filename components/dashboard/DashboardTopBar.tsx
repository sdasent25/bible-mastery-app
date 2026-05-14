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
    <section className="ba-dashboard-topbar hidden rounded-[2rem] px-5 py-4 lg:block">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-amber-200/20 bg-[radial-gradient(circle_at_top,rgba(255,233,174,0.24),rgba(250,204,21,0.12)_48%,rgba(8,12,22,0.5)_100%)] text-amber-50 shadow-[0_0_30px_rgba(251,191,36,0.16)]">
            {renderNavIcon("brand", "h-7 w-7")}
          </div>
          <div className="min-w-0">
            <div className="text-[2rem] font-semibold tracking-[0.08em] text-amber-50">
              BIBLE ATHLETE
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border border-amber-300/22 bg-[linear-gradient(180deg,rgba(35,26,14,0.98),rgba(14,11,11,0.98))] text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/8 text-xl font-black">
              {athleteLevel}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2">
              <div>
                <p className="text-[0.95rem] font-medium text-white/88">Athlete Level</p>
                <p className="mt-1 text-[1.65rem] font-semibold tracking-[-0.03em] text-white">
                  {xpToNextLevel.toLocaleString()} XP to next level
                </p>
              </div>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(241,185,63,1),rgba(250,214,117,0.98),rgba(147,229,255,0.4))]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onUpgrade}
            className="ba-topbar-icon text-amber-50"
            aria-label="Open upgrade options"
          >
            {renderNavIcon("crown", "h-5 w-5")}
          </button>
          <button
            type="button"
            className="ba-topbar-icon hidden text-cyan-100 xl:inline-flex"
            aria-label="Open notifications"
          >
            {renderNavIcon("bell", "h-5 w-5")}
          </button>
          <button
            type="button"
            onClick={onSettings}
            className="ba-topbar-icon hidden text-white/84 xl:inline-flex"
            aria-label="Open profile settings"
          >
            {renderNavIcon("profile", "h-5 w-5")}
          </button>
        </div>
      </div>
    </section>
  )
}
