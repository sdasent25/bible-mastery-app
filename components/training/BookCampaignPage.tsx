import Link from "next/link"

import type { TrainingAccessState, TrainingAccessTier, TrainingDaySummary } from "@/lib/training/types"
import type { TrainingBookMetadata, TrainingMissionMetadata } from "@/lib/training/trainingMetadata"
import type { TrainingBookSlug } from "@/lib/training/bibleStructure"

type BookCampaignPageProps = {
  access: TrainingAccessState
  bookSlug: TrainingBookSlug
  book: TrainingBookMetadata
  days: TrainingDaySummary[]
  missionMetaByDay: Map<number, TrainingMissionMetadata>
}

const FREE_PREVIEW_LIMIT = 3

type MissionPathStatus = "today" | "upcoming" | "locked" | "preview_locked"

function isPlayableForTier(dayNumber: number, tier: TrainingAccessTier) {
  return tier !== "free" || dayNumber <= FREE_PREVIEW_LIMIT
}

function getPlanDisplay(access: TrainingAccessState) {
  if (access.rawPlan === "family_pro_plus") return "Family Pro+ Full Depth"
  if (access.rawPlan === "family_pro") return "Family Pro Core"
  if (access.tier === "pro_plus") return "Full Arena Access"
  if (access.tier === "pro") return "Core Access"
  return "Free Preview"
}

function getDepthChip(access: TrainingAccessState) {
  if (access.tier === "pro_plus") return "Full Depth"
  if (access.tier === "pro") return "Core Access"
  return "Preview Access"
}

function getTierCount(access: TrainingAccessState) {
  if (access.tier === "pro_plus") return "3 Tiers of Difficulty"
  if (access.tier === "pro") return "2 Tiers of Difficulty"
  return "Preview Tier Active"
}

function getEstimatedTime(itemCount: number, tier: TrainingAccessTier) {
  if (tier === "free") return `${Math.max(2, Math.ceil(itemCount / 3))}-${Math.max(4, Math.ceil(itemCount / 2))} min`
  if (tier === "pro") return `${Math.max(4, Math.ceil(itemCount / 3))}-${Math.max(6, Math.ceil(itemCount / 2))} min`
  return `${Math.max(5, Math.ceil(itemCount / 4))}-${Math.max(8, Math.ceil(itemCount / 2.5))} min`
}

function getMissionStatus(
  day: TrainingDaySummary,
  currentMission: TrainingDaySummary | null,
  currentMissionIndex: number,
  index: number,
  access: TrainingAccessState
): MissionPathStatus {
  if (!isPlayableForTier(day.day, access.tier)) {
    return "preview_locked"
  }

  if (currentMission && day.day === currentMission.day) {
    return "today"
  }

  if (index === currentMissionIndex + 1) {
    return "upcoming"
  }

  return "locked"
}

function getStatusLabel(status: MissionPathStatus) {
  if (status === "today") return "Today"
  if (status === "upcoming") return "Upcoming"
  if (status === "preview_locked") return "Preview Locked"
  return "Locked"
}

function getStatusCopy(status: MissionPathStatus, access: TrainingAccessState) {
  if (status === "today") return "Current Mission"
  if (status === "upcoming") return "Next in Path"
  if (status === "preview_locked") {
    return access.signedIn ? "Upgrade for Full Arena" : "Sign In to Continue"
  }

  return "Path Continues Ahead"
}

function getStatusClasses(status: MissionPathStatus) {
  if (status === "today") {
    return "border-amber-200/24 bg-[linear-gradient(180deg,rgba(39,29,11,0.96),rgba(12,12,18,0.99))] shadow-[0_0_30px_rgba(251,191,36,0.16)]"
  }

  if (status === "upcoming") {
    return "border-cyan-200/16 bg-[linear-gradient(180deg,rgba(15,21,34,0.96),rgba(8,11,20,0.98))] shadow-[0_0_24px_rgba(34,211,238,0.06)]"
  }

  if (status === "preview_locked") {
    return "border-amber-200/10 bg-[linear-gradient(180deg,rgba(22,18,15,0.96),rgba(10,11,18,0.98))] opacity-88"
  }

  return "border-white/8 bg-[linear-gradient(180deg,rgba(14,19,30,0.96),rgba(8,11,20,0.98))] opacity-78"
}

export default function BookCampaignPage({
  access,
  bookSlug,
  book,
  days,
  missionMetaByDay,
}: BookCampaignPageProps) {
  const playableDays = days.filter((day) => isPlayableForTier(day.day, access.tier))
  const currentMission = playableDays[0] ?? null
  const currentMissionIndex = currentMission
    ? days.findIndex((day) => day.day === currentMission.day)
    : -1
  const featuredMission = currentMission ?? days[0] ?? null
  const missionCount = days.length
  const completedMissionCount = 0
  const progressPercent =
    missionCount > 0 ? Math.round((completedMissionCount / missionCount) * 100) : 0
  const currentMissionMeta = featuredMission
    ? missionMetaByDay.get(featuredMission.day)
    : null

  // Conservative placeholder until real Training Arena progression persistence exists.
  // Once completed/current mission state is stored server-side, replace this with
  // a persisted campaign progress model instead of always surfacing the first playable mission.

  return (
    <main className="ba-training-page min-h-screen overflow-x-hidden px-4 pt-3 pb-10 text-white sm:px-6 sm:pt-4 sm:pb-12 lg:min-h-full lg:pb-14 xl:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.14),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-5rem] top-28 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl sm:h-56 sm:w-56" />
      <div className="pointer-events-none absolute right-[-5rem] top-40 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl sm:h-72 sm:w-72" />

      <div className="relative mx-auto max-w-[84rem]">
        <section className="mb-3">
          <Link
            href="/training"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/[0.07]"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Training Arena</span>
          </Link>
        </section>

        <section className="ba-book-campaign-hero relative overflow-hidden rounded-[1.6rem] sm:rounded-[1.9rem]">
          <div
            className="ba-book-campaign-hero-art pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url('${book.heroImage}')`,
              backgroundPosition: bookSlug === "genesis" ? "50% 48%" : "50% 36%",
              backgroundSize: "cover",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,10,18,0.92)_0%,rgba(6,10,18,0.72)_42%,rgba(6,10,18,0.34)_70%,rgba(6,10,18,0.18)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,222,145,0.18),transparent_24%),linear-gradient(180deg,rgba(5,8,15,0.04),rgba(5,8,15,0.34)_56%,rgba(5,8,15,0.82)_100%)]" />

          <div className="relative grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:gap-5 lg:p-7 xl:grid-cols-[minmax(0,1fr)_18rem] xl:p-8">
            <div className="min-w-0">
              <div className="ba-text-section-label text-amber-100/82">Book Campaign</div>
              <h1 className="ba-font-display mt-2 text-[2.55rem] leading-[0.92] tracking-[-0.05em] text-[#f9efde] sm:text-[3.6rem] lg:text-[4rem]">
                {book.title}
              </h1>
              <p className="mt-2 text-sm font-semibold text-amber-100/88 sm:text-base">
                {book.subtitle}
              </p>
              <p className="mt-3 max-w-[38rem] text-sm leading-6 text-slate-200/84 sm:text-base sm:leading-7">
                {book.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <div className="ba-training-callout">
                  <span className="ba-training-callout-label">Section</span>
                  <span className="ba-training-callout-value">{book.sectionTitle}</span>
                </div>
                <div className="ba-training-callout">
                  <span className="ba-training-callout-label">Access</span>
                  <span className="ba-training-callout-value">{getPlanDisplay(access)}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                <div className="ba-book-stat-chip">
                  <div className="ba-book-stat-label">Missions</div>
                  <div className="ba-book-stat-value">{missionCount}</div>
                </div>
                <div className="ba-book-stat-chip">
                  <div className="ba-book-stat-label">Daily Time</div>
                  <div className="ba-book-stat-value">
                    {featuredMission ? getEstimatedTime(featuredMission.itemCount, access.tier) : "~15 min"}
                  </div>
                </div>
                <div className="ba-book-stat-chip">
                  <div className="ba-book-stat-label">Difficulty</div>
                  <div className="ba-book-stat-value">{getTierCount(access)}</div>
                </div>
              </div>
            </div>

            <aside className="ba-book-progress-card flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="ba-text-section-label text-cyan-100/72">Campaign Progress</div>
                  <div className="mt-4 ba-font-display text-[2.3rem] leading-none text-[#fbf0dd]">
                    {progressPercent}%
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300/80">
                    {completedMissionCount} / {missionCount} missions completed
                  </p>
                </div>
                <div className="ba-book-crest-shell">
                  <img
                    src={book.crestImage}
                    alt={`${book.title} campaign crest`}
                    className="h-16 w-16 object-contain sm:h-18 sm:w-18"
                  />
                </div>
              </div>

              <div className="mt-5">
                <div className="ba-progress-track h-2">
                  <div
                    className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(245,194,76,0.98),rgba(103,232,249,0.62))]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-300/72">
                  No training completion data is persisted yet, so progress is shown conservatively.
                </p>
              </div>
            </aside>

            <article className="ba-book-current-mission lg:col-span-2">
              <div className="grid gap-4 lg:grid-cols-[6.3rem_minmax(0,1fr)_16rem] lg:items-center xl:grid-cols-[7rem_minmax(0,1fr)_18rem]">
                <div className="ba-book-mission-shield">
                  <div className="ba-text-section-label text-amber-100/72">Day</div>
                  <div className="ba-font-display mt-1 text-[2.6rem] leading-none text-[#fff0cf]">
                    {featuredMission?.day ?? "—"}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="ba-text-section-label text-amber-100/82">Today&apos;s Mission</div>
                  <h2 className="mt-2 ba-font-display text-[1.9rem] leading-[0.98] text-[#fbf0dd] sm:text-[2.15rem]">
                    {featuredMission?.reference ?? `${book.title} Campaign`}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-cyan-300">
                    {currentMissionMeta?.title ?? "Current Mission"}
                  </p>
                  <p className="mt-2 max-w-[32rem] text-sm leading-6 text-slate-200/82 sm:text-base sm:leading-7">
                    {currentMissionMeta?.description ??
                      "Step into the next Scripture mission in this book campaign path."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-200/14 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50/88">
                      {featuredMission ? getEstimatedTime(featuredMission.itemCount, access.tier) : "~15 min"}
                    </span>
                    <span className="rounded-full border border-violet-200/16 bg-violet-300/10 px-3 py-1 text-xs font-semibold text-violet-50/88">
                      {getDepthChip(access)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-3 lg:items-end">
                  <p className="max-w-[15rem] text-sm leading-6 text-slate-300/76 lg:text-right">
                    {currentMission
                      ? "Current mission selected from real training data. Future path states remain conservative until progression persistence exists."
                      : access.tier === "free"
                        ? "This book is outside the free preview window. Upgrade to continue the path."
                        : "This campaign is loaded, but no playable mission is currently available."}
                  </p>
                  {currentMission ? (
                    <Link
                      href={`/training/day/${currentMission.day}/play`}
                      className="ba-training-primary-cta inline-flex w-full items-center justify-center px-6 py-3 text-sm font-black text-[#2d1700] transition hover:scale-[1.01] lg:w-auto lg:min-w-[12rem]"
                    >
                      Start Mission
                    </Link>
                  ) : (
                    <Link
                      href={access.signedIn ? "/pricing" : "/login"}
                      className="ba-training-secondary-cta inline-flex w-full items-center justify-center px-5 py-3 text-sm font-semibold text-white transition lg:w-auto lg:min-w-[12rem]"
                    >
                      {access.signedIn ? "Upgrade to Continue" : "Sign In to Continue"}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-4 rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,30,0.96),rgba(8,11,20,0.98))] p-4 shadow-[0_24px_68px_rgba(0,0,0,0.26)] sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="ba-text-section-label text-[10px] text-amber-100/78">Mission Path</div>
              <h2 className="ba-font-display mt-1 text-[1.42rem] tracking-[-0.03em] text-[#f7eee1] sm:text-[1.7rem]">
                {book.title} campaign progression
              </h2>
            </div>
            <p className="max-w-xl text-xs leading-5 text-slate-300/74">
              Future missions are shown conservatively from real day order. Completion, replay, and true daily unlock persistence do not exist yet.
            </p>
          </div>

          <div className="ba-book-path-scroll">
            <div className="ba-book-path-rail">
              {days.map((day, index) => {
                const status = getMissionStatus(day, currentMission, currentMissionIndex, index, access)
                const missionMeta = missionMetaByDay.get(day.day)

                return (
                  <article
                    key={day.day}
                    className={`ba-book-path-card ${getStatusClasses(status)}`}
                  >
                    <div className="ba-book-path-node-wrap">
                      <div
                        className={`ba-book-path-node ${
                          status === "today"
                            ? "is-today"
                            : status === "upcoming"
                              ? "is-upcoming"
                              : status === "preview_locked"
                                ? "is-preview-locked"
                                : ""
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/46">
                        Day {day.day}
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ${
                          status === "today"
                            ? "border-amber-200/18 bg-amber-200/10 text-amber-50"
                            : status === "upcoming"
                              ? "border-cyan-200/16 bg-cyan-200/10 text-cyan-50"
                              : status === "preview_locked"
                                ? "border-amber-200/16 bg-amber-200/10 text-amber-100"
                                : "border-white/10 bg-white/[0.04] text-white/62"
                        }`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    <h3 className="mt-3 ba-font-display text-[1.22rem] leading-[1] text-[#fbf0dd]">
                      {day.reference}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-white/78">
                      {missionMeta?.title ?? getStatusCopy(status, access)}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-300/72">
                      {status === "today"
                        ? "Start here."
                        : status === "upcoming"
                          ? "Next in the path."
                          : status === "preview_locked"
                            ? "Free preview ends after day 3."
                            : "Keep advancing to continue the path."}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export function UnavailableBookCampaignPage({
  access,
  bookLabel,
}: {
  access: TrainingAccessState
  bookLabel: string
}) {
  return (
    <main className="ba-training-page min-h-screen overflow-x-hidden px-4 pt-3 pb-10 text-white sm:px-6 sm:pt-4 sm:pb-12 lg:min-h-full lg:pb-14 xl:pb-16">
      <div className="relative mx-auto max-w-[72rem]">
        <section className="mb-3">
          <Link
            href="/training"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/[0.07]"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Training Arena</span>
          </Link>
        </section>

        <section className="ba-book-campaign-hero relative overflow-hidden rounded-[1.6rem] sm:rounded-[1.9rem]">
          <div
            className="ba-book-campaign-hero-art pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "url('/training/backgrounds/training-session-bg.png')",
              backgroundPosition: "50% 50%",
              backgroundSize: "cover",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,18,0.78),rgba(6,10,18,0.94))]" />
          <div className="relative grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:p-8">
            <div>
              <div className="ba-text-section-label text-cyan-100/78">Coming Soon</div>
              <h1 className="ba-font-display mt-2 text-[2.25rem] leading-[0.95] tracking-[-0.05em] text-[#f9efde] sm:text-[3.1rem]">
                {bookLabel}
              </h1>
              <p className="mt-3 max-w-[34rem] text-sm leading-6 text-slate-200/84 sm:text-base sm:leading-7">
                This book campaign is not available yet in Training Arena. The route is safe, but this path has not been loaded with live training days.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <div className="ba-training-callout">
                  <span className="ba-training-callout-label">Access</span>
                  <span className="ba-training-callout-value">{getPlanDisplay(access)}</span>
                </div>
              </div>
            </div>

            <aside className="ba-book-progress-card">
              <div className="ba-text-section-label text-amber-100/78">Training Status</div>
              <div className="mt-4 ba-font-display text-[2rem] leading-none text-[#fbf0dd]">
                Locked
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300/80">
                Return to the main Training Arena to continue a live campaign path.
              </p>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
