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
    progress: string
    veil: string
    light: string
    artClass: string
    artPath: string
  }
> = {
  pentateuch: {
    shell: "bg-[#110b06]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.26),0_0_24px_rgba(245,158,11,0.08)]",
    progress: "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400",
    veil: "bg-[linear-gradient(180deg,rgba(18,10,4,0.00),rgba(18,10,4,0.02)_28%,rgba(10,7,4,0.08)_62%,rgba(8,6,4,0.34))]",
    light: "bg-[radial-gradient(circle_at_50%_14%,rgba(255,226,153,0.20),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(255,187,69,0.06),transparent_34%)]",
    artClass:
      "object-cover object-[center_42%] scale-[1.02] brightness-[1.03] saturate-[1.06] contrast-[1.05] transition duration-700 group-hover:scale-[1.05]",
    artPath: "/explorer/pentateuch/region.png",
  },
  historical: {
    shell: "bg-[#081220]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.26),0_0_24px_rgba(96,165,250,0.08)]",
    progress: "bg-gradient-to-r from-sky-200 via-blue-300 to-indigo-400",
    veil: "bg-[linear-gradient(180deg,rgba(7,15,30,0.00),rgba(7,15,30,0.02)_26%,rgba(6,11,22,0.08)_60%,rgba(5,8,16,0.34))]",
    light: "bg-[radial-gradient(circle_at_54%_16%,rgba(165,204,255,0.16),transparent_28%),radial-gradient(circle_at_86%_22%,rgba(95,146,255,0.07),transparent_24%)]",
    artClass:
      "object-cover object-[center_44%] scale-[1.02] brightness-[1.01] saturate-[1.08] contrast-[1.07] transition duration-700 group-hover:scale-[1.05]",
    artPath: "/explorer/historical/region.png",
  },
  wisdom: {
    shell: "bg-[#0d0b1a]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.26),0_0_24px_rgba(167,139,250,0.08)]",
    progress: "bg-gradient-to-r from-fuchsia-200 via-violet-300 to-sky-300",
    veil: "bg-[linear-gradient(180deg,rgba(8,8,16,0.00),rgba(8,8,16,0.02)_22%,rgba(8,8,16,0.06)_54%,rgba(6,5,11,0.30))]",
    light: "bg-[radial-gradient(circle_at_50%_12%,rgba(216,204,255,0.18),transparent_26%),radial-gradient(circle_at_52%_30%,rgba(128,93,255,0.06),transparent_26%)]",
    artClass:
      "object-cover object-[center_34%] scale-[1.01] brightness-[1.02] saturate-[1.04] contrast-[1.04] transition duration-700 group-hover:scale-[1.04]",
    artPath: "/explorer/wisdom/region.png",
  },
  major_prophets: {
    shell: "bg-[#0d0915]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.28),0_0_24px_rgba(192,38,211,0.08)]",
    progress: "bg-gradient-to-r from-fuchsia-200 via-purple-300 to-violet-400",
    veil: "bg-[linear-gradient(180deg,rgba(10,7,18,0.01),rgba(10,7,18,0.03)_24%,rgba(10,7,18,0.10)_58%,rgba(7,5,12,0.40))]",
    light: "bg-[radial-gradient(circle_at_50%_16%,rgba(206,120,255,0.10),transparent_24%),radial-gradient(circle_at_78%_22%,rgba(255,163,102,0.06),transparent_22%)]",
    artClass:
      "object-cover object-[center_42%] scale-[1.02] brightness-[0.99] saturate-[1.08] contrast-[1.08] transition duration-700 group-hover:scale-[1.05]",
    artPath: "/explorer/major-prophets/region.png",
  },
  minor_prophets: {
    shell: "bg-[#071315]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.26),0_0_24px_rgba(45,212,191,0.08)]",
    progress: "bg-gradient-to-r from-cyan-200 via-teal-300 to-emerald-400",
    veil: "bg-[linear-gradient(180deg,rgba(5,12,13,0.00),rgba(5,12,13,0.02)_24%,rgba(5,12,13,0.08)_58%,rgba(4,7,8,0.34))]",
    light: "bg-[radial-gradient(circle_at_52%_18%,rgba(145,255,237,0.12),transparent_24%),radial-gradient(circle_at_20%_60%,rgba(62,194,178,0.06),transparent_24%)]",
    artClass:
      "object-cover object-[center_46%] scale-[1.02] brightness-[1.02] saturate-[1.06] contrast-[1.04] transition duration-700 group-hover:scale-[1.05]",
    artPath: "/explorer/minor-prophets/region.png",
  },
  gospels: {
    shell: "bg-[#120d07]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.26),0_0_24px_rgba(250,204,21,0.08)]",
    progress: "bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-300",
    veil: "bg-[linear-gradient(180deg,rgba(16,12,5,0.00),rgba(16,12,5,0.01)_22%,rgba(10,8,4,0.08)_56%,rgba(8,6,4,0.32))]",
    light: "bg-[radial-gradient(circle_at_48%_16%,rgba(255,236,176,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,212,97,0.06),transparent_20%)]",
    artClass:
      "object-cover object-[center_42%] scale-[1.02] brightness-[1.04] saturate-[1.05] contrast-[1.04] transition duration-700 group-hover:scale-[1.05]",
    artPath: "/explorer/gospels/region.png",
  },
  acts: {
    shell: "bg-[#120c08]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.26),0_0_24px_rgba(251,146,60,0.08)]",
    progress: "bg-gradient-to-r from-orange-200 via-amber-300 to-orange-400",
    veil: "bg-[linear-gradient(180deg,rgba(14,9,4,0.00),rgba(14,9,4,0.02)_24%,rgba(8,6,4,0.08)_58%,rgba(7,5,4,0.34))]",
    light: "bg-[radial-gradient(circle_at_50%_18%,rgba(255,180,112,0.12),transparent_26%),radial-gradient(circle_at_80%_24%,rgba(95,145,234,0.06),transparent_24%)]",
    artClass:
      "object-cover object-[center_46%] scale-[1.02] brightness-[1.01] saturate-[1.06] contrast-[1.04] transition duration-700 group-hover:scale-[1.05]",
    artPath: "/explorer/acts/region.png",
  },
  pauline_epistles: {
    shell: "bg-[#08101c]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.26),0_0_24px_rgba(56,189,248,0.08)]",
    progress: "bg-gradient-to-r from-sky-200 via-blue-300 to-indigo-400",
    veil: "bg-[linear-gradient(180deg,rgba(6,11,20,0.00),rgba(6,11,20,0.02)_24%,rgba(6,9,14,0.08)_58%,rgba(5,7,11,0.36))]",
    light: "bg-[radial-gradient(circle_at_54%_14%,rgba(167,219,255,0.14),transparent_26%),radial-gradient(circle_at_24%_26%,rgba(255,199,122,0.06),transparent_22%)]",
    artClass:
      "object-cover object-[center_42%] scale-[1.02] brightness-[1.00] saturate-[1.06] contrast-[1.05] transition duration-700 group-hover:scale-[1.05]",
    artPath: "/explorer/pauline-epistles/region.png",
  },
  general_epistles: {
    shell: "bg-[#09111a]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.26),0_0_24px_rgba(103,232,249,0.08)]",
    progress: "bg-gradient-to-r from-cyan-200 via-sky-300 to-teal-400",
    veil: "bg-[linear-gradient(180deg,rgba(7,11,16,0.00),rgba(7,11,16,0.02)_24%,rgba(6,8,12,0.08)_58%,rgba(5,6,10,0.36))]",
    light: "bg-[radial-gradient(circle_at_54%_14%,rgba(184,243,255,0.12),transparent_26%),radial-gradient(circle_at_82%_26%,rgba(80,156,205,0.06),transparent_24%)]",
    artClass:
      "object-cover object-[center_40%] scale-[1.02] brightness-[1.00] saturate-[1.04] contrast-[1.05] transition duration-700 group-hover:scale-[1.05]",
    artPath: "/explorer/general-epistles/region.png",
  },
  apocalyptic: {
    shell: "bg-[#12090c]",
    edgeGlow:
      "shadow-[0_22px_54px_rgba(0,0,0,0.30),0_0_24px_rgba(220,38,38,0.10)]",
    progress: "bg-gradient-to-r from-rose-200 via-pink-300 to-red-400",
    veil: "bg-[linear-gradient(180deg,rgba(11,4,7,0.01),rgba(11,4,7,0.03)_24%,rgba(7,3,5,0.10)_58%,rgba(5,3,5,0.42))]",
    light: "bg-[radial-gradient(circle_at_52%_12%,rgba(255,133,150,0.12),transparent_24%),radial-gradient(circle_at_52%_20%,rgba(255,220,172,0.06),transparent_20%)]",
    artClass:
      "object-cover object-[center_38%] scale-[1.02] brightness-[0.99] saturate-[1.08] contrast-[1.08] transition duration-700 group-hover:scale-[1.05]",
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
        className={`group relative isolate w-full overflow-hidden rounded-[2rem] ${visual.edgeGlow} ${visual.shell} transition duration-300 hover:-translate-y-1 active:scale-[0.985]`}
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
        <div className={`absolute inset-0 ${visual.light}`} />
        <div className={`absolute inset-0 ${visual.veil}`} />

        <div className="relative z-10 flex min-h-[17.5rem] flex-col justify-between p-5 sm:min-h-[18.5rem] sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/68 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]"
              >
                {getStateLabel(state)}
              </div>

              <div className="text-right text-[11px] font-medium uppercase tracking-[0.2em] text-white/72 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                {bookCount} Books
              </div>
            </div>

            <div className="mt-10 max-w-[15rem]">
              <div className="text-[10px] font-bold uppercase tracking-[0.34em] text-white/50 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                Sacred Region
              </div>
              <h3 className="text-[2rem] font-black leading-[0.95] tracking-[-0.03em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.42)] sm:text-[2.2rem]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-100/78 drop-shadow-[0_2px_14px_rgba(0,0,0,0.38)] sm:text-[15px]">
                {subtitle}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4 text-white/62 drop-shadow-[0_1px_10px_rgba(0,0,0,0.38)]">
              <div className="text-[12px] font-medium tracking-[0.04em]">
                {masteryPercent}% Mastered
              </div>
              <div className="text-right text-[12px] font-medium tracking-[0.04em]">
                {progressPercent}% Region
              </div>
            </div>

            <div className="h-[4px] overflow-hidden rounded-full bg-black/12">
              <div
                className={`h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.14)] transition-all duration-500 ${visual.progress}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
