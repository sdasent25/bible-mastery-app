"use client"

import { renderNavIcon } from "@/lib/navigation"

type DashboardTopBarProps = {
  athleteLevel: number
  xpToNextLevel: number
  levelProgress: number
  playerName: string
  onUpgrade: () => void
  onSettings: () => void
}

export default function DashboardTopBar({
  athleteLevel,
  xpToNextLevel,
  levelProgress,
  playerName,
  onUpgrade,
  onSettings,
}: DashboardTopBarProps) {
  return (
    <section className="ba-dashboard-topbar hidden lg:block">
      <div className="flex items-center gap-5">
        <div className="flex min-w-0 items-center gap-3 pr-2 xl:min-w-[12.5rem]">
          <span className="ba-header-brand-mark">
            {renderNavIcon("brand", "h-[1.15rem] w-[1.15rem]")}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[0.98rem] font-semibold tracking-[0.08em] text-[#f5e7c7]">
              Bible Athlete
            </div>
            <div className="mt-0.5 text-[0.56rem] uppercase tracking-[0.28em] text-white/42">
              Sacred Athletic Dashboard
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.15rem] border border-amber-200/10 bg-white/[0.02] px-3 py-2.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-amber-300/24 bg-[linear-gradient(180deg,rgba(54,38,18,0.98),rgba(18,14,12,0.98))] text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.12)]">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-amber-200/16 bg-amber-200/8 text-[0.95rem] font-black">
              {athleteLevel}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[0.74rem] font-medium text-white/70">Athlete Level</div>
                <div className="text-[0.92rem] font-semibold tracking-[-0.02em] text-white">
                  {xpToNextLevel.toLocaleString()} XP to next level
                </div>
              </div>
            </div>
            <div className="ba-progress-track mt-2.5 h-[4px]">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(245,194,76,0.98),rgba(243,211,104,0.98),rgba(103,232,249,0.34))]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[0.56rem] uppercase tracking-[0.18em] text-white/36">
              <span>Progression Track</span>
              <span>{Math.round(levelProgress)}% charged</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onUpgrade}
            className="ba-header-action text-amber-50"
            aria-label="Open upgrade options"
          >
            {renderNavIcon("crown", "h-[1rem] w-[1rem]")}
          </button>
          <button
            type="button"
            className="ba-header-action text-white/80"
            aria-label="Open notifications"
          >
            <span className="absolute right-[0.38rem] top-[0.34rem] h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]" />
            {renderNavIcon("bell", "h-[1rem] w-[1rem]")}
          </button>
          <button
            type="button"
            onClick={onSettings}
            className="ba-profile-pill"
            aria-label="Open profile settings"
          >
            <span className="ba-profile-avatar">{playerName.charAt(0).toUpperCase()}</span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-[0.82rem] font-semibold text-white">
                {playerName}
              </span>
              <span className="block truncate text-[0.62rem] text-white/52">
                Faithful Athlete
              </span>
            </span>
            {renderNavIcon("chevron-right", "h-[0.85rem] w-[0.85rem] text-amber-200/78")}
          </button>
        </div>
      </div>
    </section>
  )
}
