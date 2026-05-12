import Link from "next/link"

import {
  getTrainingAccessState,
  listTrainingDays,
} from "@/lib/training/loadTrainingDay"

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
  href: string
  accentClass: string
  borderClass: string
  glowClass: string
  artPath: string
  status: string
}

const DRILL_TYPE_COUNT = 6

const BIBLE_SECTIONS: BibleSectionCard[] = [
  {
    title: "Pentateuch",
    subtitle: "The foundations of everything",
    href: "#training-days",
    accentClass: "from-amber-200/26 via-yellow-300/16 to-cyan-300/10",
    borderClass: "border-amber-200/18",
    glowClass: "shadow-[0_0_32px_rgba(251,191,36,0.10)]",
    artPath: "/training/sections/pentateuch.svg",
    status: "Live now",
  },
  {
    title: "Historical",
    subtitle: "God's faithfulness in history",
    href: "/training",
    accentClass: "from-sky-200/24 via-blue-300/14 to-indigo-300/10",
    borderClass: "border-sky-200/16",
    glowClass: "shadow-[0_0_32px_rgba(96,165,250,0.10)]",
    artPath: "/training/sections/historical.svg",
    status: "Building",
  },
  {
    title: "Wisdom",
    subtitle: "Living well under God's wisdom",
    href: "/training",
    accentClass: "from-fuchsia-200/24 via-violet-300/14 to-sky-300/10",
    borderClass: "border-fuchsia-200/16",
    glowClass: "shadow-[0_0_32px_rgba(192,132,252,0.10)]",
    artPath: "/training/sections/wisdom.svg",
    status: "Building",
  },
  {
    title: "Major Prophets",
    subtitle: "Messages that move nations",
    href: "/training",
    accentClass: "from-fuchsia-200/22 via-purple-300/14 to-violet-300/10",
    borderClass: "border-rose-200/16",
    glowClass: "shadow-[0_0_32px_rgba(244,114,182,0.10)]",
    artPath: "/training/sections/major-prophets.svg",
    status: "Building",
  },
  {
    title: "Minor Prophets",
    subtitle: "Voices of hope and warning",
    href: "/training",
    accentClass: "from-cyan-200/22 via-teal-300/14 to-emerald-300/10",
    borderClass: "border-cyan-200/16",
    glowClass: "shadow-[0_0_32px_rgba(45,212,191,0.10)]",
    artPath: "/training/sections/minor-prophets.svg",
    status: "Building",
  },
  {
    title: "Gospels",
    subtitle: "The life, death, and resurrection",
    href: "/training",
    accentClass: "from-yellow-200/24 via-amber-300/14 to-orange-300/10",
    borderClass: "border-yellow-200/16",
    glowClass: "shadow-[0_0_32px_rgba(253,224,71,0.10)]",
    artPath: "/training/sections/gospels.svg",
    status: "Building",
  },
  {
    title: "Acts",
    subtitle: "The Church on mission",
    href: "/training",
    accentClass: "from-orange-200/22 via-amber-300/14 to-orange-400/10",
    borderClass: "border-orange-200/16",
    glowClass: "shadow-[0_0_32px_rgba(251,146,60,0.10)]",
    artPath: "/training/sections/acts.svg",
    status: "Building",
  },
  {
    title: "Epistles",
    subtitle: "Letters for life and faith",
    href: "/training",
    accentClass: "from-cyan-200/22 via-sky-300/14 to-teal-400/10",
    borderClass: "border-cyan-200/16",
    glowClass: "shadow-[0_0_32px_rgba(34,211,238,0.10)]",
    artPath: "/training/sections/epistles.svg",
    status: "Building",
  },
  {
    title: "Revelation & Apocalyptic",
    subtitle: "The end, the hope, and the new beginning",
    href: "/training",
    accentClass: "from-rose-200/22 via-pink-300/14 to-red-400/10",
    borderClass: "border-rose-200/16",
    glowClass: "shadow-[0_0_32px_rgba(251,113,133,0.10)]",
    artPath: "/training/sections/revelation.svg",
    status: "Building",
  },
] as const

function formatTierLabel(tier: "free" | "pro" | "pro_plus") {
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
      artPath: "/training/sections/pentateuch.svg",
      heroPanelPath: "/training/sections/exodus-track.svg",
    }
  }

  return {
    label: "Genesis Track",
    artPath: "/training/sections/pentateuch.svg",
    heroPanelPath: "/training/sections/genesis-track.svg",
  }
}

function getModeHint(tier: "free" | "pro" | "pro_plus") {
  if (tier === "pro_plus") return "Recall, image recognition, matching, and full drill depth"
  if (tier === "pro") return "Recall, fill blank, sequence, matching, and review drills"
  return "Careful reading, recall, and fast warmup reps"
}

function getAccessNote(tier: "free" | "pro" | "pro_plus") {
  if (tier === "pro_plus") return "Full arena access is live."
  if (tier === "pro") return "Core drills unlocked across the arena."
  return "Days 1-3 open as your free preview."
}

function getDayDescriptor(
  dayNumber: number,
  tier: "free" | "pro" | "pro_plus",
  trackLabel: string
) {
  if (tier === "free" && dayNumber <= 3) {
    return `A premium preview set through ${trackLabel.toLowerCase()} with fast warmup reps and careful reading.`
  }

  if (tier === "free" && dayNumber > 3) {
    return `A deeper ${trackLabel.toLowerCase()} lane waits here with richer drill formats and longer sets.`
  }

  if (tier === "pro_plus") {
    return `Full arena intensity across ${trackLabel.toLowerCase()} with image rounds, sequence drills, and deeper reps.`
  }

  return `Core ${trackLabel.toLowerCase()} training with recall, fill blank, sequence, and matching drills.`
}

function getEstimatedTime(
  itemCount: number,
  tier: "free" | "pro" | "pro_plus"
) {
  if (tier === "free") return `${Math.max(2, Math.ceil(itemCount / 3))}-${Math.max(4, Math.ceil(itemCount / 2))} min`
  if (tier === "pro") return `${Math.max(4, Math.ceil(itemCount / 3))}-${Math.max(6, Math.ceil(itemCount / 2))} min`
  return `${Math.max(5, Math.ceil(itemCount / 4))}-${Math.max(8, Math.ceil(itemCount / 2.5))} min`
}

function getDayStatus(dayNumber: number, tier: "free" | "pro" | "pro_plus"): HubStatus {
  const isPreviewDay = dayNumber <= 3
  const isLockedForFree = tier === "free" && dayNumber > 3

  if (isLockedForFree) {
    return {
      label: "Locked Preview",
      cardClass:
        "border-white/10 bg-[linear-gradient(180deg,rgba(24,28,38,0.88),rgba(10,13,20,0.95))] opacity-90",
      badgeClass:
        "border-amber-200/18 bg-amber-200/10 text-amber-100/86",
      buttonClass:
        "border border-white/12 bg-white/[0.06] text-white/86 hover:bg-white/[0.1]",
      buttonLabel: "View Access",
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

export default async function TrainingPage() {
  const [days, access] = await Promise.all([
    listTrainingDays(),
    getTrainingAccessState(),
  ])

  const firstDay = days[0] ?? null
  const todayDay =
    days.find((day) => access.tier !== "free" || day.day <= 3) ??
    firstDay
  const currentTrack = firstDay ? getTrackLabel(firstDay.segmentKey) : "Scripture"
  const currentTrackVisual = firstDay
    ? getTrackVisual(firstDay.segmentKey)
    : getTrackVisual("genesis-1-3")
  const previewLabel = days.length > 0 ? `Days 1-${Math.min(3, days.length)}` : "Days 1-3"

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#283a64_0%,_#121a2c_28%,_#070b14_100%)] px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.18),transparent_56%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-24 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-40 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom,rgba(22,163,74,0.08),transparent_58%)]" />

      <div className="relative mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.10),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(34,211,238,0.10),transparent_24%),linear-gradient(180deg,rgba(15,22,36,0.98),rgba(7,11,19,0.98))] shadow-[0_32px_100px_rgba(0,0,0,0.34)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.92]"
            style={{
              backgroundImage: "url('/training/hero/arena-hero-duo.svg')",
              backgroundPosition: "50% 52%",
              backgroundSize: "cover",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.42]"
            style={{
              backgroundImage: "url('/training/hero/arena-hero-overlay.svg')",
              backgroundPosition: "50% 50%",
              backgroundSize: "cover",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(90deg,rgba(5,8,14,0.80),rgba(5,8,14,0.34)_48%,rgba(5,8,14,0.70)_100%)]" />

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:p-7 xl:p-8">
            <div className="relative z-10 flex flex-col justify-between">
              <div>
                <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-100/84">
                  Training Arena
                </div>
                <h1 className="mt-4 max-w-xl text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
                  Build Scripture recall one rep at a time.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Daily drills for recall, recognition, sequencing, matching, and careful reading.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={todayDay ? `/training/day/${todayDay.day}/play` : "/training"}
                  className="inline-flex items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-[#2d1700] shadow-[0_16px_36px_rgba(251,191,36,0.18)] transition hover:scale-[1.01]"
                >
                  Start Today&apos;s Training
                </Link>
                <Link
                  href="#training-days"
                  className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                >
                  View Training Days
                </Link>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.65rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,20,0.42),rgba(8,12,20,0.70))] backdrop-blur-sm">
                <div className="grid gap-3 p-4 sm:grid-cols-[1.15fr_0.85fr] sm:p-5">
                  <div className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
                    <div
                      className="absolute inset-0 opacity-75"
                      style={{
                        backgroundImage: `url('${currentTrackVisual.heroPanelPath}')`,
                        backgroundPosition: "50% 42%",
                        backgroundSize: "cover",
                      }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,221,153,0.20),transparent_30%),linear-gradient(180deg,rgba(7,10,16,0.12),rgba(7,10,16,0.70))]" />
                    <div className="relative">
                      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/70">
                        Arena Atmosphere
                      </div>
                      <p className="mt-3 max-w-sm text-lg font-black tracking-[-0.03em] text-white">
                        Daily mission rhythm with sacred atmosphere and disciplined repetition.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                          Recognition
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                          Recall
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                          Sequence
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] border border-cyan-200/16 bg-[linear-gradient(180deg,rgba(10,16,28,0.92),rgba(8,11,20,0.96))] p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/74">
                        Track
                      </div>
                      <p className="mt-2 text-lg font-black text-white">{currentTrackVisual.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Structured day packs designed to keep your passage work moving with clarity.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-amber-200/16 bg-[linear-gradient(180deg,rgba(28,20,10,0.92),rgba(12,11,14,0.96))] p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/74">
                        Access Posture
                      </div>
                      <p className="mt-2 text-lg font-black text-white">{getAccessNote(access.tier)}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        The hub stays honest to your current access while still showing the arena ahead.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,22,0.54),rgba(8,11,18,0.76))] p-4 backdrop-blur-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-100/72">
                    Today&apos;s Training
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {todayDay ? `Day ${todayDay.day}` : "Training ready"}
                  </h2>
                </div>
                <div className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-50">
                  {formatTierLabel(access.tier)}
                </div>
              </div>

              <div className="mt-4 rounded-[1.35rem] border border-amber-200/14 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.10),transparent_42%),linear-gradient(180deg,rgba(33,23,10,0.88),rgba(12,11,13,0.92))] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.24),0_0_34px_rgba(251,191,36,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/62">
                      Main Action
                    </div>
                    <p className="mt-2 text-xl font-black text-white">
                      {todayDay?.reference ?? "No training packs found"}
                    </p>
                  </div>
                  {todayDay ? (
                    <div className="rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-50">
                      Ready
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200">
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/48">
                      Drill Count
                    </div>
                    <div className="mt-2 text-lg font-black text-white">
                      {todayDay?.itemCount ?? 0} prompts
                    </div>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/48">
                      Mode Hint
                    </div>
                    <div className="mt-2 text-sm font-semibold leading-5 text-white">
                      {getModeHint(access.tier)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1rem] border border-cyan-200/14 bg-[linear-gradient(180deg,rgba(8,14,22,0.72),rgba(8,12,18,0.88))] px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/68">
                    Focus Summary
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    {todayDay
                      ? `${todayDay.reference} is ready for a disciplined pass through recall, recognition, and careful reading.`
                      : "Training day data is not available yet."}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-slate-300">
                    {getAccessNote(access.tier)}
                  </p>
                  {todayDay ? (
                    <Link
                      href={`/training/day/${todayDay.day}/play`}
                      className="inline-flex items-center justify-center rounded-full bg-amber-200 px-4 py-2.5 text-sm font-black text-[#2d1700] shadow-[0_14px_30px_rgba(251,191,36,0.18)] transition hover:scale-[1.01]"
                    >
                      Start Day {todayDay.day}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,21,34,0.96),rgba(8,11,20,0.96))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Available Days
            </div>
            <div className="mt-2 text-2xl font-black text-white">{days.length}</div>
            <p className="mt-2 text-sm text-slate-300">Ready-to-load Training Arena day packs.</p>
          </article>
          <article className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,21,34,0.96),rgba(8,11,20,0.96))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Current Track
            </div>
            <div className="mt-2 text-2xl font-black text-white">{currentTrack}</div>
            <p className="mt-2 text-sm text-slate-300">Daily passage training anchored to the current reading track.</p>
          </article>
          <article className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,21,34,0.96),rgba(8,11,20,0.96))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Drill Types
            </div>
            <div className="mt-2 text-2xl font-black text-white">{DRILL_TYPE_COUNT}</div>
            <p className="mt-2 text-sm text-slate-300">Recall, fill blank, image, sequence, matching, and review reps.</p>
          </article>
          <article className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,21,34,0.96),rgba(8,11,20,0.96))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Access Window
            </div>
            <div className="mt-2 text-2xl font-black text-white">{access.tier === "free" ? previewLabel : formatTierLabel(access.tier)}</div>
            <p className="mt-2 text-sm text-slate-300">{getAccessNote(access.tier)}</p>
          </article>
        </section>

        <section className="mt-5 rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_30%),linear-gradient(180deg,rgba(12,19,31,0.97),rgba(8,11,20,0.97))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.24)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-100/72">
                Train By Bible Section
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">Step into the next section of Scripture</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                The arena is expanding beyond the opening books. Pentateuch is live now, with the rest of Scripture staged for the next training worlds.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {BIBLE_SECTIONS.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className={`group relative overflow-hidden rounded-[1.4rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 hover:-translate-y-1 ${section.borderClass} ${section.glowClass}`}
              >
                <div
                  className="absolute inset-0 opacity-[0.88]"
                  style={{
                    backgroundImage: `url('${section.artPath}')`,
                    backgroundPosition: "50% 42%",
                    backgroundSize: "cover",
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_34%),linear-gradient(180deg,rgba(7,10,16,0.16),rgba(7,10,16,0.78))]" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-lg text-white/92">✦</div>
                    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/78">
                      {section.status}
                    </div>
                  </div>
                  <div className="mt-4 text-lg font-black text-white">{section.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">{section.subtitle}</div>
                  <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${section.accentClass}`} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="training-days" className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-100/72">
                {currentTrack} Training Days
              </div>
              <h2 className="mt-2 text-3xl font-black text-white">Choose your next drill</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Compact mission cards keep the next rep close, while future days stay visible as the arena expands.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.05fr)]">
            {days.map((day, index) => {
              const status = getDayStatus(day.day, access.tier)
              const lockedForFree = access.tier === "free" && day.day > 3
              const dayTrack = getTrackLabel(day.segmentKey)
              const trackVisual = getTrackVisual(day.segmentKey)
              const descriptor = getDayDescriptor(day.day, access.tier, dayTrack)
              const estTime = getEstimatedTime(day.itemCount, access.tier)

              return (
                <article
                  key={day.day}
                  className={`group relative overflow-hidden rounded-[1.6rem] border p-4 shadow-[0_22px_60px_rgba(0,0,0,0.24)] transition duration-200 sm:p-5 ${status.cardClass} ${
                    index % 3 === 1 ? "xl:translate-y-4" : ""
                  } ${lockedForFree ? "" : "hover:-translate-y-1"}`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.82]"
                    style={{
                      backgroundImage: `url('${trackVisual.artPath}')`,
                      backgroundPosition: "50% 42%",
                      backgroundSize: "cover",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%),linear-gradient(180deg,rgba(8,11,18,0.12),rgba(8,11,18,0.66))]" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-100">
                        Day {day.day}
                      </div>
                      <div className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${status.badgeClass}`}>
                        {status.label}
                      </div>
                    </div>

                    <h3 className="mt-4 text-2xl font-black tracking-[-0.03em] text-white">
                      {day.reference}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62">
                      <span>{dayTrack} Track</span>
                      <span>{day.itemCount} prompts</span>
                      <span>{estTime}</span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {descriptor}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/48">
                        {lockedForFree ? "Upgrade for access" : "Ready to train"}
                      </div>
                      <Link
                        href={lockedForFree ? "/pricing" : `/training/day/${day.day}/play`}
                        className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${status.buttonClass}`}
                      >
                        {status.buttonLabel}
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}

            <aside
              id="pro-plus-arena"
              className="relative overflow-hidden rounded-[1.75rem] border border-cyan-200/16 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.12),transparent_24%),radial-gradient(circle_at_top_left,rgba(247,227,161,0.14),transparent_28%),linear-gradient(180deg,rgba(18,22,34,0.98),rgba(8,11,20,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] xl:row-span-2"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_32%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-100/82">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-100/20 bg-amber-100/10 text-[12px]">
                    ✧
                  </span>
                  <span>Pro+ Arena</span>
                </div>
                <h3 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
                  Unlock the full training experience.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                  Hard drills, image recognition, full daily sets, and mastery tracking.
                </p>

                <div className="mt-5 space-y-3">
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
                    className="inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-[#2d1700] shadow-[0_16px_36px_rgba(251,191,36,0.18)] transition hover:scale-[1.01]"
                  >
                    Go Pro+
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
