"use client"

import { renderNavIcon } from "@/lib/navigation"

type DashboardTopBarProps = {
  athleteLevel: number
  xpToNextLevel: number
  levelProgress: number
  streak: number
  playerName: string
  onUpgrade: () => void
  onSettings: () => void
}

export default function DashboardTopBar({
  athleteLevel,
  xpToNextLevel,
  levelProgress,
  streak,
  playerName,
  onUpgrade,
  onSettings,
}: DashboardTopBarProps) {
  return (
    <section className="ba-dashboard-topbar hidden lg:block">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 items-center gap-2 pr-0.5 xl:min-w-[11.25rem]">
          <span className="ba-header-brand-mark">
            {renderNavIcon("brand", "h-[1rem] w-[1rem]")}
          </span>
          <div className="min-w-0">
            <div className="ba-serif-brand ba-font-display truncate text-[0.96rem] text-[#f5e7c7]">
              Bible Athlete
            </div>
            <div className="ba-text-section-label ba-text-muted mt-0.5 tracking-[0.22em]">
              Sacred Athletic Dashboard
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[1rem] border border-amber-200/10 bg-white/[0.02] px-2.25 py-1.4">
          <div className="ba-level-shield flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-amber-300/24 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.12)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-200/16 bg-amber-200/8 text-[0.88rem] font-black">
              {athleteLevel}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="ba-font-ui text-[0.58rem] font-medium text-[#d9cdbd]/78">Athlete Level</div>
                <div className="ba-font-ui truncate whitespace-nowrap text-[0.86rem] font-semibold tracking-[0.01em] text-[#f2e8d6]">
                  {xpToNextLevel.toLocaleString()} XP <span className="text-[#d7cab9]/74">to next level</span>
                </div>
              </div>
            </div>
            <div className="ba-progress-track mt-1.5 h-[3px]">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(245,194,76,0.98),rgba(243,211,104,0.98),rgba(103,232,249,0.34))]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="ba-text-section-label mt-1 flex items-center justify-between text-[0.48rem] text-white/36">
              <span>Progression Track</span>
              <span>{Math.round(levelProgress)}% charged</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-[1rem] border border-amber-200/10 bg-[linear-gradient(180deg,rgba(14,19,30,0.94),rgba(7,10,17,0.96))] px-2.5 py-1.7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_22px_rgba(251,146,60,0.08)]">
          <span className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-amber-300/18 bg-[radial-gradient(circle_at_top,rgba(255,198,92,0.22),rgba(42,20,7,0.98))] text-amber-100 shadow-[0_0_18px_rgba(251,146,60,0.14)]">
            {renderNavIcon("sun", "h-[1rem] w-[1rem]")}
          </span>
          <div className="min-w-0">
            <div className="ba-font-ui text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#f5c96f]">
              Streak
            </div>
            <div className="ba-font-ui text-[0.84rem] font-semibold text-[#f7ecda]">
              {streak.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.25">
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
            <span className="min-w-0 text-left pr-0.5">
              <span className="ba-font-ui block truncate text-[0.76rem] font-semibold text-[#f5ecdc]">
                {playerName}
              </span>
              <span className="ba-font-ui block truncate text-[0.56rem] uppercase tracking-[0.08em] text-white/48">
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
