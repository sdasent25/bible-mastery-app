"use client"

import Link from "next/link"

type ExplorerCategoryCardProps = {
  href: string
  title: string
  category: string
  subtitle: string
  bookCount: number
  progressPercent: number
  masteredSegments: number
  totalSegments: number
  accent: {
    glow: string
    border: string
    chip: string
    meter: string
    surface: string
    orb: string
  }
}

export default function ExplorerCategoryCard({
  href,
  title,
  category,
  subtitle,
  bookCount,
  progressPercent,
  masteredSegments,
  totalSegments,
  accent,
}: ExplorerCategoryCardProps) {
  return (
    <Link href={href} className="block">
      <article
        className={`group relative overflow-hidden rounded-[1.75rem] border ${accent.border} ${accent.surface} p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition duration-200 active:scale-[0.98]`}
      >
        <div
          className={`pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full blur-3xl opacity-70 ${accent.glow}`}
        />
        <div
          className={`pointer-events-none absolute -right-8 bottom-0 h-28 w-28 rounded-full blur-2xl opacity-40 ${accent.orb}`}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 ${accent.chip}`}
              >
                {category}
              </div>
              <h3 className="mt-4 text-2xl font-black text-white">
                {title}
              </h3>
              <p className="mt-2 max-w-[16rem] text-sm leading-6 text-slate-200">
                {subtitle}
              </p>
            </div>

            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-center shadow-inner shadow-black/20">
              <div>
                <div className="text-lg font-black text-white">
                  {progressPercent}%
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-300">
                  Clear
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-slate-200">
              {bookCount} books
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-slate-200">
              {masteredSegments} / {totalSegments} segments
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${accent.meter}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/85">
              Enter category
            </span>
            <span className="text-lg text-white transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
