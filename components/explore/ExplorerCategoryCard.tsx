"use client"

import Link from "next/link"

type ExplorerCategoryTheme =
  | "pentateuch"
  | "historical"
  | "wisdom"
  | "major_prophets"
  | "minor_prophets"
  | "gospels"
  | "pauline_epistles"
  | "apocalyptic"

type ExplorerCategoryCardProps = {
  href: string
  title: string
  subtitle: string
  bookCount: number
  masteryPercent: number
  progressPercent: number
  state?: "open" | "locked" | "mastered"
  theme: ExplorerCategoryTheme
}

const THEME_STYLES: Record<
  ExplorerCategoryTheme,
  {
    shell: string
    glow: string
    ring: string
    progress: string
    veil: string
    art: string
    badge: string
    orb: string
  }
> = {
  pentateuch: {
    shell: "bg-[linear-gradient(180deg,rgba(53,34,10,0.98),rgba(17,11,7,0.98))]",
    glow: "bg-amber-300/20",
    ring: "border-amber-200/20 shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(245,158,11,0.15)]",
    progress: "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400",
    veil: "bg-gradient-to-t from-[#120b06] via-[#120b06]/72 to-transparent",
    art: "bg-[radial-gradient(circle_at_24%_18%,rgba(255,231,168,0.85),transparent_22%),radial-gradient(circle_at_82%_16%,rgba(255,202,87,0.38),transparent_24%),linear-gradient(135deg,rgba(88,56,14,0.18),rgba(255,214,102,0.12)),linear-gradient(180deg,#93631b_0%,#4a2e0a_50%,#17100c_100%)]",
    badge: "bg-amber-200/12 text-amber-100 border-amber-200/18",
    orb: "bg-amber-200/20",
  },
  historical: {
    shell: "bg-[linear-gradient(180deg,rgba(8,22,49,0.98),rgba(7,12,24,0.98))]",
    glow: "bg-blue-300/18",
    ring: "border-blue-200/18 shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(96,165,250,0.14)]",
    progress: "bg-gradient-to-r from-sky-200 via-blue-300 to-indigo-400",
    veil: "bg-gradient-to-t from-[#09101d] via-[#09101d]/74 to-transparent",
    art: "bg-[radial-gradient(circle_at_24%_20%,rgba(130,182,255,0.68),transparent_20%),radial-gradient(circle_at_74%_24%,rgba(116,157,255,0.28),transparent_24%),linear-gradient(135deg,rgba(17,38,87,0.22),rgba(69,102,173,0.1)),linear-gradient(180deg,#163562_0%,#102345_45%,#090f19_100%)]",
    badge: "bg-blue-200/12 text-blue-100 border-blue-200/18",
    orb: "bg-blue-200/18",
  },
  wisdom: {
    shell: "bg-[linear-gradient(180deg,rgba(28,16,56,0.98),rgba(11,9,25,0.98))]",
    glow: "bg-violet-300/18",
    ring: "border-violet-200/18 shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(167,139,250,0.16)]",
    progress: "bg-gradient-to-r from-fuchsia-200 via-violet-300 to-sky-300",
    veil: "bg-gradient-to-t from-[#0f0b18] via-[#0f0b18]/72 to-transparent",
    art: "bg-[radial-gradient(circle_at_28%_16%,rgba(221,190,255,0.65),transparent_18%),radial-gradient(circle_at_76%_18%,rgba(145,184,255,0.2),transparent_22%),linear-gradient(135deg,rgba(68,42,138,0.22),rgba(116,77,210,0.1)),linear-gradient(180deg,#40216f_0%,#22123f_52%,#0d0a18_100%)]",
    badge: "bg-violet-200/12 text-violet-100 border-violet-200/18",
    orb: "bg-violet-200/18",
  },
  major_prophets: {
    shell: "bg-[linear-gradient(180deg,rgba(38,13,57,0.98),rgba(12,8,22,0.98))]",
    glow: "bg-fuchsia-400/18",
    ring: "border-fuchsia-200/16 shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(232,121,249,0.16)]",
    progress: "bg-gradient-to-r from-fuchsia-200 via-purple-300 to-violet-400",
    veil: "bg-gradient-to-t from-[#100915] via-[#100915]/76 to-transparent",
    art: "bg-[radial-gradient(circle_at_18%_16%,rgba(255,176,240,0.64),transparent_20%),radial-gradient(circle_at_78%_22%,rgba(194,124,255,0.28),transparent_24%),linear-gradient(135deg,rgba(100,29,129,0.24),rgba(157,78,221,0.1)),linear-gradient(180deg,#5f1d72_0%,#31113f_50%,#0d0917_100%)]",
    badge: "bg-fuchsia-200/12 text-fuchsia-100 border-fuchsia-200/18",
    orb: "bg-fuchsia-200/18",
  },
  minor_prophets: {
    shell: "bg-[linear-gradient(180deg,rgba(8,44,49,0.98),rgba(7,13,17,0.98))]",
    glow: "bg-teal-300/18",
    ring: "border-teal-200/16 shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(45,212,191,0.14)]",
    progress: "bg-gradient-to-r from-cyan-200 via-teal-300 to-emerald-400",
    veil: "bg-gradient-to-t from-[#081315] via-[#081315]/76 to-transparent",
    art: "bg-[radial-gradient(circle_at_24%_18%,rgba(127,255,234,0.54),transparent_18%),radial-gradient(circle_at_82%_20%,rgba(91,214,201,0.22),transparent_24%),linear-gradient(135deg,rgba(18,104,112,0.22),rgba(44,163,167,0.1)),linear-gradient(180deg,#10616b_0%,#0c3940_50%,#081214_100%)]",
    badge: "bg-teal-200/12 text-teal-100 border-teal-200/18",
    orb: "bg-teal-200/18",
  },
  gospels: {
    shell: "bg-[linear-gradient(180deg,rgba(57,39,7,0.98),rgba(18,13,8,0.98))]",
    glow: "bg-yellow-300/20",
    ring: "border-yellow-200/18 shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(250,204,21,0.16)]",
    progress: "bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-300",
    veil: "bg-gradient-to-t from-[#120d07] via-[#120d07]/72 to-transparent",
    art: "bg-[radial-gradient(circle_at_30%_16%,rgba(255,242,162,0.84),transparent_19%),radial-gradient(circle_at_80%_20%,rgba(255,215,89,0.28),transparent_22%),linear-gradient(135deg,rgba(122,84,17,0.24),rgba(255,225,128,0.1)),linear-gradient(180deg,#8c6715_0%,#4d3510_48%,#17100c_100%)]",
    badge: "bg-yellow-200/12 text-yellow-100 border-yellow-200/18",
    orb: "bg-yellow-200/18",
  },
  pauline_epistles: {
    shell: "bg-[linear-gradient(180deg,rgba(10,26,58,0.98),rgba(8,12,23,0.98))]",
    glow: "bg-sky-300/18",
    ring: "border-sky-200/16 shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(56,189,248,0.14)]",
    progress: "bg-gradient-to-r from-sky-200 via-blue-300 to-indigo-400",
    veil: "bg-gradient-to-t from-[#08101d] via-[#08101d]/75 to-transparent",
    art: "bg-[radial-gradient(circle_at_28%_16%,rgba(173,218,255,0.68),transparent_18%),radial-gradient(circle_at_82%_20%,rgba(90,164,255,0.22),transparent_24%),linear-gradient(135deg,rgba(26,67,148,0.24),rgba(82,126,220,0.1)),linear-gradient(180deg,#18407e_0%,#112654_50%,#090f19_100%)]",
    badge: "bg-sky-200/12 text-sky-100 border-sky-200/18",
    orb: "bg-sky-200/18",
  },
  apocalyptic: {
    shell: "bg-[linear-gradient(180deg,rgba(52,10,18,0.98),rgba(17,8,12,0.98))]",
    glow: "bg-rose-400/18",
    ring: "border-rose-200/16 shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(251,113,133,0.15)]",
    progress: "bg-gradient-to-r from-rose-200 via-pink-300 to-red-400",
    veil: "bg-gradient-to-t from-[#12090c] via-[#12090c]/76 to-transparent",
    art: "bg-[radial-gradient(circle_at_22%_16%,rgba(255,171,190,0.64),transparent_18%),radial-gradient(circle_at_78%_22%,rgba(255,88,122,0.2),transparent_24%),linear-gradient(135deg,rgba(138,22,45,0.24),rgba(219,72,110,0.1)),linear-gradient(180deg,#7a1931_0%,#451220_50%,#12090d_100%)]",
    badge: "bg-rose-200/12 text-rose-100 border-rose-200/18",
    orb: "bg-rose-200/18",
  },
}

function getStateLabel(state: ExplorerCategoryCardProps["state"]) {
  if (state === "locked") return "Locked"
  if (state === "mastered") return "Mastered"
  return "Open"
}

export default function ExplorerCategoryCard({
  href,
  title,
  subtitle,
  bookCount,
  masteryPercent,
  progressPercent,
  state = "open",
  theme,
}: ExplorerCategoryCardProps) {
  const visual = THEME_STYLES[theme]

  return (
    <Link href={href} className="block">
      <article
        className={`group relative isolate w-full overflow-hidden rounded-[2rem] border ${visual.ring} ${visual.shell} transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(0,0,0,0.45)] active:scale-[0.985]`}
      >
        <div className={`absolute inset-0 ${visual.art}`} />
        <div className={`absolute inset-0 ${visual.veil}`} />
        <div className={`absolute -left-8 top-0 h-24 w-40 rounded-full blur-3xl ${visual.glow}`} />
        <div className={`absolute -right-6 bottom-10 h-24 w-24 rounded-full blur-3xl ${visual.orb}`} />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_28%,transparent_70%,rgba(255,255,255,0.05))]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/8 to-transparent opacity-60" />

        <div className="relative z-10 flex min-h-[17.5rem] flex-col justify-between p-5 sm:min-h-[18.5rem] sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${visual.badge}`}>
                {getStateLabel(state)}
              </div>

              <div className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                {bookCount} Books
              </div>
            </div>

            <div className="mt-10 max-w-[15rem]">
              <h3 className="text-[2rem] font-black leading-[0.95] tracking-[-0.03em] text-white sm:text-[2.2rem]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-200/92 sm:text-[15px]">
                {subtitle}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div className="flex gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/22 px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/58">
                    Mastery
                  </div>
                  <div className="mt-1 text-base font-black text-white">
                    {masteryPercent}%
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/22 px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/58">
                    Region
                  </div>
                  <div className="mt-1 text-base font-black text-white">
                    {progressPercent}%
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/58">
                  Progress
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  {progressPercent}%
                </div>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-black/28 ring-1 ring-white/10">
              <div
                className={`h-full rounded-full shadow-[0_0_18px_rgba(255,255,255,0.22)] transition-all duration-500 ${visual.progress}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
