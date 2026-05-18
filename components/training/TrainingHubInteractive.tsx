"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import type {
  TrainingAccessState,
  TrainingAccessTier,
  TrainingDaySummary,
} from "@/lib/training/types"
import {
  getTrainingBookSlugFromSegmentKey,
  isTrainingBookSlug,
} from "@/lib/training/bibleStructure"

type SectionKey =
  | "pentateuch"
  | "historical"
  | "wisdom"
  | "major_prophets"
  | "minor_prophets"
  | "gospels"
  | "acts"
  | "pauline_epistles"
  | "general_epistles"
  | "apocalyptic"

type SectionConfig = {
  key: SectionKey
  title: string
  description: string
  range: string
  artPath: string
  books: string[]
}

type SectionCard = SectionConfig & {
  availableDayCount: number
  hasLiveData: boolean
}

type Props = {
  days: TrainingDaySummary[]
  access: TrainingAccessState
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "pentateuch",
    title: "Pentateuch",
    description: "Covenant foundations and first beginnings",
    range: "Genesis - Deuteronomy",
    artPath: "/training/sections/pentateuch.png",
    books: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
  },
  {
    key: "historical",
    title: "Historical Books",
    description: "Kings, exile, return, and covenant memory",
    range: "Joshua - Esther",
    artPath: "/training/sections/historical-books.png",
    books: [
      "Joshua",
      "Judges",
      "Ruth",
      "1 Samuel",
      "2 Samuel",
      "1 Kings",
      "2 Kings",
      "1 Chronicles",
      "2 Chronicles",
      "Ezra",
      "Nehemiah",
      "Esther",
    ],
  },
  {
    key: "wisdom",
    title: "Wisdom",
    description: "Songs, sorrow, discipline, and awe",
    range: "Job - Song of Songs",
    artPath: "/training/sections/wisdom.png",
    books: ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Songs"],
  },
  {
    key: "major_prophets",
    title: "Major Prophets",
    description: "Voices that moved nations and hearts",
    range: "Isaiah - Daniel",
    artPath: "/training/sections/major-prophets.png",
    books: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"],
  },
  {
    key: "minor_prophets",
    title: "Minor Prophets",
    description: "Warning, mercy, and returning hope",
    range: "Hosea - Malachi",
    artPath: "/training/sections/minor-prophets.png",
    books: [
      "Hosea",
      "Joel",
      "Amos",
      "Obadiah",
      "Jonah",
      "Micah",
      "Nahum",
      "Habakkuk",
      "Zephaniah",
      "Haggai",
      "Zechariah",
      "Malachi",
    ],
  },
  {
    key: "gospels",
    title: "Gospels",
    description: "The life, death, and resurrection of Jesus",
    range: "Matthew - John",
    artPath: "/training/sections/gospels.png",
    books: ["Matthew", "Mark", "Luke", "John"],
  },
  {
    key: "acts",
    title: "Acts",
    description: "The Church sent into the world",
    range: "Acts",
    artPath: "/training/sections/acts.png",
    books: ["Acts"],
  },
  {
    key: "pauline_epistles",
    title: "Pauline Epistles",
    description: "Letters for doctrine, order, and endurance",
    range: "Romans - Philemon",
    artPath: "/training/sections/pauline-epistles.png",
    books: [
      "Romans",
      "1 Corinthians",
      "2 Corinthians",
      "Galatians",
      "Ephesians",
      "Philippians",
      "Colossians",
      "1 Thessalonians",
      "2 Thessalonians",
      "1 Timothy",
      "2 Timothy",
      "Titus",
      "Philemon",
    ],
  },
  {
    key: "general_epistles",
    title: "General Epistles",
    description: "Steady faith, tested holiness, and assurance",
    range: "Hebrews - Jude",
    artPath: "/training/sections/general-epistles.png",
    books: ["Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude"],
  },
  {
    key: "apocalyptic",
    title: "Apocalyptic",
    description: "Judgment, victory, and new creation hope",
    range: "Revelation",
    artPath: "/training/sections/apocalyptic.png",
    books: ["Revelation"],
  },
]

function getTrackLabel(segmentKey: string) {
  const [book] = segmentKey.split("-")
  return book ? book.charAt(0).toUpperCase() + book.slice(1) : "Scripture"
}

function getAccessDisplay(access: TrainingAccessState) {
  if (access.rawPlan === "family_pro_plus") return "Family Pro+ Full"
  if (access.rawPlan === "family_pro") return "Family Pro Core"
  if (access.tier === "pro_plus") return "Pro+ Full"
  if (access.tier === "pro") return "Pro Core"
  return "Free Preview"
}

function getDifficultyTierLabel(tier: TrainingAccessTier) {
  if (tier === "pro_plus") return "3"
  if (tier === "pro") return "2"
  return "1"
}

function getDifficultyTierCopy(tier: TrainingAccessTier) {
  if (tier === "pro_plus") return "Easy · Core · Advanced"
  if (tier === "pro") return "Easy · Core"
  return "Easy Preview"
}

function getEstimatedTime(itemCount: number, tier: TrainingAccessTier) {
  if (tier === "free") return `${Math.max(2, Math.ceil(itemCount / 3))}-${Math.max(4, Math.ceil(itemCount / 2))} min`
  if (tier === "pro") return `${Math.max(4, Math.ceil(itemCount / 3))}-${Math.max(6, Math.ceil(itemCount / 2))} min`
  return `${Math.max(5, Math.ceil(itemCount / 4))}-${Math.max(8, Math.ceil(itemCount / 2.5))} min`
}

export default function TrainingHubInteractive({ days, access }: Props) {
  const totalDrills = useMemo(() => days.reduce((sum, day) => sum + day.itemCount, 0), [days])
  const firstDay = days[0] ?? null
  const todayDay = days.find((day) => access.tier !== "free" || day.day <= 3) ?? firstDay
  const currentTrack = firstDay ? getTrackLabel(firstDay.segmentKey) : "Scripture"
  const currentTrackReference = todayDay?.reference ?? "No day loaded"
  const currentTrackBookSlug = todayDay
    ? getTrainingBookSlugFromSegmentKey(todayDay.segmentKey)
    : ""
  const currentTrackHref = isTrainingBookSlug(currentTrackBookSlug)
    ? `/training/book/${currentTrackBookSlug}`
    : "/training/book/genesis"

  const sectionCards = useMemo<SectionCard[]>(
    () =>
      SECTION_CONFIGS.map((section) => {
        const availableDayCount = days.reduce((sum, day) => {
          const book = getTrackLabel(day.segmentKey)
          return section.books.includes(book) ? sum + 1 : sum
        }, 0)

        return {
          ...section,
          availableDayCount,
          hasLiveData: availableDayCount > 0,
        }
      }),
    [days]
  )

  const initialSectionKey = sectionCards.find((section) => section.hasLiveData)?.key ?? "pentateuch"
  const [selectedSectionKey, setSelectedSectionKey] = useState<SectionKey>(initialSectionKey)

  const completedDaysCount = 0
  const progressPercent = days.length > 0 ? Math.round((completedDaysCount / days.length) * 100) : 0
  const accessDisplay = getAccessDisplay(access)
  const todayEstimate = todayDay ? getEstimatedTime(todayDay.itemCount, access.tier) : "~15 min"

  return (
    <main className="ba-training-page min-h-screen overflow-x-hidden px-4 pt-3 pb-10 text-white sm:px-6 sm:pt-4 sm:pb-12 lg:min-h-full lg:pb-14 xl:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.16),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-24 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl sm:h-48 sm:w-48" />
      <div className="pointer-events-none absolute right-[-4rem] top-32 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl sm:h-64 sm:w-64" />

      <div className="relative mx-auto max-w-[84rem] lg:mx-0 lg:max-w-none">
        <section className="ba-training-mobile-hub lg:hidden">
          <section className="ba-training-hero ba-training-hero-hub relative overflow-hidden rounded-[1.65rem] sm:rounded-[2rem]">
            <div
              className="ba-training-hero-art pointer-events-none absolute inset-0 opacity-[1]"
              style={{
                backgroundImage: "url('/training/hero/training-arena-main.png')",
              }}
            />
            <div className="ba-training-hero-overlay-desktop pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_48%,rgba(255,231,166,0.54),transparent_11%),radial-gradient(circle_at_60%_52%,rgba(255,193,74,0.24),transparent_26%),linear-gradient(90deg,rgba(4,7,13,0.88)_0%,rgba(4,7,13,0.74)_18%,rgba(4,7,13,0.34)_34%,rgba(4,7,13,0.10)_54%,rgba(4,7,13,0.08)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,18,0.03),rgba(6,10,18,0.10)_48%,rgba(6,10,18,0.28)_100%)]" />
          </section>

          <section className="mt-2.5">
            <div className="ba-training-side-panel ba-training-side-panel-today w-full">
              <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-amber-100/72">
                Today&apos;s Training
              </div>
              <h3 className="ba-font-display mt-2 text-[1.72rem] leading-[0.96] text-[#fbf0dd]">
                {currentTrackReference}
              </h3>
              <p className="mt-1 text-[0.88rem] font-semibold text-amber-100/84">
                {todayDay ? `Day ${todayDay.day} Mission` : "Mission Ready"}
              </p>

              <div className="mt-3">
                <Link
                  href={todayDay ? `/training/day/${todayDay.day}/play` : "/training"}
                  className="ba-training-primary-cta inline-flex w-full items-center justify-center px-5 py-2.5 text-sm font-black text-[#2d1700] transition hover:scale-[1.01]"
                >
                  Start Today&apos;s Training
                </Link>
              </div>

              <Link
                href={currentTrackHref}
                className="mt-2 inline-flex items-center justify-center text-[0.84rem] font-semibold text-amber-100/78 transition hover:text-white"
              >
                View Track Progress →
              </Link>
            </div>
          </section>

          <section className="mt-2.5">
            <div className="ba-training-side-panel ba-training-side-panel-progress w-full">
              <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-amber-100/72">
                Overall Progress
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="relative flex h-[3.5rem] w-[3.5rem] items-center justify-center rounded-full border border-white/10 bg-black/20">
                  <div className="absolute inset-1.5 rounded-full border border-cyan-300/18" />
                  <div className="ba-font-display text-[1.22rem] leading-none text-[#fbf0dc]">{progressPercent}%</div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="ba-text-section-label text-white/58">Overall Progress</p>
                  <p className="mt-1 text-[0.86rem] leading-5 text-slate-200/84">{progressPercent}%</p>
                  <p className="mt-1 text-[11px] leading-4.5 text-slate-300/76">
                    {completedDaysCount} / {days.length} Days Completed
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="ba-training-stats-grid-mobile mt-2.5 grid grid-cols-4 gap-1.5">
            <article className="ba-training-support-card ba-training-support-card-mobile rounded-[1rem] p-2.5">
              <div className="text-[1.05rem] font-black leading-none text-white">{days.length}</div>
              <p className="mt-1 text-[0.64rem] leading-4 text-slate-300/78">Days</p>
            </article>
            <article className="ba-training-support-card ba-training-support-card-mobile rounded-[1rem] p-2.5">
              <div className="text-[1.05rem] font-black leading-none text-white">{totalDrills}</div>
              <p className="mt-1 text-[0.64rem] leading-4 text-slate-300/78">Drills</p>
            </article>
            <article className="ba-training-support-card ba-training-support-card-mobile rounded-[1rem] p-2.5">
              <div className="text-[1.05rem] font-black leading-none text-white">{todayEstimate}</div>
              <p className="mt-1 text-[0.64rem] leading-4 text-slate-300/78">min</p>
            </article>
            <article className="ba-training-support-card ba-training-support-card-mobile rounded-[1rem] p-2.5">
              <div className="text-[1.05rem] font-black leading-none text-white">{getDifficultyTierLabel(access.tier)}</div>
              <p className="mt-1 text-[0.64rem] leading-4 text-slate-300/78">Tiers</p>
            </article>
          </section>
        </section>

        <section className="hidden lg:block ba-training-hero ba-training-hero-hub relative overflow-hidden rounded-[1.65rem] sm:rounded-[2rem]">
          <div
            className="ba-training-hero-art pointer-events-none absolute inset-0 opacity-[1]"
            style={{
              backgroundImage: "url('/training/hero/training-arena-main.png')",
            }}
          />
          <div className="ba-training-hero-overlay-desktop pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_48%,rgba(255,231,166,0.54),transparent_11%),radial-gradient(circle_at_60%_52%,rgba(255,193,74,0.24),transparent_26%),linear-gradient(90deg,rgba(4,7,13,0.88)_0%,rgba(4,7,13,0.74)_18%,rgba(4,7,13,0.34)_34%,rgba(4,7,13,0.10)_54%,rgba(4,7,13,0.08)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,18,0.03),rgba(6,10,18,0.10)_48%,rgba(6,10,18,0.28)_100%)]" />

          <div className="relative z-10 grid min-h-[21rem] gap-5 p-4 sm:min-h-[24rem] sm:p-6 lg:min-h-[23rem] lg:grid-cols-[minmax(0,1.16fr)_17.5rem] lg:grid-rows-[auto_1fr] lg:gap-4 lg:p-5 xl:min-h-[23.75rem] xl:grid-cols-[minmax(0,1.2fr)_18rem] xl:px-6 xl:py-5">
            <div className="hidden lg:flex lg:col-span-2 lg:items-start lg:justify-end lg:gap-2.5">
              <div className="ba-training-pill">
                <span className="ba-training-pill-label">Current Track</span>
                <span className="ba-training-pill-value">Pentateuch • {currentTrack}</span>
              </div>
              <div className="ba-training-pill">
                <span className="ba-training-pill-label">Access</span>
                <span className="ba-training-pill-value">{accessDisplay}</span>
              </div>
            </div>

            <div className="flex min-h-full flex-col justify-between">
              <div className="max-w-[22rem] lg:max-w-[20rem] xl:max-w-[21rem]">
                <div className="flex flex-wrap gap-2">
                  <span className="ba-hero-chip ba-hero-chip-gold lg:hidden">Today&apos;s Training</span>
                  {todayDay ? <span className="ba-hero-chip ba-hero-chip-dark lg:hidden">Day {todayDay.day} Training</span> : null}
                  <span className="ba-hero-chip ba-hero-chip-gold hidden lg:inline-flex">Sacred Training</span>
                </div>

                <h2 className="ba-font-display mt-3.5 max-w-[8ch] text-[2.4rem] leading-[0.86] tracking-[-0.05em] text-[#fbf2df] sm:text-[3.2rem] lg:text-[3.55rem] xl:text-[3.8rem]">
                  Training Arena
                </h2>
                <p className="ba-font-ui mt-2.5 max-w-[25rem] text-sm leading-6 text-slate-200/88 sm:text-base sm:leading-7 lg:max-w-[19rem]">
                  Sharpen your mind. Strengthen your faith.
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5 lg:hidden">
                  <div className="ba-training-callout">
                    <span className="ba-training-callout-label">Reference</span>
                    <span className="ba-training-callout-value">{currentTrackReference}</span>
                  </div>
                  <div className="ba-training-callout">
                    <span className="ba-training-callout-label">Access</span>
                    <span className="ba-training-callout-value">{accessDisplay}</span>
                  </div>
                </div>
              </div>

              <div className="ba-training-side-panel ba-training-side-panel-progress mt-5 w-full lg:mt-0 lg:max-w-[18rem]">
                <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-amber-100/72">
                  Overall Progress
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="relative flex h-[4.4rem] w-[4.4rem] items-center justify-center rounded-full border border-white/10 bg-black/20">
                    <div className="absolute inset-2 rounded-full border border-cyan-300/18" />
                    <div className="ba-font-display text-[1.5rem] leading-none text-[#fbf0dc]">{progressPercent}%</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="ba-text-section-label text-white/58">Completion</p>
                    <p className="mt-1 ba-font-ui text-[0.9rem] leading-5 text-slate-200/84">
                      {completedDaysCount} / {days.length} days completed
                    </p>
                    <div className="ba-progress-track mt-2.5 h-1.5">
                      <div
                        className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(245,194,76,0.98),rgba(103,232,249,0.62))]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2.5 text-[11px] leading-4.5 text-slate-300/76">
                      {completedDaysCount === 0 ? "0 / 19 Days Completed" : "Keep advancing through your current Scripture track."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col justify-end lg:row-span-2 lg:justify-center lg:items-stretch">
              <div className="ba-training-side-panel ba-training-side-panel-today w-full">
                <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-amber-100/72">
                  Today&apos;s Training
                </div>
                <h3 className="ba-font-display mt-2.5 text-[1.85rem] leading-[0.96] text-[#fbf0dd] lg:text-[1.95rem]">
                  {currentTrackReference}
                </h3>
                <p className="mt-1.5 text-[0.9rem] font-semibold text-amber-100/84">
                  {todayDay ? `Day ${todayDay.day} Mission` : "Mission Ready"}
                </p>
                <p className="mt-2.5 text-[0.92rem] leading-5.5 text-slate-200/82">
                  {todayDay
                    ? `Begin your ${currentTrack.toLowerCase()} training with focused Scripture recall and disciplined review.`
                    : "Choose an available training day and continue your Scripture work."}
                </p>

                <div className="mt-3.5 flex flex-col gap-2.5">
                  <Link
                    href={todayDay ? `/training/day/${todayDay.day}/play` : "/training"}
                    className="ba-training-primary-cta inline-flex w-full items-center justify-center px-5 py-2.5 text-sm font-black text-[#2d1700] transition hover:scale-[1.01] sm:px-6 sm:py-3"
                  >
                    Start Today&apos;s Training
                  </Link>
                  <Link
                    href={currentTrackHref}
                    className="inline-flex items-center justify-center text-sm font-semibold text-amber-100/84 transition hover:text-white"
                  >
                    View Track Progress →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hidden lg:grid ba-training-stats-grid mt-3 gap-2.5 sm:mt-4 xl:grid-cols-4">
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/72">Overall Progress</div>
            <div className="mt-2 text-2xl font-black text-white">{progressPercent}%</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">{completedDaysCount} / {days.length} Days Completed</p>
          </article>
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/72">Training Days</div>
            <div className="mt-2 text-2xl font-black text-white">{days.length}</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">Real Training Arena day packs available now.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-100/72">Drills</div>
            <div className="mt-2 text-2xl font-black text-white">{totalDrills}</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">Prompts distributed across all current day packs.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/72">Daily Commitment</div>
            <div className="mt-2 text-2xl font-black text-white">{todayEstimate}</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">Short, focused, and shaped by your access depth.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-100/72">Difficulty Tiers</div>
            <div className="mt-2 text-2xl font-black text-white">{getDifficultyTierLabel(access.tier)}</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">{getDifficultyTierCopy(access.tier)}</p>
          </article>
        </section>

        <section className="mt-3 lg:mt-4">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div>
              <div className="ba-text-section-label text-[10px] text-amber-100/78">Train by Scripture Section</div>
              <h2 className="ba-font-display mt-1 text-[1.45rem] tracking-[-0.03em] text-[#f7eee1] sm:text-[1.7rem]">Choose the world you want to train in.</h2>
            </div>
            <button
              type="button"
              className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 transition hover:bg-white/[0.06] lg:inline-flex"
            >
              View All Sections →
            </button>
          </div>

          <div className="ba-training-rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-5">
            {sectionCards.slice(0, 5).map((section) => {
              const selected = section.key === selectedSectionKey
              const statusCopy = section.hasLiveData
                ? `${section.availableDayCount} live day${section.availableDayCount === 1 ? "" : "s"}`
                : "Coming Soon"

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setSelectedSectionKey(section.key)}
                  className={`ba-training-section-card group relative min-h-[9.4rem] min-w-[15.5rem] overflow-hidden rounded-[1.35rem] border text-left shadow-[0_20px_54px_rgba(0,0,0,0.24)] transition sm:min-w-0 ${
                    selected
                      ? "border-amber-200/20 bg-[linear-gradient(180deg,rgba(20,20,25,0.96),rgba(7,10,18,0.98))] shadow-[0_0_28px_rgba(251,191,36,0.14)]"
                      : "border-white/10 bg-[linear-gradient(180deg,rgba(15,19,30,0.96),rgba(8,11,20,0.98))]"
                  }`}
                >
                  <div
                    className={`absolute inset-0 ${section.hasLiveData ? "opacity-[0.9]" : "opacity-[0.62] saturate-[0.7]"}`}
                    style={{
                      backgroundImage: `url('${section.artPath}')`,
                      backgroundPosition: "50% 50%",
                      backgroundSize: "cover",
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,16,0.12),rgba(7,10,16,0.42)_42%,rgba(7,10,16,0.92)_100%)]" />

                  <div className="relative flex h-full flex-col p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`ba-text-section-label rounded-full border px-2.5 py-1 text-[0.48rem] ${section.hasLiveData ? "border-cyan-200/16 bg-cyan-200/10 text-cyan-50" : "border-amber-200/16 bg-amber-200/10 text-amber-100"}`}>
                        {section.hasLiveData ? "Available" : "Locked"}
                      </span>
                      <span className="text-white/68">{selected ? "●" : "○"}</span>
                    </div>
                    <h3 className="mt-4 ba-font-display text-[1.1rem] leading-[1] text-[#fbf0de]">
                      {section.title}
                    </h3>
                    <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-white/54">{section.range}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-200/82">{section.description}</p>
                    <div className="mt-auto pt-3 text-[11px] font-semibold text-white/70">{statusCopy}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
