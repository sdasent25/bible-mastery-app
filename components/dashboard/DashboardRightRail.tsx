"use client"

import { renderNavIcon } from "@/lib/navigation"

type DashboardRightRailProps = {
  currentMissionTitle: string
  dailyMissionComplete: boolean
  streak: number
  athleteLevel: number
  xpEarned: number
  xpToNextLevel: number
  levelProgress: number
  planLabel: string
  planMeta: string
  planActive: boolean
  onOpenMission: () => void
  onManagePlan: () => void
}

export default function DashboardRightRail({
  currentMissionTitle,
  dailyMissionComplete,
  streak,
  athleteLevel,
  xpEarned,
  xpToNextLevel,
  levelProgress,
  planLabel,
  planMeta,
  planActive,
  onOpenMission,
  onManagePlan,
}: DashboardRightRailProps) {
  const missionButtonLabel = dailyMissionComplete ? "View Daily Missions" : "Continue Mission"

  return (
    <aside className="space-y-2 xl:space-y-2">
      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Daily Mission</div>
        <div className="mt-2 flex items-start gap-2.25">
          <span className={`ba-reward-icon ${dailyMissionComplete ? "ba-reward-icon-success" : ""}`}>
            {renderNavIcon(dailyMissionComplete ? "brand" : "sun", "h-4 w-4")}
          </span>
          <div className="min-w-0">
            <div
              className={`ba-font-display text-[0.98rem] font-bold tracking-[-0.03em] ${
                dailyMissionComplete ? "text-emerald-100" : "text-[#ffe6a3]"
              }`}
            >
              {dailyMissionComplete ? "Mission Completed!" : "Mission Ready"}
            </div>
            <div className="ba-font-ui mt-0.75 text-[0.58rem] leading-[1.4] text-white/50">
              {dailyMissionComplete ? "Great work today." : "Complete 1 mission today."}
            </div>
            <div className="ba-text-section-label mt-1.4 text-[0.5rem] text-white/42">
              {currentMissionTitle}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenMission}
          className="ba-rail-button mt-2.5"
        >
          {missionButtonLabel}
        </button>
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Streak</div>
        <div className="mt-2 flex items-start gap-2.25">
          <span className="ba-reward-icon ba-reward-icon-flame">
            {renderNavIcon("sun", "h-4 w-4")}
          </span>
          <div>
            <div className="ba-font-display text-[1.5rem] font-bold leading-none tracking-[-0.04em] text-[#f7eee2]">
              {streak}
            </div>
            <div className="ba-font-ui mt-0.6 text-[0.64rem] text-white/70">
              day{streak === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Experience</div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <div className="ba-font-ui text-[0.58rem] uppercase tracking-[0.12em] text-white/52">
              Level
            </div>
            <div className="ba-font-display text-[1.5rem] font-bold leading-none tracking-[-0.04em] text-[#f7eee2]">
              {athleteLevel}
            </div>
          </div>
          <div className="text-right">
            <div className="ba-font-display text-[1.05rem] font-bold leading-none tracking-[-0.03em] text-[#f7eee2]">
              {xpEarned.toLocaleString()} XP
            </div>
            <div className="ba-font-ui mt-0.55 text-[0.56rem] text-white/46">
              Total XP
            </div>
          </div>
        </div>

        <div className="mt-2.5">
          <div className="ba-progress-track h-1.25">
            <div
              className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(243,194,82,0.98),rgba(103,232,249,0.78),rgba(244,114,182,0.65))]"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="ba-font-ui mt-1.1 flex items-center justify-between text-[0.56rem] text-white/58">
            <span>{xpToNextLevel.toLocaleString()} XP to next level</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
        </div>
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Plan Status</div>
        <div className="mt-2 flex items-start justify-between gap-2.5">
          <div>
            <div className="ba-font-display text-[0.94rem] font-bold tracking-[-0.02em] text-[#f6eee1]">
              {planLabel}
            </div>
            <div className="ba-font-ui mt-0.75 text-[0.56rem] leading-[1.38] text-white/46">
              {planMeta}
            </div>
          </div>
          {planActive ? (
            <span className="ba-text-section-label rounded-full border border-emerald-300/18 bg-emerald-300/12 px-2.5 py-1 text-[0.56rem] text-emerald-100">
              Active
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onManagePlan}
          className="ba-rail-button mt-2.25"
        >
          Manage Plan
        </button>
      </section>
    </aside>
  )
}
