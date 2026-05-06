"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

import { nodes } from "@/lib/nodes"
import { createClient } from "@/lib/supabase/client"

type MasteryRow = {
  segment: string
  mastered: boolean
}

type PentateuchBookKey =
  | "Genesis"
  | "Exodus"
  | "Leviticus"
  | "Numbers"
  | "Deuteronomy"

type BookPresentation = {
  key: PentateuchBookKey
  title: string
  subtitle: string
  artSrc: string
  accent: string
  glow: string
  objectPosition: string
}

const PENTATEUCH_ORDER: PentateuchBookKey[] = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
]

const BOOK_PRESENTATION: Record<PentateuchBookKey, BookPresentation> = {
  Genesis: {
    key: "Genesis",
    title: "Genesis",
    subtitle: "Creation, covenant, fall, flood, promise, and the beginnings of every story.",
    artSrc: "/icons/genesis/creation.png",
    accent: "from-amber-100 via-yellow-200 to-orange-300",
    glow: "shadow-[0_0_36px_rgba(251,191,36,0.18)]",
    objectPosition: "50% 42%",
  },
  Exodus: {
    key: "Exodus",
    title: "Exodus",
    subtitle: "Deliverance, wilderness fire, law, and the God who leads His people out.",
    artSrc: "/icons/exodus/burning-bush.png",
    accent: "from-orange-100 via-amber-200 to-red-300",
    glow: "shadow-[0_0_34px_rgba(251,146,60,0.18)]",
    objectPosition: "50% 48%",
  },
  Leviticus: {
    key: "Leviticus",
    title: "Leviticus",
    subtitle: "Holiness, priesthood, offerings, and the sacred order of drawing near.",
    artSrc: "/explorer/pentateuch/region.png",
    accent: "from-stone-100 via-amber-200 to-yellow-300",
    glow: "shadow-[0_0_34px_rgba(245,158,11,0.14)]",
    objectPosition: "50% 56%",
  },
  Numbers: {
    key: "Numbers",
    title: "Numbers",
    subtitle: "Campfires, census, rebellion, wandering, and the testing of a generation.",
    artSrc: "/explorer/pentateuch/region.png",
    accent: "from-cyan-100 via-sky-200 to-amber-200",
    glow: "shadow-[0_0_34px_rgba(56,189,248,0.12)]",
    objectPosition: "50% 50%",
  },
  Deuteronomy: {
    key: "Deuteronomy",
    title: "Deuteronomy",
    subtitle: "Final speeches on the edge of promise, memory, covenant, and inheritance.",
    artSrc: "/explorer/pentateuch/region.png",
    accent: "from-yellow-100 via-amber-200 to-lime-200",
    glow: "shadow-[0_0_34px_rgba(250,204,21,0.14)]",
    objectPosition: "50% 38%",
  },
}

function normalizeSegmentId(id: string) {
  return id.replaceAll("_", "-")
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function formatCategory(category: string) {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default function ExploreCategoryPage() {
  const params = useParams<{ category: string }>()
  const category = params?.category ?? ""
  const supabase = createClient()
  const [mastery, setMastery] = useState<MasteryRow[]>([])
  const [loading, setLoading] = useState(category === "pentateuch")

  useEffect(() => {
    if (category !== "pentateuch") return

    let active = true

    async function loadMastery() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!active) return
          setMastery([])
          return
        }

        const { data } = await supabase
          .from("user_segment_mastery")
          .select("segment, mastered")
          .eq("user_id", user.id)

        if (!active) return
        setMastery((data || []) as MasteryRow[])
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadMastery()

    return () => {
      active = false
    }
  }, [category, supabase])

  const pentateuchProgress = useMemo(() => {
    const masteredSet = new Set(
      mastery.filter((row) => row.mastered).map((row) => normalizeSegmentId(row.segment))
    )

    const books = PENTATEUCH_ORDER.map((bookKey) => {
      const segments = nodes.filter((node) => node.book === bookKey)
      const masteredCount = segments.filter((node) =>
        masteredSet.has(normalizeSegmentId(node.id))
      ).length
      const progressPercent =
        segments.length > 0 ? (masteredCount / segments.length) * 100 : 0

      return {
        ...BOOK_PRESENTATION[bookKey],
        segmentCount: segments.length,
        masteredCount,
        progressPercent,
        completed: segments.length > 0 && masteredCount === segments.length,
      }
    })

    const totalSegments = books.reduce((sum, book) => sum + book.segmentCount, 0)
    const totalMastered = books.reduce((sum, book) => sum + book.masteredCount, 0)
    const overallPercent = totalSegments > 0 ? (totalMastered / totalSegments) * 100 : 0

    return {
      books,
      totalSegments,
      totalMastered,
      overallPercent,
      genesis: books[0],
      supporting: books.slice(1),
    }
  }, [mastery])

  if (category !== "pentateuch") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#10203f_0%,_#080d1b_38%,_#04060d_100%)] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/explore"
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
          >
            ← Back to Explorer
          </Link>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,39,0.98),rgba(7,10,18,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200/80">
              Category
            </div>
            <h1 className="mt-3 text-4xl font-black text-white">
              {formatCategory(category)}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              This region is staged for the next world-building phase. Pentateuch is the
              first fully immersive category world now live.
            </p>
          </section>
        </div>
      </main>
    )
  }

  const heroBook = pentateuchProgress.genesis

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#3a2a0a_0%,_#120d08_38%,_#060507_100%)] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,214,125,0.22),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-44 h-48 w-48 rounded-full bg-amber-300/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-[28rem] h-60 w-60 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/explore"
          className="inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-100 backdrop-blur-sm"
        >
          ← Back to Explorer
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[2.25rem] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <div className="absolute inset-0">
            <Image
              src="/explorer/pentateuch/region.png"
              alt=""
              fill
              priority
              className="object-cover object-[50%_42%] brightness-[1.04] saturate-[1.08]"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,228,163,0.24),transparent_30%),linear-gradient(180deg,rgba(21,12,4,0.00),rgba(21,12,4,0.08)_36%,rgba(8,6,4,0.52))]" />

          <div className="relative z-10 flex min-h-[28rem] flex-col justify-between px-5 py-6 sm:min-h-[34rem] sm:px-7 sm:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/70">
                Pentateuch Region
              </div>
              <div className="text-right text-[11px] font-medium uppercase tracking-[0.24em] text-amber-50/70">
                {formatPercent(pentateuchProgress.overallPercent)} Awakened
              </div>
            </div>

            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/70 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                The Foundations of Everything
              </p>
              <h1 className="mt-4 text-4xl font-black leading-[0.94] tracking-[-0.04em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-6xl">
                Pentateuch
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-amber-50/82 drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:text-lg">
                Enter the beginnings of Scripture through sacred wilderness, covenant fire,
                creation light, and the first great movements of God among His people.
              </p>
            </div>

            <div className="grid max-w-3xl grid-cols-3 gap-3 rounded-[1.75rem] border border-white/10 bg-black/18 p-4 backdrop-blur-sm">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Books
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  5
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Segments
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {pentateuchProgress.totalMastered}/{pentateuchProgress.totalSegments}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Region
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {formatPercent(pentateuchProgress.overallPercent)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 sm:mt-18">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
              Hero Campaign
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              The journey begins here
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Genesis stands at the front of the region as the opening campaign of origins,
              fall, flood, promise, and the first covenant horizon.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2.25rem] border border-amber-100/10 bg-[#0f0a06] shadow-[0_26px_80px_rgba(0,0,0,0.34)]">
            <div className="absolute inset-0">
              <Image
                src={heroBook.artSrc}
                alt=""
                fill
                className="object-cover brightness-[1.05] saturate-[1.08]"
                style={{ objectPosition: heroBook.objectPosition }}
                sizes="100vw"
              />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,226,153,0.20),transparent_28%),linear-gradient(180deg,rgba(18,12,4,0.04),rgba(18,12,4,0.10)_40%,rgba(8,6,4,0.56))]" />

            <div className="relative z-10 grid gap-8 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-50/72">
                    Campaign I
                  </div>
                  <h3 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white drop-shadow-[0_5px_20px_rgba(0,0,0,0.45)] sm:text-5xl">
                    {heroBook.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-100/84 sm:text-lg">
                    {heroBook.subtitle}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-amber-50/76">
                  <div>{heroBook.segmentCount} segments</div>
                  <div>{heroBook.masteredCount} cleared</div>
                  <div>{heroBook.completed ? "Completed" : "In Progress"}</div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-black/22 p-5 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/62">
                  Campaign Progress
                </div>
                <div className="mt-4 text-5xl font-black text-white">
                  {formatPercent(heroBook.progressPercent)}
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  {heroBook.completed
                    ? "Genesis has been fully mastered."
                    : `${heroBook.masteredCount} of ${heroBook.segmentCount} Genesis segments completed.`}
                </div>
                <div className="mt-6 h-[6px] overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${heroBook.accent} ${heroBook.glow}`}
                    style={{ width: `${heroBook.progressPercent}%` }}
                  />
                </div>
                <div className="mt-6">
                  <Link
                    href="/explore/book/genesis"
                    className="inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
                  >
                    Enter Campaign →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="mb-7">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
              Supporting Books
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              The wilderness beyond Genesis
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Exodus, Leviticus, Numbers, and Deuteronomy extend the region into law,
              wilderness formation, covenant memory, and the edge of promise.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pentateuchProgress.supporting.map((book, index) => (
              <article
                key={book.key}
                className={`group relative overflow-hidden rounded-[1.9rem] border border-white/8 bg-[#0d0a08] shadow-[0_20px_56px_rgba(0,0,0,0.28)] ${index % 2 === 1 ? "md:translate-y-8" : ""}`}
              >
                <div className="absolute inset-0">
                  <Image
                    src={book.artSrc}
                    alt=""
                    fill
                    className="object-cover brightness-[1.02] saturate-[1.04] transition duration-700 group-hover:scale-[1.04]"
                    style={{ objectPosition: book.objectPosition }}
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,226,153,0.12),transparent_28%),linear-gradient(180deg,rgba(10,8,4,0.00),rgba(10,8,4,0.08)_46%,rgba(6,5,4,0.54))]" />

                <div className="relative z-10 flex min-h-[19rem] flex-col justify-between p-5">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/66">
                      Campaign
                    </div>
                    <h3 className="mt-3 text-2xl font-black text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.38)]">
                      {book.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-100/78">
                      {book.subtitle}
                    </p>
                  </div>

                  <div>
                    <div className="mb-3 flex items-end justify-between text-[12px] text-white/64">
                      <span>{book.segmentCount} segments</span>
                      <span>{formatPercent(book.progressPercent)}</span>
                    </div>
                    <div className="h-[4px] overflow-hidden rounded-full bg-black/12">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${book.accent} ${book.glow}`}
                        style={{ width: `${book.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {loading && (
          <div className="mt-8 text-sm text-slate-300">
            Loading Pentateuch progress...
          </div>
        )}
      </div>
    </main>
  )
}
