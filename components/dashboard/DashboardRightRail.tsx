"use client"

import { renderNavIcon } from "@/lib/navigation"

type DashboardRightRailProps = {
  missionRewardXp: number
  memberCount: number | null
  memberLimit: number | null
  memberNames: string[]
  planLabel: string
  planMeta: string
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
  missionRewardXp,
  memberCount,
  memberLimit,
  memberNames,
  planLabel,
  planMeta,
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
        <div className="ba-rail-kicker">Daily Rhythm</div>
        <div className="mt-2.5 space-y-2">
          {[
            {
              title: "Morning Watch",
              meta: "Start your day in God's Word",
              accent: "cyan",
              complete: true,
            },
            {
              title: "Midday Focus",
              meta: "Refocus your mind",
              accent: "amber",
              complete: false,
            },
            {
              title: "Evening Reflection",
              meta: "Review and give thanks",
              accent: "violet",
              complete: false,
            },
          ].map((item) => (
            <div key={item.title} className={`ba-rhythm-row ${item.complete ? "is-complete" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={`ba-rhythm-icon accent-${item.accent}`}>
                  {renderNavIcon(item.accent === "amber" ? "sun" : item.accent === "violet" ? "verse-memory" : "brand", "h-3.5 w-3.5")}
                </span>
                <div>
                  <div className="text-[0.78rem] font-medium text-white">{item.title}</div>
                  <div className="text-[0.58rem] leading-4 text-white/48">{item.meta}</div>
                </div>
              </div>
              {item.complete ? (
                <span className="ba-rhythm-check">{renderNavIcon("chevron-right", "h-3.5 w-3.5")}</span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Mission Reward</div>
        <div className="mt-3 flex items-start gap-3">
          <span className="ba-reward-icon">
            {renderNavIcon("crown", "h-4 w-4")}
          </span>
          <div>
            <div className="ba-serif-display text-[1.3rem] text-[#ffe7a8]">
              +{missionRewardXp} XP
            </div>
            <div className="mt-1 text-[0.68rem] leading-5 text-white/50">
              Stay consistent. Grow daily.
            </div>
          </div>
        </div>
      </section>

      <section className="ba-right-rail-card">
        <div className="flex items-center justify-between gap-3">
          <div className="ba-rail-kicker">Family</div>
          <div className="text-[0.62rem] uppercase tracking-[0.18em] text-white/46">
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
            <span className="text-[0.74rem] text-white/48">No family members added yet.</span>
          )}
        </div>

        <button
          type="button"
          onClick={onInviteMember}
          className="mt-3 inline-flex items-center gap-2 text-[0.72rem] font-medium text-cyan-200 transition hover:text-white"
        >
          <span className="text-[0.92rem] leading-none">+</span>
          Invite Member
        </button>
      </section>

      <section className="ba-right-rail-card">
        <div className="ba-rail-kicker">Plan Status</div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <div className="ba-serif-brand text-[0.96rem] text-white">{planLabel}</div>
            <div className="mt-1 text-[0.64rem] leading-5 text-white/46">
              {planMeta}
            </div>
          </div>
          <span className="rounded-full border border-emerald-300/18 bg-emerald-300/12 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-emerald-100">
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
