"use client"

import Image from "next/image"
import Link from "next/link"

type ExplorerCategoryTheme =
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
    edgeGlow: string
    ring: string
    progress: string
    sky: string
    haze: string
    floor: string
    badge: string
    statPanel: string
    artClass: string
    artPath: string
  }
> = {
  pentateuch: {
    shell: "bg-[#110b06]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(251,191,36,0.14),0_26px_65px_rgba(0,0,0,0.44),0_0_44px_rgba(245,158,11,0.18)]",
    ring: "border-amber-100/15",
    progress: "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400",
    sky: "bg-[linear-gradient(180deg,rgba(255,214,125,0.16),rgba(33,18,10,0.28)_42%,rgba(5,5,6,0.76))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(255,213,128,0.26),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(255,175,64,0.16),transparent_30%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(10,8,6,0.2)_44%,rgba(9,7,5,0.86))]",
    badge: "bg-amber-200/12 text-amber-50 border-amber-200/18",
    statPanel: "bg-[#120c07]/58 border-amber-100/10",
    artClass:
      "object-cover object-center scale-[1.04] brightness-[0.84] saturate-[1.08] contrast-[1.05] transition duration-700 group-hover:scale-[1.08]",
    artPath: "/explorer/pentateuch/region.png",
  },
  historical: {
    shell: "bg-[#081220]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(147,197,253,0.12),0_26px_65px_rgba(0,0,0,0.44),0_0_44px_rgba(96,165,250,0.16)]",
    ring: "border-blue-100/14",
    progress: "bg-gradient-to-r from-sky-200 via-blue-300 to-indigo-400",
    sky: "bg-[linear-gradient(180deg,rgba(118,168,255,0.14),rgba(18,34,74,0.28)_45%,rgba(6,9,16,0.8))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(148,195,255,0.22),transparent_34%),radial-gradient(circle_at_86%_16%,rgba(65,105,225,0.18),transparent_26%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(6,10,18,0.22)_44%,rgba(5,7,12,0.88))]",
    badge: "bg-blue-200/12 text-blue-50 border-blue-200/18",
    statPanel: "bg-[#08111d]/56 border-blue-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.82] saturate-[1.1] contrast-[1.08] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/historical/region.png",
  },
  wisdom: {
    shell: "bg-[#0d0b1a]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(196,181,253,0.12),0_26px_65px_rgba(0,0,0,0.44),0_0_44px_rgba(167,139,250,0.18)]",
    ring: "border-violet-100/14",
    progress: "bg-gradient-to-r from-fuchsia-200 via-violet-300 to-sky-300",
    sky: "bg-[linear-gradient(180deg,rgba(201,165,255,0.13),rgba(43,25,80,0.24)_42%,rgba(5,5,11,0.8))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(226,197,255,0.18),transparent_26%),radial-gradient(circle_at_58%_26%,rgba(117,74,255,0.18),transparent_30%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(7,6,14,0.26)_44%,rgba(6,5,11,0.9))]",
    badge: "bg-violet-200/12 text-violet-50 border-violet-200/18",
    statPanel: "bg-[#0d0a18]/58 border-violet-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.79] saturate-[1.12] contrast-[1.08] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/wisdom/region.png",
  },
  major_prophets: {
    shell: "bg-[#0d0915]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(232,121,249,0.1),0_26px_65px_rgba(0,0,0,0.46),0_0_44px_rgba(192,38,211,0.18)]",
    ring: "border-fuchsia-100/12",
    progress: "bg-gradient-to-r from-fuchsia-200 via-purple-300 to-violet-400",
    sky: "bg-[linear-gradient(180deg,rgba(190,110,255,0.12),rgba(70,15,95,0.26)_44%,rgba(5,4,10,0.82))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(210,86,255,0.16),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(255,145,80,0.16),transparent_24%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(8,6,13,0.24)_42%,rgba(7,5,12,0.9))]",
    badge: "bg-fuchsia-200/12 text-fuchsia-50 border-fuchsia-200/18",
    statPanel: "bg-[#0d0816]/58 border-fuchsia-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.75] saturate-[1.12] contrast-[1.1] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/major-prophets/region.png",
  },
  minor_prophets: {
    shell: "bg-[#071315]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(94,234,212,0.11),0_26px_65px_rgba(0,0,0,0.44),0_0_44px_rgba(45,212,191,0.16)]",
    ring: "border-teal-100/12",
    progress: "bg-gradient-to-r from-cyan-200 via-teal-300 to-emerald-400",
    sky: "bg-[linear-gradient(180deg,rgba(86,228,214,0.12),rgba(16,66,74,0.28)_44%,rgba(5,8,10,0.82))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(140,255,236,0.18),transparent_28%),radial-gradient(circle_at_22%_62%,rgba(28,170,154,0.16),transparent_28%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(5,8,10,0.22)_42%,rgba(4,7,8,0.9))]",
    badge: "bg-teal-200/12 text-teal-50 border-teal-200/18",
    statPanel: "bg-[#081315]/58 border-teal-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.78] saturate-[1.1] contrast-[1.08] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/minor-prophets/region.png",
  },
  gospels: {
    shell: "bg-[#120d07]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(253,224,71,0.12),0_26px_65px_rgba(0,0,0,0.44),0_0_44px_rgba(250,204,21,0.18)]",
    ring: "border-yellow-100/14",
    progress: "bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-300",
    sky: "bg-[linear-gradient(180deg,rgba(255,224,135,0.12),rgba(110,76,15,0.24)_42%,rgba(7,5,4,0.82))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(255,236,170,0.24),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(255,202,93,0.16),transparent_24%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(10,7,5,0.22)_42%,rgba(8,6,4,0.9))]",
    badge: "bg-yellow-200/12 text-yellow-50 border-yellow-200/18",
    statPanel: "bg-[#120c06]/58 border-yellow-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.83] saturate-[1.08] contrast-[1.06] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/gospels/region.png",
  },
  acts: {
    shell: "bg-[#120c08]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(251,146,60,0.11),0_26px_65px_rgba(0,0,0,0.44),0_0_44px_rgba(251,146,60,0.15)]",
    ring: "border-orange-100/12",
    progress: "bg-gradient-to-r from-orange-200 via-amber-300 to-orange-400",
    sky: "bg-[linear-gradient(180deg,rgba(255,176,92,0.12),rgba(78,43,17,0.26)_42%,rgba(7,6,5,0.82))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(255,177,112,0.18),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(65,118,212,0.14),transparent_28%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(8,6,4,0.22)_42%,rgba(7,5,4,0.9))]",
    badge: "bg-orange-200/12 text-orange-50 border-orange-200/18",
    statPanel: "bg-[#130d07]/58 border-orange-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.81] saturate-[1.1] contrast-[1.06] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/acts/region.png",
  },
  pauline_epistles: {
    shell: "bg-[#08101c]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(125,211,252,0.11),0_26px_65px_rgba(0,0,0,0.44),0_0_44px_rgba(56,189,248,0.14)]",
    ring: "border-sky-100/12",
    progress: "bg-gradient-to-r from-sky-200 via-blue-300 to-indigo-400",
    sky: "bg-[linear-gradient(180deg,rgba(120,188,255,0.12),rgba(23,58,109,0.24)_42%,rgba(5,7,12,0.84))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(173,216,255,0.18),transparent_28%),radial-gradient(circle_at_24%_26%,rgba(255,192,116,0.14),transparent_24%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(6,8,12,0.22)_42%,rgba(5,7,11,0.9))]",
    badge: "bg-sky-200/12 text-sky-50 border-sky-200/18",
    statPanel: "bg-[#08111c]/60 border-sky-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.79] saturate-[1.08] contrast-[1.08] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/pauline-epistles/region.png",
  },
  general_epistles: {
    shell: "bg-[#09111a]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(103,232,249,0.1),0_26px_65px_rgba(0,0,0,0.44),0_0_44px_rgba(103,232,249,0.15)]",
    ring: "border-cyan-100/12",
    progress: "bg-gradient-to-r from-cyan-200 via-sky-300 to-teal-400",
    sky: "bg-[linear-gradient(180deg,rgba(126,234,255,0.11),rgba(18,70,86,0.24)_42%,rgba(6,7,11,0.84))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(175,247,255,0.16),transparent_28%),radial-gradient(circle_at_82%_26%,rgba(69,141,187,0.16),transparent_26%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(6,7,11,0.22)_42%,rgba(5,6,10,0.9))]",
    badge: "bg-cyan-200/12 text-cyan-50 border-cyan-200/18",
    statPanel: "bg-[#09111a]/60 border-cyan-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.77] saturate-[1.08] contrast-[1.08] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/general-epistles/region.png",
  },
  apocalyptic: {
    shell: "bg-[#12090c]",
    edgeGlow:
      "shadow-[0_0_0_1px_rgba(251,113,133,0.11),0_26px_65px_rgba(0,0,0,0.46),0_0_44px_rgba(220,38,38,0.18)]",
    ring: "border-rose-100/12",
    progress: "bg-gradient-to-r from-rose-200 via-pink-300 to-red-400",
    sky: "bg-[linear-gradient(180deg,rgba(255,95,125,0.12),rgba(92,16,31,0.26)_42%,rgba(5,3,5,0.86))]",
    haze: "bg-[radial-gradient(circle_at_top,rgba(255,108,130,0.16),transparent_28%),radial-gradient(circle_at_52%_18%,rgba(255,216,168,0.14),transparent_20%)]",
    floor: "bg-[linear-gradient(180deg,transparent,rgba(6,3,5,0.24)_42%,rgba(5,3,5,0.92))]",
    badge: "bg-rose-200/12 text-rose-50 border-rose-200/18",
    statPanel: "bg-[#11080b]/60 border-rose-100/10",
    artClass:
      "object-cover object-center scale-[1.05] brightness-[0.72] saturate-[1.12] contrast-[1.1] transition duration-700 group-hover:scale-[1.09]",
    artPath: "/explorer/apocalyptic/region.png",
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
        className={`group relative isolate w-full overflow-hidden rounded-[2rem] border ${visual.ring} ${visual.edgeGlow} ${visual.shell} transition duration-300 hover:-translate-y-1 active:scale-[0.985]`}
      >
        <div className="absolute inset-0">
          <Image
            src={visual.artPath}
            alt=""
            fill
            aria-hidden="true"
            className={visual.artClass}
            sizes="(max-width: 768px) 100vw, 420px"
          />
        </div>
        <div className={`absolute inset-0 ${visual.sky}`} />
        <div className={`absolute inset-0 ${visual.haze}`} />
        <div className={`absolute inset-0 ${visual.floor}`} />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_22%,transparent_68%,rgba(255,255,255,0.04))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_28%)] opacity-80" />
        <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
        <div className="absolute inset-y-0 left-0 w-8 bg-[linear-gradient(90deg,rgba(255,255,255,0.08),transparent)] opacity-60" />
        <div className="absolute inset-y-0 right-0 w-10 bg-[linear-gradient(270deg,rgba(255,255,255,0.08),transparent)] opacity-45" />

        <div className="relative z-10 flex min-h-[17.5rem] flex-col justify-between p-5 sm:min-h-[18.5rem] sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${visual.badge}`}
              >
                {getStateLabel(state)}
              </div>

              <div
                className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/72 backdrop-blur-sm ${visual.statPanel}`}
              >
                {bookCount} Books
              </div>
            </div>

            <div className="mt-10 max-w-[15rem]">
              <div className="text-[10px] font-bold uppercase tracking-[0.34em] text-white/60">
                Sacred Region
              </div>
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
                <div
                  className={`rounded-2xl border px-3 py-2 backdrop-blur-sm ${visual.statPanel}`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/58">
                    Mastery
                  </div>
                  <div className="mt-1 text-base font-black text-white">
                    {masteryPercent}%
                  </div>
                </div>

                <div
                  className={`rounded-2xl border px-3 py-2 backdrop-blur-sm ${visual.statPanel}`}
                >
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

            <div className="h-3 overflow-hidden rounded-full bg-black/34 ring-1 ring-white/10 backdrop-blur-sm">
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
