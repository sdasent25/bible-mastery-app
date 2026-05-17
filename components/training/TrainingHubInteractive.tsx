"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"

import type {
  TrainingAccessState,
  TrainingDaySummary,
  TrainingAccessTier,
} from "@/lib/training/types"

type HubStatus = {
  label: string
  cardClass: string
  badgeClass: string
  buttonClass: string
  buttonLabel: string
}

type TrackVisual = {
  label: string
  artPath: string
  heroPanelPath: string
}

type BibleSectionCard = {
  title: string
  subtitle: string
  action?: "open-drills" | "locked"
  accentClass: string
  borderClass: string
  glowClass: string
  artPath: string
  status: string
}

type BookGroup = {
  book: string
  days: TrainingDaySummary[]
}

type Props = {
  days: TrainingDaySummary[]
  access: TrainingAccessState
}

const DRILL_TYPE_COUNT = 6

const BIBLE_SECTIONS: BibleSectionCard[] = [
  {
    title: "Pentateuch",
    subtitle: "The foundations of everything",
    action: "open-drills",
    accentClass: "from-amber-200/26 via-yellow-300/16 to-cyan-300/10",
    borderClass: "border-amber-200/18",
    glowClass: "shadow-[0_0_32px_rgba(251,191,36,0.10)]",
    artPath: "/training/sections/pentateuch.png",
    status: "Ready",
  },
  {
    title: "Historical",
    subtitle: "God's faithfulness in history",
    action: "locked",
    accentClass: "from-sky-200/24 via-blue-300/14 to-indigo-300/10",
    borderClass: "border-sky-200/16",
    glowClass: "shadow-[0_0_32px_rgba(96,165,250,0.10)]",
    artPath: "/training/sections/historical.png",
    status: "Locked",
  },
  {
    title: "Wisdom",
    subtitle: "Living well under God's wisdom",
    action: "locked",
    accentClass: "from-fuchsia-200/24 via-violet-300/14 to-sky-300/10",
    borderClass: "border-fuchsia-200/16",
    glowClass: "shadow-[0_0_32px_rgba(192,132,252,0.10)]",
    artPath: "/training/sections/wisdom.png",
    status: "Locked",
  },
  {
    title: "Major Prophets",
    subtitle: "Messages that move nations",
    action: "locked",
    accentClass: "from-fuchsia-200/22 via-purple-300/14 to-violet-300/10",
    borderClass: "border-rose-200/16",
    glowClass: "shadow-[0_0_32px_rgba(244,114,182,0.10)]",
    artPath: "/training/sections/major-prophets.png",
    status: "Locked",
  },
  {
    title: "Minor Prophets",
    subtitle: "Voices of hope and warning",
    action: "locked",
    accentClass: "from-cyan-200/22 via-teal-300/14 to-emerald-300/10",
    borderClass: "border-cyan-200/16",
    glowClass: "shadow-[0_0_32px_rgba(45,212,191,0.10)]",
    artPath: "/training/sections/minor-prophets.png",
    status: "Locked",
  },
  {
    title: "Gospels",
    subtitle: "The life, death, and resurrection",
    action: "locked",
    accentClass: "from-yellow-200/24 via-amber-300/14 to-orange-300/10",
    borderClass: "border-yellow-200/16",
    glowClass: "shadow-[0_0_32px_rgba(253,224,71,0.10)]",
    artPath: "/training/sections/gospels.png",
    status: "Locked",
  },
  {
    title: "Acts",
    subtitle: "The Church on mission",
    action: "locked",
    accentClass: "from-orange-200/22 via-amber-300/14 to-orange-400/10",
    borderClass: "border-orange-200/16",
    glowClass: "shadow-[0_0_32px_rgba(251,146,60,0.10)]",
    artPath: "/training/sections/acts.png",
    status: "Locked",
  },
  {
    title: "Epistles",
    subtitle: "Letters for life and faith",
    action: "locked",
    accentClass: "from-cyan-200/22 via-sky-300/14 to-teal-400/10",
    borderClass: "border-cyan-200/16",
    glowClass: "shadow-[0_0_32px_rgba(34,211,238,0.10)]",
    artPath: "/training/sections/epistles.png",
    status: "Locked",
  },
  {
    title: "Revelation & Apocalyptic",
    subtitle: "The end, the hope, and the new beginning",
    action: "locked",
    accentClass: "from-rose-200/22 via-pink-300/14 to-red-400/10",
    borderClass: "border-rose-200/16",
    glowClass: "shadow-[0_0_32px_rgba(251,113,133,0.10)]",
    artPath: "/training/sections/revelation-apocalyptic.png",
    status: "Locked",
  },
]

function formatTierLabel(tier: TrainingAccessTier) {
  if (tier === "pro_plus") return "Pro+"
  if (tier === "pro") return "Pro"
  return "Free"
}

function getTrackLabel(segmentKey: string) {
  const [book] = segmentKey.split("-")
  return book ? book.charAt(0).toUpperCase() + book.slice(1) : "Scripture"
}

function getTrackVisual(segmentKey: string): TrackVisual {
  const track = getTrackLabel(segmentKey).toLowerCase()

  if (track === "exodus") {
    return {
      label: "Exodus Track",
      artPath: "/training/sections/exodus-track.svg",
      heroPanelPath: "/training/sections/exodus-track.svg",
    }
  }

  return {
    label: "Genesis Track",
    artPath: "/training/sections/genesis-track.svg",
    heroPanelPath: "/training/sections/genesis-track.svg",
  }
}

function getModeHint(tier: TrainingAccessTier) {
  if (tier === "pro_plus") return "Recall, image recognition, matching, and full drill depth"
  if (tier === "pro") return "Recall, fill blank, sequence, matching, and review drills"
  return "Careful reading, recall, and fast warmup reps"
}

function getFocusTags(tier: TrainingAccessTier) {
  if (tier === "pro_plus") return ["Recall", "Recognition", "Matching"]
  if (tier === "pro") return ["Recall", "Sequence", "Review"]
  return ["Recall", "Reading", "Warmup"]
}

function getAccessNote(tier: TrainingAccessTier) {
  if (tier === "pro_plus") return "Full arena access is live."
  if (tier === "pro") return "Core drills unlocked across the arena."
  return "Train the first 3 days on us. 5 focused reps per day."
}

function getTodayTrainingTitle(day: TrainingDaySummary | null) {
  if (!day) return "Training Ready"

  const track = getTrackLabel(day.segmentKey)
  return `${track} Training`
}

function getTodayTrainingCopy(
  day: TrainingDaySummary | null,
  tier: TrainingAccessTier
) {
  if (!day) {
    return "Choose an available training day and continue your Scripture work."
  }

  if (tier === "free") {
    return `Continue your guided pass through ${day.reference} with careful reading, recall, and a focused warmup set.`
  }

  if (tier === "pro_plus") {
    return `Continue your guided pass through ${day.reference} with deeper recall, recognition, matching, and careful reading.`
  }

  return `Continue your guided pass through ${day.reference} with recall, sequence, matching, and careful reading.`
}

function getDayDescriptor(
  dayNumber: number,
  tier: TrainingAccessTier,
  trackLabel: string
) {
  if (tier === "free" && dayNumber <= 3) {
    return `A premium preview set through ${trackLabel.toLowerCase()} with fast warmup reps and careful reading.`
  }

  if (tier === "free" && dayNumber > 3) {
    return `Upgrade to unlock full drills, image recognition, hard questions, and mastery tracking across ${trackLabel.toLowerCase()}.`
  }

  if (tier === "pro_plus") {
    return `Full arena intensity across ${trackLabel.toLowerCase()} with image rounds, sequence drills, and deeper reps.`
  }

  return `Core ${trackLabel.toLowerCase()} training with recall, fill blank, sequence, and matching drills.`
}

function getEstimatedTime(itemCount: number, tier: TrainingAccessTier) {
  if (tier === "free") return `${Math.max(2, Math.ceil(itemCount / 3))}-${Math.max(4, Math.ceil(itemCount / 2))} min`
  if (tier === "pro") return `${Math.max(4, Math.ceil(itemCount / 3))}-${Math.max(6, Math.ceil(itemCount / 2))} min`
  return `${Math.max(5, Math.ceil(itemCount / 4))}-${Math.max(8, Math.ceil(itemCount / 2.5))} min`
}

function getDayStatus(dayNumber: number, tier: TrainingAccessTier): HubStatus {
  const isPreviewDay = dayNumber <= 3
  const isLockedForFree = tier === "free" && dayNumber > 3

  if (isLockedForFree) {
    return {
      label: "Locked for Free",
      cardClass:
        "border-white/10 bg-[linear-gradient(180deg,rgba(24,28,38,0.88),rgba(10,13,20,0.95))] opacity-90",
      badgeClass:
        "border-amber-200/18 bg-amber-200/10 text-amber-100/86",
      buttonClass:
        "border border-white/12 bg-white/[0.06] text-white/86 hover:bg-white/[0.1]",
      buttonLabel: "View Lock",
    }
  }

  if (isPreviewDay && tier === "free") {
    return {
      label: "Free Preview",
      cardClass:
        "border-amber-200/16 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_38%),linear-gradient(180deg,rgba(30,21,10,0.96),rgba(12,11,14,0.96))]",
      badgeClass:
        "border-amber-200/22 bg-amber-200/12 text-amber-50",
      buttonClass:
        "bg-amber-200 text-[#2d1700] shadow-[0_14px_34px_rgba(251,191,36,0.18)] hover:scale-[1.01]",
      buttonLabel: "Train",
    }
  }

  if (tier === "pro_plus" && !isPreviewDay) {
    return {
      label: "Pro+ Arena",
      cardClass:
        "border-cyan-200/16 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.12),transparent_34%),linear-gradient(180deg,rgba(14,23,34,0.96),rgba(8,11,20,0.96))]",
      badgeClass:
        "border-cyan-200/20 bg-cyan-200/10 text-cyan-50",
      buttonClass:
        "bg-amber-200 text-[#2d1700] shadow-[0_14px_34px_rgba(251,191,36,0.18)] hover:scale-[1.01]",
      buttonLabel: "Train",
    }
  }

  if (tier === "pro" && !isPreviewDay) {
    return {
      label: "Ready",
      cardClass:
        "border-cyan-200/14 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_34%),linear-gradient(180deg,rgba(14,22,34,0.96),rgba(8,11,20,0.96))]",
      badgeClass:
        "border-cyan-200/18 bg-cyan-200/10 text-cyan-50",
      buttonClass:
        "bg-amber-200 text-[#2d1700] shadow-[0_14px_34px_rgba(251,191,36,0.18)] hover:scale-[1.01]",
      buttonLabel: "Train",
    }
  }

  return {
    label: "Ready",
    cardClass:
      "border-emerald-200/14 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_34%),linear-gradient(180deg,rgba(14,22,34,0.96),rgba(8,11,20,0.96))]",
    badgeClass:
      "border-emerald-200/18 bg-emerald-200/10 text-emerald-50",
    buttonClass:
      "bg-amber-200 text-[#2d1700] shadow-[0_14px_34px_rgba(251,191,36,0.18)] hover:scale-[1.01]",
    buttonLabel: "Train",
  }
}

function getDayArtPath(segmentKey: string, dayNumber: number) {
  const track = getTrackLabel(segmentKey).toLowerCase()

  if (track === "exodus") {
    const exodusArt: Record<number, string> = {
      17: "/training/exodus/basket-nile-reeds.png",
      18: "/training/exodus/staff-serpent-sign.png",
      19: "/training/exodus/nile-water-red.png",
    }

    return exodusArt[dayNumber] ?? "/training/exodus/burning-bush-horeb.png"
  }

  const genesisArt: Record<number, string> = {
    1: "/training/genesis/light-darkness.png",
    2: "/training/genesis/serpent-tree-garden.png",
    3: "/training/genesis/abel-flock-offering.png",
    4: "/training/genesis/ark-on-floodwaters.png",
    5: "/training/genesis/tower-of-babel.png",
    6: "/training/genesis/abram-traveling-canaan.png",
    7: "/training/genesis/abram-stars.png",
    8: "/training/genesis/abraham-visitors-mamre.png",
    9: "/training/genesis/fleeing-sodom.png",
    10: "/training/genesis/altar-stones-moriah.png",
    11: "/training/genesis/camels-at-well.png",
    12: "/training/genesis/jacob-dream-bethel.png",
    13: "/training/genesis/jacob-wrestling-night.png",
    14: "/training/genesis/joseph-special-robe.png",
    15: "/training/genesis/pharaoh-cows-dream.png",
    16: "/training/genesis/joseph-reveals-brothers.png",
  }

  return genesisArt[dayNumber] ?? "/training/genesis/light-darkness.png"
}

function getBookOrder(book: string) {
  if (book === "Genesis") return 0
  if (book === "Exodus") return 1
  return 2
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/82 transition ${open ? "rotate-180" : ""}`}
    >
      ⌄
    </span>
  )
}

export default function TrainingHubInteractive({ days, access }: Props) {
  const drillsSectionRef = useRef<HTMLElement | null>(null)
  const firstDay = days[0] ?? null
  const todayDay =
    days.find((day) => access.tier !== "free" || day.day <= 3) ?? firstDay
  const currentTrack = firstDay ? getTrackLabel(firstDay.segmentKey) : "Scripture"
  const todayTrack = todayDay ? getTrackLabel(todayDay.segmentKey) : currentTrack
  const currentTrackVisual = firstDay
    ? getTrackVisual(firstDay.segmentKey)
    : getTrackVisual("genesis-1-3")
  const previewLabel = days.length > 0 ? `Days 1-${Math.min(3, days.length)}` : "Days 1-3"
  const todayEstimate = todayDay ? getEstimatedTime(todayDay.itemCount, access.tier) : "~15 min"
  const todayTags = getFocusTags(access.tier)

  const bookGroups = useMemo(() => {
    const groups = new Map<string, TrainingDaySummary[]>()

    for (const day of days) {
      const book = getTrackLabel(day.segmentKey)
      const current = groups.get(book) ?? []
      current.push(day)
      groups.set(book, current)
    }

    return Array.from(groups.entries())
      .map(([book, bookDays]) => ({ book, days: bookDays.sort((a, b) => a.day - b.day) }))
      .sort((a, b) => getBookOrder(a.book) - getBookOrder(b.book))
  }, [days])

  const [sectionsOpen, setSectionsOpen] = useState(false)
  const [drillsOpen, setDrillsOpen] = useState(false)
  const [openBooks, setOpenBooks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of bookGroups) {
      initial[group.book] = false
    }
    return initial
  })

  function toggleBook(book: string) {
    setOpenBooks((current) => ({
      ...current,
      [book]: !current[book],
    }))
  }

  function handlePentateuchOpen() {
    setDrillsOpen(true)
    setOpenBooks((current) => {
      const next = { ...current }

      if ("Genesis" in next) {
        next.Genesis = true
      }

      if ("Exodus" in next) {
        next.Exodus = true
      }

      return next
    })

    requestAnimationFrame(() => {
      drillsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }

  return (
    <main className="ba-training-page min-h-screen overflow-x-hidden px-4 py-4 pb-10 text-white sm:px-6 sm:py-6 sm:pb-12 lg:min-h-full lg:pb-14 xl:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.18),transparent_56%)] sm:h-72" />
      <div className="pointer-events-none absolute left-[-4rem] top-24 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl sm:h-48 sm:w-48" />
      <div className="pointer-events-none absolute right-[-4rem] top-40 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl sm:h-64 sm:w-64" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,rgba(22,163,74,0.08),transparent_58%)] sm:h-64" />

      <div className="relative mx-auto max-w-[84rem]">
        <section className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0">
            <div className="ba-text-section-label ba-text-gold text-[0.68rem] sm:text-[0.72rem]">
              Sacred Training
            </div>
            <h1 className="ba-font-display mt-2 text-[2rem] leading-[0.98] tracking-[-0.03em] text-[#f5ead2] sm:text-[2.35rem] lg:text-[2.9rem] xl:text-[3.15rem]">
              Training Arena
            </h1>
            <p className="ba-font-ui mt-2 max-w-[34rem] text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Sharpen your mind. Strengthen your faith.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 lg:max-w-[25rem] lg:justify-end lg:self-start">
            <div className="ba-training-pill">
              <span className="ba-training-pill-label">Track</span>
              <span className="ba-training-pill-value">{todayTrack}</span>
            </div>
            <div className="ba-training-pill">
              <span className="ba-training-pill-label">Available Days</span>
              <span className="ba-training-pill-value">{days.length}</span>
            </div>
            <div className="ba-training-pill">
              <span className="ba-training-pill-label">Access</span>
              <span className="ba-training-pill-value">{formatTierLabel(access.tier)}</span>
            </div>
          </div>
        </section>

        <section className="ba-training-hero relative overflow-hidden rounded-[1.85rem] sm:rounded-[2.15rem]">
          <div
            className="ba-training-hero-art pointer-events-none absolute inset-0 opacity-[1]"
            style={{
              backgroundImage:
                "url('/images/dashboard/training-arena-hero-sanctum.png')",
              backgroundPosition: "60% 50%",
              backgroundSize: "cover",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_48%,rgba(255,231,166,0.56),transparent_11%),radial-gradient(circle_at_60%_50%,rgba(255,193,74,0.28),transparent_24%),linear-gradient(90deg,rgba(4,7,13,0.90)_0%,rgba(4,7,13,0.70)_14%,rgba(4,7,13,0.30)_28%,rgba(4,7,13,0.06)_44%,rgba(4,7,13,0.08)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,18,0.03),rgba(6,10,18,0.08)_32%,rgba(6,10,18,0.28)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,rgba(255,236,182,0.22),transparent_8%),radial-gradient(circle_at_60%_63%,rgba(255,210,104,0.20),transparent_14%),linear-gradient(180deg,rgba(255,230,171,0.06),transparent_24%)] mix-blend-screen" />

          <div className="relative z-10 min-h-[420px] p-5 sm:min-h-[480px] sm:p-7 lg:min-h-[540px] lg:p-9 xl:p-10">
            <div className="flex h-full flex-col justify-between lg:max-w-[36%] xl:max-w-[34rem]">
              <div className="max-w-[34rem]">
                <div className="inline-flex rounded-full border border-amber-200/22 bg-[rgba(26,20,10,0.56)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-100/82 backdrop-blur-sm">
                  Training Arena
                </div>

                <div className="mt-6 flex items-start gap-4 sm:gap-5">
                  <div
                    className="ba-training-emblem hidden shrink-0 sm:block"
                    style={{
                      backgroundImage: `url('${currentTrackVisual.artPath}')`,
                      backgroundPosition: "50% 50%",
                      backgroundSize: "cover",
                    }}
                  />

                  <div className="min-w-0">
                    <h2 className="ba-font-display max-w-[11ch] text-[2.9rem] leading-[0.88] tracking-[-0.05em] text-[#fbf2df] sm:text-[4rem] lg:text-[4.25rem] xl:text-[4.5rem]">
                      Training Arena
                    </h2>
                    <p className="ba-font-ui mt-3 max-w-[18rem] text-lg leading-8 text-[#eadfc5] sm:max-w-[22rem] sm:text-[1.5rem] sm:leading-9">
                      Sharpen your mind. Strengthen your faith.
                    </p>
                    <p className="ba-font-ui mt-4 max-w-[25rem] text-sm leading-6 text-slate-200/88 sm:text-base sm:leading-7">
                      Daily Scripture drills built from real training days so you can keep moving with disciplined recall, recognition, matching, and careful reading.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex max-w-[31rem] flex-wrap gap-2.5 sm:mt-7">
                <div className="ba-training-callout">
                  <span className="ba-training-callout-label">Track</span>
                  <span className="ba-training-callout-value">{todayTrack}</span>
                </div>
                <div className="ba-training-callout">
                  <span className="ba-training-callout-label">Available Days</span>
                  <span className="ba-training-callout-value">{days.length}</span>
                </div>
                <div className="ba-training-callout">
                  <span className="ba-training-callout-label">Access</span>
                  <span className="ba-training-callout-value">{formatTierLabel(access.tier)}</span>
                </div>
              </div>

              <div className="mt-6 flex max-w-[30rem] flex-col gap-3 sm:mt-8 sm:flex-row">
                <Link
                  href={todayDay ? `/training/day/${todayDay.day}/play` : "/training"}
                  className="ba-training-primary-cta inline-flex w-full items-center justify-center px-6 py-3.5 text-sm font-black text-[#2d1700] transition hover:scale-[1.01] sm:w-auto sm:min-w-[14.5rem]"
                >
                  Start Today&apos;s Training
                </Link>
                <a
                  href="#choose-your-drill"
                  className="ba-training-secondary-cta inline-flex w-full items-center justify-center px-6 py-3.5 text-sm font-semibold text-white transition sm:w-auto sm:min-w-[13rem]"
                >
                  View Training Days
                </a>
              </div>
            </div>

            <div className="relative z-10 hidden lg:flex lg:absolute lg:bottom-8 lg:right-8 lg:w-[15.75rem] xl:bottom-10 xl:right-10 xl:w-[16.75rem]">
              <div className="ba-training-side-panel w-full">
                <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-amber-100/72">
                  Current Lane
                </div>
                <p className="ba-font-display mt-3 text-[1.8rem] leading-[0.98] text-[#fbf0dc]">
                  {currentTrackVisual.label}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200/84">
                  Structured day packs built from live training data, ready to resume from your current access tier.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/12 bg-black/24 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/82">
                    {todayDay ? `Day ${todayDay.day}` : "Training Ready"}
                  </span>
                  <span className="rounded-full border border-white/12 bg-black/24 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/82">
                    {todayDay?.reference ?? "No Day Loaded"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ba-training-today-card relative mt-5 overflow-hidden rounded-[1.85rem] sm:mt-6 sm:rounded-[2rem]">
          <div
            className="ba-training-today-art pointer-events-none absolute right-0 top-0 h-full w-full opacity-[1] sm:w-[72%] lg:w-[59%]"
            style={{
              backgroundImage:
                "url('/images/dashboard/verse-memory-hero-gods-word.png')",
              backgroundPosition: "80% 44%",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,14,0.92)_0%,rgba(5,8,14,0.76)_15%,rgba(5,8,14,0.36)_32%,rgba(5,8,14,0.06)_48%,rgba(5,8,14,0.08)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_22%,rgba(255,220,136,0.50),transparent_14%),radial-gradient(circle_at_77%_40%,rgba(255,194,82,0.22),transparent_24%),linear-gradient(180deg,rgba(10,12,18,0.02),rgba(10,12,18,0.10)_42%,rgba(10,12,18,0.34)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_60%,rgba(255,221,150,0.18),transparent_14%),radial-gradient(circle_at_82%_28%,rgba(255,205,95,0.16),transparent_12%)] mix-blend-screen" />

          <div className="relative z-10 grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:gap-8 lg:p-8 xl:gap-10">
            <div className="min-w-0 lg:max-w-[29rem]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="ba-text-section-label ba-text-gold text-[0.72rem] sm:text-[0.76rem]">
                    Today&apos;s Training
                  </div>
                  <h3 className="ba-font-display mt-4 max-w-[12ch] text-[2.3rem] leading-[0.92] tracking-[-0.04em] text-[#fbf0dd] sm:text-[3rem] lg:text-[3.45rem]">
                    {getTodayTrainingTitle(todayDay)}
                  </h3>
                  <p className="ba-font-ui mt-3 text-[1.05rem] font-semibold leading-7 text-cyan-300 sm:text-[1.2rem]">
                    {todayDay?.reference ?? "No training day loaded"}
                  </p>
                </div>
                {todayDay ? (
                  <div className="rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-50">
                    {access.tier === "free" ? "Preview" : "Ready"}
                  </div>
                ) : null}
              </div>

              <p className="ba-font-ui mt-4 max-w-[24rem] text-sm leading-7 text-slate-200/88 sm:text-base">
                {getTodayTrainingCopy(todayDay, access.tier)}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="ba-training-meta-tile">
                  <div className="ba-training-meta-label">Estimated Time</div>
                  <div className="ba-font-display mt-3 text-[1.55rem] leading-none text-[#fbf0dd]">
                    {todayEstimate}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-slate-300/80">
                    Based on your current access tier.
                  </div>
                </div>
                <div className="ba-training-meta-tile">
                  <div className="ba-training-meta-label">Session Type</div>
                  <div className="mt-3 text-lg font-black leading-7 text-white">
                    Guided Drills
                  </div>
                  <div className="mt-2 text-xs leading-5 text-slate-300/80">
                    Structured from today&apos;s real training pack.
                  </div>
                </div>
                <div className="ba-training-meta-tile">
                  <div className="ba-training-meta-label">Available Set</div>
                  <div className="mt-3 text-lg font-black leading-7 text-white">
                    {access.tier === "free"
                      ? "Focused Warmup"
                      : access.tier === "pro_plus"
                        ? "Full Drill Depth"
                        : "Core Drill Set"}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-slate-300/80">
                    Honest to your current plan access.
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-cyan-200/14 bg-[linear-gradient(180deg,rgba(6,15,22,0.48),rgba(6,10,18,0.62))] px-4 py-4 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/68">
                  Focus Tags
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {todayTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-200/16 bg-cyan-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-300 sm:max-w-[18rem]">
                  {getAccessNote(access.tier)}
                </p>
                {todayDay ? (
                  <Link
                    href={`/training/day/${todayDay.day}/play`}
                    className="ba-training-primary-cta inline-flex w-full items-center justify-center px-6 py-3.5 text-sm font-black text-[#2d1700] transition hover:scale-[1.01] sm:w-auto sm:min-w-[14rem]"
                  >
                    Start Day {todayDay.day}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="hidden lg:flex lg:min-h-[26rem] lg:items-end lg:justify-end" aria-hidden="true">
              <div className="ba-training-art-panel h-full w-full" />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 xl:grid-cols-4">
          <article className="ba-training-support-card rounded-[1.45rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Available Days
            </div>
            <div className="mt-2 text-2xl font-black text-white">{days.length}</div>
            <p className="mt-2 text-sm text-slate-300">Ready-to-load Training Arena day packs.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.45rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Current Track
            </div>
            <div className="mt-2 text-2xl font-black text-white">{currentTrack}</div>
            <p className="mt-2 text-sm text-slate-300">Daily passage training anchored to the current reading track.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.45rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Drill Types
            </div>
            <div className="mt-2 text-2xl font-black text-white">{DRILL_TYPE_COUNT}</div>
            <p className="mt-2 text-sm text-slate-300">Recall, fill blank, image, sequence, matching, and review reps.</p>
          </article>
          <article className="ba-training-support-card rounded-[1.45rem] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Access Window
            </div>
            <div className="mt-2 text-2xl font-black text-white">{access.tier === "free" ? previewLabel : formatTierLabel(access.tier)}</div>
            <p className="mt-2 text-sm text-slate-300">{getAccessNote(access.tier)}</p>
          </article>
        </section>

        <section className="mt-5 rounded-[1.55rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_30%),linear-gradient(180deg,rgba(12,19,31,0.97),rgba(8,11,20,0.97))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.24)] sm:rounded-[1.8rem] sm:p-5">
          <button
            type="button"
            onClick={() => setSectionsOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.02] px-1 py-1 text-left transition hover:bg-white/[0.04]"
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-100/72">
                Train by Bible Section
              </div>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
                Step into each major movement of Scripture.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                From covenant beginnings to new creation hope, every section of the arena is framed as its own world.
              </p>
            </div>
            <Chevron open={sectionsOpen} />
          </button>

          {sectionsOpen ? (
            <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 sm:pb-0 xl:grid-cols-3">
              {BIBLE_SECTIONS.map((section) => {
                const isReady = section.action === "open-drills"

                return (
                  <button
                    key={section.title}
                    type="button"
                    onClick={isReady ? handlePentateuchOpen : undefined}
                    className={`group relative min-h-[13rem] min-w-[17.5rem] flex-1 overflow-hidden rounded-[1.4rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 sm:min-h-[14rem] sm:min-w-0 ${section.borderClass} ${section.glowClass} ${
                      isReady
                        ? "hover:-translate-y-1"
                        : "cursor-default opacity-90 saturate-75"
                    }`}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.92]"
                      style={{
                        backgroundImage: `url('${section.artPath}')`,
                        backgroundPosition: "50% 50%",
                        backgroundSize: "cover",
                      }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_34%),linear-gradient(180deg,rgba(7,10,16,0.10),rgba(7,10,16,0.84))]" />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-lg text-white/92">{isReady ? "✦" : "🔒"}</div>
                        <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/78">
                          {section.status}
                        </div>
                      </div>
                      <div className="mt-6 text-base font-black text-white sm:text-lg">{section.title}</div>
                      <div className="mt-2 max-w-[16rem] text-sm leading-6 text-slate-300">{section.subtitle}</div>
                      <div className="mt-auto pt-6">
                        <div className={`h-1 w-full rounded-full bg-gradient-to-r ${section.accentClass}`} />
                        <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.22em] text-white/72">
                          <span>{isReady ? "Open Section" : "Locked"}</span>
                          <span className={`transition duration-200 ${isReady ? "group-hover:translate-x-1" : ""}`}>
                            {isReady ? "→" : "•"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>

        <section
          id="choose-your-drill"
          ref={drillsSectionRef}
          className="mt-6 rounded-[1.55rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_30%),linear-gradient(180deg,rgba(12,18,29,0.98),rgba(8,11,20,0.98))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.24)] sm:rounded-[1.8rem] sm:p-5"
        >
          <button
            type="button"
            onClick={() => setDrillsOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.02] px-1 py-1 text-left transition hover:bg-white/[0.04]"
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-100/72">
                Choose Your Drill
              </div>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Select a book track and continue your daily training.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Mission packs are grouped by book so each training lane feels focused, compact, and easy to resume.
              </p>
            </div>
            <Chevron open={drillsOpen} />
          </button>

          {drillsOpen ? (
            <div className="mt-5 space-y-5">
              {bookGroups.map((group) => {
                const firstGroupDay = group.days[0]
                const trackVisual = getTrackVisual(firstGroupDay.segmentKey)
                const bookOpen = openBooks[group.book] ?? true

                return (
                  <section
                    key={group.book}
                    className="overflow-hidden rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,17,29,0.95),rgba(8,11,20,0.98))]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleBook(group.book)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 sm:block"
                          style={{
                            backgroundImage: `url('${trackVisual.artPath}')`,
                            backgroundPosition: "50% 42%",
                            backgroundSize: "cover",
                          }}
                        />
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-100/68">
                            {group.book} Track
                          </div>
                          <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
                            {group.book}
                          </h3>
                          <p className="mt-1 text-sm text-slate-300">
                            {group.days.length} {group.book} drills available
                          </p>
                        </div>
                      </div>
                      <Chevron open={bookOpen} />
                    </button>

                    {bookOpen ? (
                      <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                        {group.days.map((day) => {
                          const status = getDayStatus(day.day, access.tier)
                          const lockedForFree = access.tier === "free" && day.day > 3
                          const dayTrack = getTrackLabel(day.segmentKey)
                          const dayArtPath = getDayArtPath(day.segmentKey, day.day)
                          const descriptor = getDayDescriptor(day.day, access.tier, dayTrack)
                          const estTime = getEstimatedTime(day.itemCount, access.tier)

                          return (
                            <article
                              key={day.day}
                              className={`group relative overflow-hidden rounded-[1.45rem] border p-4 shadow-[0_22px_60px_rgba(0,0,0,0.24)] transition duration-200 sm:rounded-[1.6rem] sm:p-5 ${status.cardClass} ${lockedForFree ? "" : "hover:-translate-y-1"}`}
                            >
                              <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-[0.92]"
                                style={{
                                  backgroundImage: `url('${dayArtPath}')`,
                                  backgroundPosition: "50% 42%",
                                  backgroundSize: "cover",
                                }}
                              />
                              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_26%),linear-gradient(180deg,rgba(8,11,18,0.02),rgba(8,11,18,0.46)_30%,rgba(8,11,18,0.82)_100%)]" />
                              <div className="pointer-events-none absolute inset-x-0 top-[7.65rem] h-px bg-white/10" />

                              <div className="relative z-10">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-100">
                                    Day {day.day}
                                  </div>
                                  <div className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${status.badgeClass}`}>
                                    {status.label}
                                  </div>
                                </div>

                                <div className="mt-14 text-[10px] font-bold uppercase tracking-[0.24em] text-white/56">
                                  Mission Reading
                                </div>
                                <h4 className="mt-2 text-xl font-black tracking-[-0.03em] text-white sm:text-2xl">
                                  {day.reference}
                                </h4>

                                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62">
                                  <span>{day.itemCount} prompts</span>
                                  <span>{estTime}</span>
                                  <span>{dayTrack} track</span>
                                </div>

                                <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-300">
                                  {descriptor}
                                </p>

                                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                                  <div className="text-xs uppercase tracking-[0.2em] text-white/48">
                                    {lockedForFree ? "Free preview ends after day 3" : access.tier === "free" ? "5 focused reps per day" : "Ready to train"}
                                  </div>
                                  <Link
                                    href={`/training/day/${day.day}/play`}
                                    className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${status.buttonClass}`}
                                  >
                                    {status.buttonLabel}
                                  </Link>
                                </div>
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    ) : null}
                  </section>
                )
              })}
            </div>
          ) : null}
        </section>

        <section className="mt-6">
          <aside
            id="pro-plus-arena"
            className="relative overflow-hidden rounded-[1.55rem] border border-cyan-200/16 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.12),transparent_24%),radial-gradient(circle_at_top_left,rgba(247,227,161,0.14),transparent_28%),linear-gradient(180deg,rgba(18,22,34,0.98),rgba(8,11,20,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:rounded-[1.75rem]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_32%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-100/82">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-100/20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%),rgba(251,191,36,0.12)] text-[13px] shadow-[0_0_24px_rgba(251,191,36,0.18)]">
                  🛡
                </span>
                <span>Pro+ Arena</span>
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
                Unlock the full training experience.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Step into the elite lane of the arena with deeper drills, fuller day packs, and a premium mastery path.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">
                  Full access to all days
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">
                  Advanced drill modes
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">
                  Performance insights
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">
                  Priority updates
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/pricing"
                  className="inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-[#2d1700] shadow-[0_16px_36px_rgba(251,191,36,0.18)] transition hover:scale-[1.01] sm:w-auto sm:min-w-[13rem]"
                >
                  Go Pro+
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
