"use client"

import { renderNavIcon } from "@/lib/navigation"

type DashboardRightRailProps = {
  missionTitle: string
  referenceLine: string
  rewardLine: string
  sessionsCompleted: number
  versesMemorized: number
  questsCompleted: number
  totalXpEarned: number
  onContinue: () => void
  onViewProgress: () => void
}

export default function DashboardRightRail({
  missionTitle,
  referenceLine,
  rewardLine,
  sessionsCompleted,
  versesMemorized,
  questsCompleted,
  totalXpEarned,
  onContinue,
  onViewProgress,
}: DashboardRightRailProps) {
  return (
    <aside className="space-y-5">
      <section className="ba-right-rail-card rounded-[1.9rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100/72">
              Mission Available
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">{missionTitle}</h3>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/10 text-amber-100">
            {renderNavIcon("training", "h-4.5 w-4.5")}
          </div>
        </div>
        <div className="mt-4 rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/46">Scripture</div>
          <div className="mt-2 text-lg font-black text-white">{referenceLine}</div>
          <div className="mt-3 text-sm text-amber-100/84">{rewardLine}</div>
        </div>
        <button
          onClick={onContinue}
          className="ba-gold-cta mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-black uppercase tracking-[0.18em]"
        >
          {renderNavIcon("chevron-right", "h-4 w-4")}
          Continue Training
        </button>
      </section>

      <section className="ba-right-rail-card rounded-[1.85rem] p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-100/72">Daily Rhythm</div>
        <div className="mt-4 space-y-3">
          {[
            { label: "Morning Watch", value: "Complete", state: "cyan" },
            { label: "Train", value: "Complete", state: "amber" },
            { label: "Verse Memory", value: "10 verses", state: "cyan" },
            { label: "Evening Reflection", value: "Pending", state: "slate" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[1.05rem] border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                    item.state === "amber"
                      ? "border-amber-300/22 bg-amber-300/12 text-amber-100"
                      : item.state === "cyan"
                        ? "border-cyan-300/22 bg-cyan-300/12 text-cyan-100"
                        : "border-white/10 bg-white/[0.04] text-white/56"
                  }`}
                >
                  {renderNavIcon(item.state === "slate" ? "sun" : "brand", "h-3.5 w-3.5")}
                </span>
                <span className="text-sm font-semibold text-white/84">{item.label}</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/52">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ba-right-rail-card rounded-[1.85rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-violet-100/72">
            This Week&apos;s Summary
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-300/18 bg-violet-300/10 text-violet-100">
            {renderNavIcon("leaderboard", "h-4.5 w-4.5")}
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {[
            ["Sessions Completed", sessionsCompleted],
            ["Verses Memorized", versesMemorized],
            ["Quests Completed", questsCompleted],
            ["Total XP Earned", totalXpEarned],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between rounded-[1.05rem] border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="text-sm text-white/68">{label}</span>
              <span className="text-base font-black text-white">{value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onViewProgress}
          className="ba-glass-panel mt-4 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-white/[0.08]"
        >
          View Full Progress
        </button>
      </section>
    </aside>
  )
}
