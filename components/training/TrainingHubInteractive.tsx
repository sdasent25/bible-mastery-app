"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

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
  booksData: BookCard[]
  availableDayCount: number
  availableBookCount: number
  hasLiveData: boolean
}

type BookCard = {
  book: string
  sectionKey: SectionKey
  days: TrainingDaySummary[]
  artPath: string
}

type Props = {
  days: TrainingDaySummary[]
  access: TrainingAccessState
}

const FREE_PREVIEW_LIMIT = 3

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

const BOOK_ART_OVERRIDES: Record<string, string> = {
  Genesis: "/training/genesis/light-darkness.png",
  Exodus: "/training/exodus/burning-bush-horeb.png",
}

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

function getTierCopy(tier: TrainingAccessTier) {
  if (tier === "pro_plus") return "Full arena access is active with the deepest drill set."
  if (tier === "pro") return "Core drills are unlocked across every available training day."
  return "Train days 1-3 free, then upgrade for deeper arena access."
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

function getBookArtPath(book: string, section: SectionConfig, days: TrainingDaySummary[]) {
  if (BOOK_ART_OVERRIDES[book]) return BOOK_ART_OVERRIDES[book]
  if (days[0]) return section.artPath
  return section.artPath
}

function getMissionDepthCopy(access: TrainingAccessState) {
  if (access.tier === "pro_plus") return "Easy, core, and advanced drill depth are active."
  if (access.tier === "pro") return "Core daily drills are active. Pro+ adds the deepest arena layer."
  return `Free preview covers days 1-${FREE_PREVIEW_LIMIT} before the arena locks.`
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

  const daysByBook = useMemo(() => {
    const grouped = new Map<string, TrainingDaySummary[]>()
    for (const day of days) {
      const book = getTrackLabel(day.segmentKey)
      const current = grouped.get(book) ?? []
      current.push(day)
      grouped.set(book, current)
    }
    return grouped
  }, [days])

  const sectionCards = useMemo<SectionCard[]>(
    () =>
      SECTION_CONFIGS.map((section) => {
        const booksData: BookCard[] = section.books.map((book) => {
          const bookDays = [...(daysByBook.get(book) ?? [])].sort((a, b) => a.day - b.day)
          return {
            book,
            sectionKey: section.key,
            days: bookDays,
            artPath: getBookArtPath(book, section, bookDays),
          }
        })

        const availableDayCount = booksData.reduce((sum, book) => sum + book.days.length, 0)
        const availableBookCount = booksData.filter((book) => book.days.length > 0).length

        return {
          ...section,
          booksData,
          availableDayCount,
          availableBookCount,
          hasLiveData: availableDayCount > 0,
        }
      }),
    [daysByBook]
  )

  const initialSectionKey = sectionCards.find((section) => section.hasLiveData)?.key ?? "pentateuch"
  const [selectedSectionKey, setSelectedSectionKey] = useState<SectionKey>(initialSectionKey)
  const [selectedBook, setSelectedBook] = useState("Genesis")

  const selectedSection =
    sectionCards.find((section) => section.key === selectedSectionKey) ?? sectionCards[0]

  useEffect(() => {
    if (!selectedSection) return
    const nextBook =
      selectedSection.booksData.find((book) => book.days.length > 0)?.book ??
      selectedSection.booksData[0]?.book ??
      "Genesis"
    setSelectedBook(nextBook)
  }, [selectedSectionKey, selectedSection])

  const completedDaysCount = 0
  const progressPercent = days.length > 0 ? Math.round((completedDaysCount / days.length) * 100) : 0
  const accessDisplay = getAccessDisplay(access)
  const todayEstimate = todayDay ? getEstimatedTime(todayDay.itemCount, access.tier) : "~15 min"
  const showUpgradePanel = access.tier !== "pro_plus"

  return (
    <main className="ba-training-page min-h-screen overflow-x-hidden px-4 pt-3 pb-10 text-white sm:px-6 sm:pt-4 sm:pb-12 lg:min-h-full lg:pb-14 xl:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.16),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-24 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl sm:h-48 sm:w-48" />
      <div className="pointer-events-none absolute right-[-4rem] top-32 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl sm:h-64 sm:w-64" />

      <div className="relative mx-auto max-w-[84rem]">
        <section className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="ba-text-section-label ba-text-gold text-[0.68rem] sm:text-[0.72rem]">
              Sacred Training
            </div>
            <h1 className="ba-font-display mt-1 text-[1.78rem] leading-[0.94] tracking-[-0.04em] text-[#f5ead2] sm:text-[2.3rem] xl:text-[2.7rem]">
              Training Arena
            </h1>
            <p className="ba-font-ui mt-1.5 max-w-[32rem] text-[0.92rem] leading-6 text-slate-300 sm:text-[0.98rem]">
              Today&apos;s training is ready. Pick a Scripture section, choose a book, and launch the next mission.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:max-w-[34rem] lg:justify-end">
            <div className="ba-training-pill">
              <span className="ba-training-pill-label">Track</span>
              <span className="ba-training-pill-value">{currentTrack}</span>
            </div>
            <div className="ba-training-pill">
              <span className="ba-training-pill-label">Available Days</span>
              <span className="ba-training-pill-value">{days.length}</span>
            </div>
            <div className="ba-training-pill">
              <span className="ba-training-pill-label">Access</span>
              <span className="ba-training-pill-value">{accessDisplay}</span>
            </div>
          </div>
        </section>

        <section className="ba-training-hero ba-training-hero-hub relative overflow-hidden rounded-[1.65rem] sm:rounded-[2rem]">
          <div
            className="ba-training-hero-art pointer-events-none absolute inset-0 opacity-[1]"
            style={{
              backgroundImage: "url('/images/dashboard/training-arena-hero-sanctum.png')",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_48%,rgba(255,231,166,0.54),transparent_11%),radial-gradient(circle_at_60%_52%,rgba(255,193,74,0.24),transparent_26%),linear-gradient(90deg,rgba(4,7,13,0.88)_0%,rgba(4,7,13,0.74)_18%,rgba(4,7,13,0.34)_34%,rgba(4,7,13,0.10)_54%,rgba(4,7,13,0.08)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,18,0.03),rgba(6,10,18,0.10)_48%,rgba(6,10,18,0.28)_100%)]" />

          <div className="relative z-10 grid min-h-[21rem] gap-5 p-4 sm:min-h-[24rem] sm:p-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:p-7 xl:min-h-[25rem] xl:grid-cols-[minmax(0,1fr)_18rem] xl:p-8">
            <div className="flex min-h-full flex-col justify-between">
              <div className="max-w-[33rem]">
                <div className="flex flex-wrap gap-2">
                  <span className="ba-hero-chip ba-hero-chip-gold">Today&apos;s Training</span>
                  {todayDay ? <span className="ba-hero-chip ba-hero-chip-dark">Day {todayDay.day} Training</span> : null}
                </div>

                <h2 className="ba-font-display mt-4 max-w-[9ch] text-[2.4rem] leading-[0.86] tracking-[-0.05em] text-[#fbf2df] sm:text-[3.2rem] lg:text-[3.8rem] xl:text-[4.1rem]">
                  Today&apos;s Training
                </h2>
                <p className="ba-font-ui mt-3 text-[1rem] font-semibold leading-7 text-cyan-300 sm:text-[1.12rem]">
                  {currentTrackReference}
                </p>
                <p className="ba-font-ui mt-3 max-w-[28rem] text-sm leading-6 text-slate-200/88 sm:text-base sm:leading-7">
                  {todayDay
                    ? `Begin your ${currentTrack.toLowerCase()} training with focused Scripture recall, disciplined review, and the next mission in your arena path.`
                    : "Choose an available training day and continue your Scripture work."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5">
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

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={todayDay ? `/training/day/${todayDay.day}/play` : "/training"}
                  className="ba-training-primary-cta inline-flex w-full items-center justify-center px-5 py-3 text-sm font-black text-[#2d1700] transition hover:scale-[1.01] sm:w-auto sm:min-w-[15rem] sm:px-6 sm:py-3.5"
                >
                  Start Today&apos;s Training
                </Link>
                <Link
                  href={currentTrackHref}
                  className="ba-training-secondary-cta inline-flex w-full items-center justify-center px-6 py-3.5 text-sm font-semibold text-white transition sm:w-auto sm:min-w-[12.5rem]"
                >
                  View Track Progress
                </Link>
              </div>
            </div>

            <div className="relative z-10 flex flex-col justify-end lg:items-stretch">
              <div className="ba-training-side-panel w-full">
                <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-amber-100/72">
                  Your Progress
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="relative flex h-22 w-22 items-center justify-center rounded-full border border-white/10 bg-black/20">
                    <div className="absolute inset-2 rounded-full border border-cyan-300/18" />
                    <div className="ba-font-display text-[1.8rem] leading-none text-[#fbf0dc]">{progressPercent}%</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="ba-text-section-label text-white/58">Completion</p>
                    <p className="mt-1 ba-font-ui text-sm leading-6 text-slate-200/84">
                      {completedDaysCount} / {days.length} days completed
                    </p>
                    <div className="ba-progress-track mt-3 h-1.5">
                      <div
                        className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(245,194,76,0.98),rgba(103,232,249,0.62))]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-300/76">
                      {completedDaysCount === 0 ? "Start your first mission to build arena momentum." : "Keep advancing through your current Scripture track."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ba-training-stats-grid mt-4 grid gap-2.5 sm:mt-5 xl:grid-cols-4">
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/72">Training Days</div>
            <div className="mt-2 text-2xl font-black text-white">{days.length}</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">Real Training Arena day packs available now.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/72">Drills</div>
            <div className="mt-2 text-2xl font-black text-white">{totalDrills}</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">Prompts distributed across all current day packs.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-100/72">Daily Commitment</div>
            <div className="mt-2 text-2xl font-black text-white">{todayEstimate}</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">Short, focused, and shaped by your access depth.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.35rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-100/72">Difficulty Tiers</div>
            <div className="mt-2 text-2xl font-black text-white">{getDifficultyTierLabel(access.tier)}</div>
            <p className="mt-1.5 text-xs leading-5 text-slate-300/78">{getDifficultyTierCopy(access.tier)}</p>
          </article>
        </section>

        <section className="mt-5">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div>
              <div className="ba-text-section-label text-[10px] text-amber-100/78">Train by Scripture Section</div>
              <h2 className="ba-font-display mt-1 text-[1.45rem] tracking-[-0.03em] text-[#f7eee1] sm:text-[1.7rem]">
                Choose the world you want to train in.
              </h2>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 lg:inline-flex">
              {selectedSection?.title ?? "Section Selected"}
            </div>
          </div>

          <div className="ba-training-rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4 xl:grid-cols-5">
            {sectionCards.map((section) => {
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

        <section className="mt-5">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div>
              <div className="ba-text-section-label text-[10px] text-cyan-100/78">Choose a Book</div>
              <h2 className="ba-font-display mt-1 text-[1.45rem] tracking-[-0.03em] text-[#f7eee1] sm:text-[1.7rem]">
                {selectedSection?.title ?? "Select a section first"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-300/82">
                Step into a focused book campaign. Mission paths now live inside each book page, not on the main arena hub.
              </p>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 lg:inline-flex">
              {selectedSection?.availableBookCount ?? 0} book{selectedSection?.availableBookCount === 1 ? "" : "s"} available
            </div>
          </div>

          <div className="ba-training-rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3 xl:grid-cols-5">
            {selectedSection?.booksData.map((book) => {
              const hasLiveCampaign = book.days.length > 0
              const bookSlug = book.book.toLowerCase()
              const hasBookRoute = isTrainingBookSlug(bookSlug)
              const bookHref = hasBookRoute ? `/training/book/${bookSlug}` : null
              const lockedForNow = !hasLiveCampaign || !bookHref
              const freeLocked =
                access.tier === "free" &&
                book.days.length > 0 &&
                book.days.every((day) => day.day > FREE_PREVIEW_LIMIT)
              const selected = selectedBook === book.book
              const statusText = lockedForNow
                ? "Coming Soon"
                : freeLocked
                  ? "Preview Locked"
                  : access.tier === "free" && book.days.some((day) => day.day <= 3)
                    ? "Preview Available"
                    : "Available"
              const body = (
                <>
                  <div
                    className={`absolute inset-0 ${lockedForNow ? "opacity-[0.48] saturate-[0.68]" : "opacity-[0.82]"}`}
                    style={{
                      backgroundImage: `url('${book.artPath}')`,
                      backgroundPosition: "50% 46%",
                      backgroundSize: "cover",
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,16,0.14),rgba(7,10,16,0.46)_42%,rgba(7,10,16,0.92)_100%)]" />

                  <div className="relative flex h-full flex-col p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`ba-text-section-label inline-flex w-fit rounded-full border px-2.25 py-1 text-[0.46rem] ${lockedForNow ? "border-amber-200/16 bg-amber-200/10 text-amber-100" : "border-cyan-200/16 bg-cyan-200/10 text-cyan-50"}`}>
                        {statusText}
                      </span>
                      <span className="text-white/70">{bookHref ? "↗" : "○"}</span>
                    </div>
                    <h3 className="mt-4 ba-font-display text-[1.2rem] leading-[1] text-[#fbf0de]">{book.book}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-200/84">
                      {hasLiveCampaign
                        ? `${book.days.length} training mission${book.days.length === 1 ? "" : "s"} in this campaign path.`
                        : "This book campaign is not available yet."}
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                      <div className="text-[11px] font-semibold text-white/64">
                        {hasLiveCampaign ? book.days[0].reference : "Locked"}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100/76">
                        {bookHref ? "Open Campaign" : "Coming Soon"}
                      </div>
                    </div>
                  </div>
                </>
              )

              if (bookHref) {
                return (
                  <Link
                    key={book.book}
                    href={bookHref}
                    onClick={() => setSelectedBook(book.book)}
                    className={`ba-training-book-card group relative min-h-[8.8rem] min-w-[14rem] overflow-hidden rounded-[1.3rem] border text-left transition sm:min-w-0 ${
                      selected
                        ? "border-amber-200/20 bg-[linear-gradient(180deg,rgba(20,20,25,0.96),rgba(7,10,18,0.98))] shadow-[0_0_26px_rgba(251,191,36,0.12)]"
                        : "border-white/10 bg-[linear-gradient(180deg,rgba(13,18,30,0.96),rgba(8,11,20,0.98))]"
                    }`}
                  >
                    {body}
                  </Link>
                )
              }

              return (
                <div
                  key={book.book}
                  className={`ba-training-book-card group relative min-h-[8.8rem] min-w-[14rem] overflow-hidden rounded-[1.3rem] border text-left transition sm:min-w-0 ${
                    selected
                      ? "border-amber-200/14 bg-[linear-gradient(180deg,rgba(20,20,25,0.96),rgba(7,10,18,0.98))]"
                      : "border-white/10 bg-[linear-gradient(180deg,rgba(13,18,30,0.96),rgba(8,11,20,0.98))]"
                  } opacity-85`}
                >
                  {body}
                </div>
              )
            })}
          </div>
        </section>

        {showUpgradePanel ? (
          <section className="mt-5">
            <aside className="relative overflow-hidden rounded-[1.55rem] border border-cyan-200/16 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.12),transparent_24%),radial-gradient(circle_at_top_left,rgba(247,227,161,0.14),transparent_28%),linear-gradient(180deg,rgba(18,22,34,0.98),rgba(8,11,20,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:rounded-[1.75rem]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_32%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-100/82">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-100/20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%),rgba(251,191,36,0.12)] text-[13px] shadow-[0_0_24px_rgba(251,191,36,0.18)]">
                    🛡
                  </span>
                  <span>{access.tier === "free" ? "Unlock Full Training Access" : "Unlock Pro+ Depth"}</span>
                </div>
                <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
                  {access.tier === "free" ? "Go beyond the free preview." : "Step into the full arena."}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {access.tier === "free"
                    ? `Go Pro+ to access all ${days.length} training days, advanced drills, and full-depth Scripture training.`
                    : "Upgrade to Pro+ for the deepest drill set, richer recognition rounds, and full arena intensity."}
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">Full access to all current training days</div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">Advanced drill depth and recognition rounds</div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">Clearer progression beyond preview limits</div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">Room for future mastery tracking systems</div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/pricing"
                    className="inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-[#2d1700] shadow-[0_16px_36px_rgba(251,191,36,0.18)] transition hover:scale-[1.01] sm:w-auto sm:min-w-[13rem]"
                  >
                    {access.tier === "free" ? "Upgrade to Pro+" : "Go Pro+"}
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        ) : null}

        <section className="sr-only">{getTierCopy(access.tier)}</section>
      </div>
    </main>
  )
}
