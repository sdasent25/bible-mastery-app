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
    <section className="ba-dashboard-topbar hidden rounded-[1.8rem] p-4 lg:block">
      <div className="flex items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-amber-200/18 bg-amber-200/10 text-amber-50 shadow-[0_0_22px_rgba(251,191,36,0.12)]">
            {renderNavIcon("brand", "h-5 w-5")}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-black tracking-[-0.03em] text-white">Bible Athlete</div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/46">
              Athlete Level
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-4 rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-200/16 bg-cyan-200/10 text-cyan-100">
            {renderNavIcon("upgrade", "h-4 w-4")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white">Athlete Level {athleteLevel}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/76">
                {xpToNextLevel.toLocaleString()} XP to next level
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.98),rgba(103,232,249,0.92),rgba(244,114,182,0.84))]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUpgrade}
            className="ba-glass-panel inline-flex h-11 w-11 items-center justify-center rounded-full text-amber-50 transition hover:text-white"
            aria-label="Open upgrade options"
          >
            {renderNavIcon("upgrade", "h-4.5 w-4.5")}
          </button>
          <button
            type="button"
            className="ba-glass-panel inline-flex h-11 w-11 items-center justify-center rounded-full text-white/78 transition hover:text-white"
            aria-label="Open notifications"
          >
            {renderNavIcon("bell", "h-4.5 w-4.5")}
          </button>
          <button
            type="button"
            onClick={onSettings}
            className="ba-glass-panel inline-flex h-11 w-11 items-center justify-center rounded-full text-white/82 transition hover:text-white"
            aria-label="Open profile settings"
          >
            {renderNavIcon("profile", "h-4.5 w-4.5")}
          </button>
        </div>
      </div>
    </section>
  )
}
