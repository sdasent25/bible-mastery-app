"use client"

import Image from "next/image"

import { renderNavIcon } from "@/lib/navigation"

type DashboardRightRailProps = {
  currentMissionTitle: string
  currentSegmentLabel: string
  genesisProgressPercent: number
  dailyMissionComplete: boolean
  completedMissionCount: number
  totalSegments: number
  planLabel: string
  planMeta: string
  showFamilyCard?: boolean
  familyCountLabel?: string
  memberNames?: string[]
  onContinueTraining: () => void
  onOpenFamily?: () => void
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
  planLabel,
  planMeta,
  showFamilyCard = false,
  familyCountLabel = "",
  memberNames = [],
  onContinueTraining,
  onOpenFamily,
  onManagePlan,
}: DashboardRightRailProps) {
  return (
    <aside className="space-y-3">
      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Current Training</div>
        <div className="ba-rail-training-panel mt-3 overflow-hidden rounded-[1rem] border border-white/8 bg-white/[0.03]">
          <div className="relative h-[6.8rem]">
            <Image
              src="/images/dashboard/dashboard-hero-walk-in-faith.png"
              alt=""
              fill
              className="object-cover object-[58%_42%]"
              sizes="300px"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,13,0.18),rgba(4,7,13,0.78))]" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <div className="ba-font-display text-[1.12rem] font-bold tracking-[-0.02em] text-[#f7eee2]">{currentMissionTitle}</div>
              <div className="ba-text-section-label mt-1 text-[0.62rem] text-[#f4ead6]/84">
                {currentSegmentLabel}
              </div>
            </div>
          </div>
          <div className="px-3 pb-3 pt-2.5">
            <div className="ba-progress-track h-1">
              <div
                className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(243,194,82,0.98),rgba(103,232,249,0.78),rgba(244,114,182,0.65))]"
                style={{ width: `${genesisProgressPercent}%` }}
              />
            </div>
            <div className="ba-text-section-label mt-1.5 text-[0.56rem] text-white/44">
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
        <div className="ba-rail-kicker">Daily Objective</div>
        <div className="mt-3 flex items-start gap-3">
          <span className="ba-reward-icon">
            {renderNavIcon(dailyMissionComplete ? "brand" : "sun", "h-4 w-4")}
          </span>
          <div>
            <div className="ba-font-display text-[1.12rem] font-bold tracking-[-0.03em] text-[#ffe6a3]">
              {dailyMissionComplete ? "Completed Today" : "Mission Ready"}
            </div>
            <div className="ba-font-ui mt-1 text-[0.67rem] leading-[1.55] text-white/50">
              Complete 1 mission today.
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="ba-rail-reward-chip">+XP Progress</span>
          <span className="ba-rail-reward-chip ba-rail-reward-chip--ember">+Streak Momentum</span>
        </div>
        <div className="ba-text-section-label mt-3 text-[0.6rem] text-white/42">
          {completedMissionCount} of {totalSegments} Genesis missions completed
        </div>
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Rank Progress</div>
        <div className="mt-3 flex items-center gap-3">
          <div className="ba-rail-rank-medallion">
            {renderNavIcon("brand", "h-5 w-5")}
          </div>
          <div>
            <div className="ba-font-display text-[1.08rem] font-bold tracking-[-0.03em] text-[#f6eee1]">
              Sapphire II
            </div>
            <div className="ba-font-ui mt-1 text-[0.67rem] leading-[1.5] text-white/48">
              Top 18%
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="ba-progress-track h-1.5">
            <div
              className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(51,164,255,0.88),rgba(103,232,249,0.88),rgba(255,213,102,0.62))]"
              style={{ width: "34%" }}
            />
          </div>
          <div className="ba-text-section-label mt-2 text-[0.56rem] text-white/44">
            2,520 XP to Sapphire I
          </div>
        </div>
        {/* Cosmetic rank display until a real dashboard rank system exists. */}
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Weekly Rewards</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="ba-weekly-reward-card">
            <span className="ba-weekly-reward-icon ba-weekly-reward-icon--cyan">◈</span>
            <span className="ba-font-display text-[1.02rem] font-bold text-[#f7efe2]">250</span>
            <span className="ba-text-section-label text-[0.5rem] text-white/46">Gems</span>
          </div>
          <div className="ba-weekly-reward-card">
            <span className="ba-weekly-reward-icon ba-weekly-reward-icon--gold">XP</span>
            <span className="ba-font-display text-[1.02rem] font-bold text-[#f7efe2]">+10%</span>
            <span className="ba-text-section-label text-[0.5rem] text-white/46">XP Boost</span>
          </div>
          <div className="ba-weekly-reward-card">
            <span className="ba-weekly-reward-icon ba-weekly-reward-icon--amber">▣</span>
            <span className="ba-font-display text-[1.02rem] font-bold text-[#f7efe2]">1</span>
            <span className="ba-text-section-label text-[0.5rem] text-white/46">Chest</span>
          </div>
        </div>
        {/* Static reward placeholders for UI presentation until real weekly reward data is available. */}
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

      {showFamilyCard ? (
        <section className="ba-right-rail-card">
          <div className="flex items-center justify-between gap-3">
            <div className="ba-rail-kicker">Family Team</div>
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
              <span className="ba-font-ui text-[0.72rem] text-white/48">Family plan ready for members.</span>
            )}
          </div>

          {onOpenFamily ? (
            <button
              type="button"
              onClick={onOpenFamily}
              className="ba-rail-button mt-3"
            >
              Open Family Hub
            </button>
          ) : null}
        </section>
      ) : null}
    </aside>
  )
}
