'use client'

import Link from 'next/link'

const memoryModes = [
  {
    title: 'Review',
    description: 'Read, reveal, and rate your memory.',
    href: '/flashcards/review',
  },
  {
    title: 'Verse Match',
    description: 'Match references with the right verse.',
    href: '/games/matching',
  },
  {
    title: 'Hide Words',
    description: 'Fill in missing words as the verse disappears.',
    href: '/games/fill-in-the-blank',
  },
  {
    title: 'Build Verse',
    description: 'Put the verse back together in order.',
    href: '/games/build-the-verse',
  },
]

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,#0f172a_0%,#020617_56%,#000000_100%)] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Verse Memory
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Memory practice now lives inside Verse Memory.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
              Add your own Scripture, review what is due, and train through the core memory modes from one focused place.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/flashcards"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Open Verse Memory
            </Link>
            <Link
              href="/flashcards/create"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Add a Verse
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Core Modes
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Choose a memory workout
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {memoryModes.map((mode) => (
              <Link
                key={mode.title}
                href={mode.href}
                className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/28 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">{mode.title}</h3>
                  <span className="text-sm font-semibold text-amber-200 transition group-hover:text-amber-100">
                    Open
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {mode.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
