"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import ExplorerCategoryCard from "@/components/explore/ExplorerCategoryCard"
import { nodes } from "@/lib/nodes"
import { createClient } from "@/lib/supabase/client"

type BookRow = {
  id: string
  book: string
  book_order: number
  testament: string | null
  category: string | null
  theme: string | null
}

type MasteryRow = {
  segment: string
  mastered: boolean
}

type CategoryKey =
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

const CATEGORY_META: Record<
  CategoryKey,
  {
    title: string
    subtitle: string
    theme:
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
  }
> = {
  pentateuch: {
    title: "Pentateuch",
    subtitle: "Creation light, wilderness, covenant fire, and the first sacred paths.",
    theme: "pentateuch",
  },
  historical: {
    title: "Historical",
    subtitle: "Fortress cities, royal thrones, conquest, exile, and return.",
    theme: "historical",
  },
  wisdom: {
    title: "Wisdom",
    subtitle: "Star-soaked stillness, poetic depth, and divine understanding.",
    theme: "wisdom",
  },
  major_prophets: {
    title: "Major Prophets",
    subtitle: "Visions, warning, and thunder from the watchmen.",
    theme: "major_prophets",
  },
  minor_prophets: {
    title: "Minor Prophets",
    subtitle: "Hidden voices crossing mist, roads, and ancient thresholds.",
    theme: "minor_prophets",
  },
  gospels: {
    title: "Gospels",
    subtitle: "Radiant hope, holy nearness, and the light of divine life.",
    theme: "gospels",
  },
  acts: {
    title: "Acts",
    subtitle: "Harbors, roads, wind, and fire as the mission moves outward.",
    theme: "acts",
  },
  pauline_epistles: {
    title: "Pauline Epistles",
    subtitle: "Candlelit counsel, disciplined thought, and letters forged in motion.",
    theme: "pauline_epistles",
  },
  general_epistles: {
    title: "General Epistles",
    subtitle: "Steady watchfires for endurance, holiness, love, and truth.",
    theme: "general_epistles",
  },
  apocalyptic: {
    title: "Apocalyptic",
    subtitle: "The veil lifts with cosmic storm, judgment, victory, and restoration.",
    theme: "apocalyptic",
  },
}

const EXPLORER_CATEGORIES: CategoryKey[] = [
  "pentateuch",
  "historical",
  "wisdom",
  "major_prophets",
  "minor_prophets",
  "gospels",
  "acts",
  "pauline_epistles",
  "general_epistles",
  "apocalyptic",
]

const HERO_CATEGORY: CategoryKey = "pentateuch"

const OLD_TESTAMENT_CATEGORIES: CategoryKey[] = [
  "historical",
  "wisdom",
  "major_prophets",
  "minor_prophets",
]

const NEW_TESTAMENT_CATEGORIES: CategoryKey[] = [
  "gospels",
  "acts",
  "pauline_epistles",
  "general_epistles",
  "apocalyptic",
]

function slugifyBook(book: string) {
  return book.toLowerCase().replace(/\s+/g, "_")
}

export default function ExplorePage() {
  const [books, setBooks] = useState<BookRow[]>([])
  const [mastery, setMastery] = useState<MasteryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [booksRes, userRes] = await Promise.all([
          fetch("/api/quests/books"),
          createClient().auth.getUser(),
        ])

        const booksPayload = await booksRes.json()

        if (!booksRes.ok) {
          throw new Error(booksPayload?.error || "Failed to load books")
        }

        const user = userRes.data.user
        let masteryRows: MasteryRow[] = []

        if (user) {
          const supabase = createClient()
          const { data } = await supabase
            .from("user_segment_mastery")
            .select("segment, mastered")
            .eq("user_id", user.id)

          masteryRows = (data || []) as MasteryRow[]
        }

        if (!active) return

        setBooks(Array.isArray(booksPayload?.books) ? booksPayload.books : [])
        setMastery(masteryRows)
      } catch (loadError) {
        console.error("Failed to load explorer data", loadError)
        if (!active) return
        setError("Unable to open the explorer right now.")
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const derived = useMemo(() => {
    const categoryByBook = new Map<string, CategoryKey>()

    for (const book of books) {
      if (book.category && book.category in CATEGORY_META) {
        categoryByBook.set(book.book, book.category as CategoryKey)
      }
    }

    const masteredSet = new Set(
      mastery.filter((row) => row.mastered).map((row) => row.segment)
    )

    const categoryStats = Object.fromEntries(
      Object.keys(CATEGORY_META).map((category) => [
        category,
        {
          bookCount: 0,
          totalSegments: 0,
          masteredSegments: 0,
          progressPercent: 0,
        },
      ])
    ) as Record<
      CategoryKey,
      {
        bookCount: number
        totalSegments: number
        masteredSegments: number
        progressPercent: number
      }
    >

    const bookCompletion: Record<string, { total: number; mastered: number }> = {}

    for (const book of books) {
      const category = categoryByBook.get(book.book)
      if (!category) continue
      categoryStats[category].bookCount += 1
      bookCompletion[book.book] = { total: 0, mastered: 0 }
    }

    for (const node of nodes) {
      const category = categoryByBook.get(node.book)
      if (!category) continue

      categoryStats[category].totalSegments += 1
      bookCompletion[node.book] ??= { total: 0, mastered: 0 }
      bookCompletion[node.book].total += 1

      const normalizedIds = new Set([
        node.id,
        node.id.replaceAll("_", "-"),
        `${slugifyBook(node.book)}_${node.startChapter}_${node.endChapter}`,
        `${slugifyBook(node.book)}-${node.startChapter}-${node.endChapter}`,
      ])

      const isMastered = Array.from(normalizedIds).some((id) => masteredSet.has(id))

      if (isMastered) {
        categoryStats[category].masteredSegments += 1
        bookCompletion[node.book].mastered += 1
      }
    }

    let totalSegments = 0
    let masteredSegments = 0

    ;(Object.keys(categoryStats) as CategoryKey[]).forEach((category) => {
      const stat = categoryStats[category]
      stat.progressPercent =
        stat.totalSegments > 0
          ? Math.round((stat.masteredSegments / stat.totalSegments) * 100)
          : 0

      totalSegments += stat.totalSegments
      masteredSegments += stat.masteredSegments
    })

    const totalBooks = books.length
    const booksMastered = Object.values(bookCompletion).filter(
      (book) => book.total > 0 && book.mastered === book.total
    ).length

    const strongestCategory =
      (Object.entries(categoryStats) as [CategoryKey, typeof categoryStats[CategoryKey]][])
        .filter(([, stat]) => stat.totalSegments > 0)
        .sort((a, b) => {
          if (b[1].progressPercent !== a[1].progressPercent) {
            return b[1].progressPercent - a[1].progressPercent
          }
          return b[1].masteredSegments - a[1].masteredSegments
        })[0]?.[0] || null

    return {
      categoryStats,
      totalBooks,
      booksMastered,
      totalSegments,
      masteredSegments,
      overallPercent:
        totalSegments > 0 ? Math.round((masteredSegments / totalSegments) * 100) : 0,
      strongestCategory,
    }
  }, [books, mastery])

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#13233f,_#060914_55%)] px-4 py-6 text-white">
        Loading explorer...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#13233f,_#060914_55%)] px-4 py-6 text-white">
        {error}
      </div>
    )
  }

  const ringStyle = {
    background: `conic-gradient(#7ee69c ${derived.overallPercent}%, rgba(255,255,255,0.08) 0%)`,
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#10203f_0%,_#080d1b_38%,_#04060d_100%)] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(82,224,255,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-12 top-52 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-80 h-48 w-48 rounded-full bg-fuchsia-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14">
          <div className="text-sm font-bold uppercase tracking-[0.32em] text-cyan-200/80">
            Explorer
          </div>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
            Enter the Bible
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Move through sacred regions, learn their terrain, and master each world through practice.
          </p>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-300/12 bg-[radial-gradient(circle_at_top,rgba(126,230,156,0.14),transparent_34%),linear-gradient(180deg,rgba(14,22,39,0.92),rgba(7,10,18,0.92))] px-5 py-6 shadow-[0_20px_52px_rgba(0,0,0,0.24)] sm:px-6">
          <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-emerald-300/8 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div
                className="relative flex h-24 w-24 items-center justify-center rounded-full p-[7px]"
                style={ringStyle}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#07101b] shadow-inner shadow-black/30">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">
                      {derived.overallPercent}%
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-300">
                      Mapped
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">
                  World Progress
                </div>
                <div className="mt-2 max-w-xl text-lg font-semibold text-white">
                  {derived.strongestCategory
                    ? `${CATEGORY_META[derived.strongestCategory].title} is currently your strongest region.`
                    : "Your Bible world is just beginning to open."}
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-300">
                  {derived.booksMastered} of {derived.totalBooks} books fully mastered across {derived.masteredSegments} cleared segments.
                </div>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-slate-300 sm:justify-end">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Books
                </div>
                <div className="mt-1 text-xl font-black text-white">
                  {derived.booksMastered}/{derived.totalBooks}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Segments
                </div>
                <div className="mt-1 text-xl font-black text-white">
                  {derived.masteredSegments}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12 sm:mt-16">
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              Featured Region
            </div>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Begin at the Source
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              The opening region stands apart as the entry point into the whole Bible world.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            {(() => {
              const meta = CATEGORY_META[HERO_CATEGORY]
              const stat = derived.categoryStats[HERO_CATEGORY]

              return (
                <ExplorerCategoryCard
                  href={`/explore/category/${HERO_CATEGORY}`}
                  title={meta.title}
                  subtitle={meta.subtitle}
                  bookCount={stat.bookCount}
                  masteryPercent={stat.progressPercent}
                  progressPercent={stat.progressPercent}
                  state={stat.progressPercent >= 100 ? "mastered" : "open"}
                  theme={meta.theme}
                />
              )
            })()}
          </div>
        </div>

        <div className="mt-16 space-y-16 sm:mt-24 sm:space-y-24">
          <section>
            <div className="mb-8 sm:mb-10">
              <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
                Old Testament
              </div>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Ancient Realms
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Wilderness, kingdoms, poetry, and prophetic fire spread across the first sacred territories.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-8">
              {[HERO_CATEGORY, ...OLD_TESTAMENT_CATEGORIES].map((category, index) => {
                const meta = CATEGORY_META[category]
                const stat = derived.categoryStats[category]

                return (
                  <div
                    key={category}
                    className={index % 2 === 1 ? "md:translate-y-10" : ""}
                  >
                    <ExplorerCategoryCard
                      href={`/explore/category/${category}`}
                      title={meta.title}
                      subtitle={meta.subtitle}
                      bookCount={stat.bookCount}
                      masteryPercent={stat.progressPercent}
                      progressPercent={stat.progressPercent}
                      state={stat.progressPercent >= 100 ? "mastered" : "open"}
                      theme={meta.theme}
                    />
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <div className="mb-8 sm:mb-10">
              <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/70">
                New Testament
              </div>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Expanding Horizons
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Radiant life, mission roads, letters, and final revelation open the later world of Scripture.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-8">
              {NEW_TESTAMENT_CATEGORIES.map((category, index) => {
                const meta = CATEGORY_META[category]
                const stat = derived.categoryStats[category]

                return (
                  <div
                    key={category}
                    className={index % 2 === 0 ? "md:translate-y-6" : ""}
                  >
                    <ExplorerCategoryCard
                      href={`/explore/category/${category}`}
                      title={meta.title}
                      subtitle={meta.subtitle}
                      bookCount={stat.bookCount}
                      masteryPercent={stat.progressPercent}
                      progressPercent={stat.progressPercent}
                      state={stat.progressPercent >= 100 ? "mastered" : "open"}
                      theme={meta.theme}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050812]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
            <Link href="/home" className="flex flex-col items-center text-[11px] font-medium text-slate-400">
              <span className="text-lg">🏠</span>
              <span>Home</span>
            </Link>
            <Link href="/journey" className="flex flex-col items-center text-[11px] font-medium text-slate-400">
              <span className="text-lg">📖</span>
              <span>Journey</span>
            </Link>
            <Link href="/explore" className="flex flex-col items-center text-[11px] font-semibold text-cyan-200">
              <span className="text-lg">🧭</span>
              <span>Explore</span>
            </Link>
            <Link href="/quests" className="flex flex-col items-center text-[11px] font-medium text-slate-400">
              <span className="text-lg">⚔️</span>
              <span>Quests</span>
            </Link>
            <Link href="/leaderboard" className="flex flex-col items-center text-[11px] font-medium text-slate-400">
              <span className="text-lg">🏆</span>
              <span>Rank</span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  )
}
