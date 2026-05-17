"use client"

import { renderNavIcon } from "@/lib/navigation"

type DashboardRightRailProps = {
  currentMissionTitle: string
  currentSegmentLabel: string
  genesisProgressPercent: number
  dailyMissionComplete: boolean
  completedMissionCount: number
  totalSegments: number
  memberCount: number | null
  memberLimit: number | null
  memberNames: string[]
  planLabel: string
  planMeta: string
  onContinueTraining: () => void
  onInviteMember: () => void
  onManagePlan: () => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

export default function DashboardRightRail({
  currentMissionTitle,
  currentSegmentLabel,
  genesisProgressPercent,
  dailyMissionComplete,
  completedMissionCount,
  totalSegments,
  memberCount,
  memberLimit,
  memberNames,
  planLabel,
  planMeta,
  onContinueTraining,
  onInviteMember,
  onManagePlan,
}: DashboardRightRailProps) {
  const familyCountLabel =
    memberCount !== null && memberLimit !== null
      ? `${memberCount} / ${memberLimit} Members`
      : "Solo Plan"

  return (
    <aside className="space-y-3">
      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Current Training</div>
        <div className="ba-rail-training-panel mt-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-3">
          <div className="ba-font-display text-[0.98rem] font-bold tracking-[-0.02em] text-[#f7eee2]">{currentMissionTitle}</div>
          <div className="ba-text-section-label ba-text-cyan mt-1 text-[0.62rem]">
            {currentSegmentLabel}
          </div>
          <div className="mt-3">
            <div className="ba-progress-track h-1">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(243,194,82,0.98),rgba(103,232,249,0.78),rgba(244,114,182,0.65))]"
                style={{ width: `${genesisProgressPercent}%` }}
              />
            </div>
            <div className="ba-text-section-label mt-1 text-[0.56rem] text-white/44">
              {genesisProgressPercent}% through Genesis
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinueTraining}
          className="ba-rail-button mt-3"
        >
          Continue Training
        </button>
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Today&apos;s Progress</div>
        <div className="mt-3 flex items-start gap-3">
          <span className="ba-reward-icon">
            {renderNavIcon(dailyMissionComplete ? "brand" : "sun", "h-4 w-4")}
          </span>
          <div>
            <div className="ba-font-display text-[1.12rem] font-bold tracking-[-0.03em] text-[#ffe6a3]">
              {dailyMissionComplete ? "Completed Today" : "Mission Ready"}
            </div>
            <div className="ba-font-ui mt-1 text-[0.67rem] leading-[1.55] text-white/50">
              {completedMissionCount} of {totalSegments} Genesis missions completed.
            </div>
          </div>
        </div>
        <div className="ba-text-section-label mt-3 text-[0.6rem] text-white/42">
          {genesisProgressPercent}% campaign progress
        </div>
      </section>

      <section className="ba-right-rail-card">
        <div className="flex items-center justify-between gap-3">
          <div className="ba-rail-kicker">Family</div>
          <div className="ba-text-section-label text-[0.58rem] text-white/46">
            {familyCountLabel}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {memberNames.length > 0 ? (
            memberNames.slice(0, 5).map((name) => (
              <span key={name} className="ba-family-avatar" title={name}>
                {getInitials(name)}
              </span>
            ))
          ) : (
            <span className="ba-font-ui text-[0.72rem] text-white/48">No family members added yet.</span>
          )}
        </div>

        <button
          type="button"
          onClick={onInviteMember}
          className="ba-font-ui mt-3 inline-flex items-center gap-2 text-[0.72rem] font-medium text-cyan-200 transition hover:text-white"
        >
          <span className="text-[0.92rem] leading-none">+</span>
          Invite Member
        </button>
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Plan Status</div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <div className="ba-font-display text-[1rem] font-bold tracking-[-0.02em] text-[#f6eee1]">{planLabel}</div>
            <div className="ba-font-ui mt-1 text-[0.63rem] leading-[1.55] text-white/46">
              {planMeta}
            </div>
          </div>
          <span className="ba-text-section-label rounded-full border border-emerald-300/18 bg-emerald-300/12 px-2.5 py-1 text-[0.56rem] text-emerald-100">
            Active
          </span>
        </div>
        <button
          type="button"
          onClick={onManagePlan}
          className="ba-rail-button mt-3"
        >
          Manage Plan
        </button>
      </section>
    </aside>
  )
}
