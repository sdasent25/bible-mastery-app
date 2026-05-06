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

const CATEGORY_ORDER: {
  heading: "Old Testament" | "New Testament"
  categories: CategoryKey[]
}[] = [
  {
    heading: "Old Testament",
    categories: [
      "pentateuch",
      "historical",
      "wisdom",
      "major_prophets",
      "minor_prophets",
    ],
  },
  {
    heading: "New Testament",
    categories: [
      "gospels",
      "acts",
      "pauline_epistles",
      "general_epistles",
      "apocalyptic",
    ],
  },
]

const CATEGORY_META: Record<
  CategoryKey,
  {
    title: string
    subtitle: string
    accent: {
      glow: string
      border: string
      chip: string
      meter: string
      surface: string
      orb: string
    }
  }
> = {
  pentateuch: {
    title: "Pentateuch",
    subtitle: "Origins, covenant, law, and the first fires of the story.",
    accent: {
      glow: "bg-amber-300/20",
      border: "border-amber-300/20",
      chip: "border-amber-200/20 bg-amber-300/10",
      meter: "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400",
      surface: "bg-[linear-gradient(180deg,rgba(54,38,12,0.94),rgba(19,14,10,0.98))]",
      orb: "bg-amber-200/20",
    },
  },
  historical: {
    title: "Historical",
    subtitle: "Kings, battles, exile, return, and the rise and fall of a people.",
    accent: {
      glow: "bg-emerald-300/16",
      border: "border-emerald-300/16",
      chip: "border-emerald-200/20 bg-emerald-300/10",
      meter: "bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-400",
      surface: "bg-[linear-gradient(180deg,rgba(11,40,34,0.94),rgba(8,16,18,0.98))]",
      orb: "bg-emerald-200/20",
    },
  },
  wisdom: {
    title: "Wisdom",
    subtitle: "Songs, sorrow, insight, and the long search for understanding.",
    accent: {
      glow: "bg-sky-300/18",
      border: "border-sky-300/18",
      chip: "border-sky-200/20 bg-sky-300/10",
      meter: "bg-gradient-to-r from-sky-200 via-cyan-300 to-blue-400",
      surface: "bg-[linear-gradient(180deg,rgba(10,29,52,0.95),rgba(7,12,24,0.98))]",
      orb: "bg-sky-200/20",
    },
  },
  major_prophets: {
    title: "Major Prophets",
    subtitle: "Thunderous warnings, visions of judgment, and luminous hope.",
    accent: {
      glow: "bg-fuchsia-400/18",
      border: "border-fuchsia-300/18",
      chip: "border-fuchsia-200/20 bg-fuchsia-300/10",
      meter: "bg-gradient-to-r from-fuchsia-200 via-violet-300 to-purple-400",
      surface: "bg-[linear-gradient(180deg,rgba(44,18,56,0.95),rgba(13,10,24,0.98))]",
      orb: "bg-fuchsia-200/20",
    },
  },
  minor_prophets: {
    title: "Minor Prophets",
    subtitle: "Sharp voices, swift warnings, and a watchman’s urgency.",
    accent: {
      glow: "bg-purple-400/16",
      border: "border-purple-300/16",
      chip: "border-purple-200/20 bg-purple-300/10",
      meter: "bg-gradient-to-r from-purple-200 via-violet-300 to-indigo-400",
      surface: "bg-[linear-gradient(180deg,rgba(30,18,54,0.95),rgba(10,9,22,0.98))]",
      orb: "bg-purple-200/20",
    },
  },
  gospels: {
    title: "Gospels",
    subtitle: "The radiant center of the story, seen through four witnesses.",
    accent: {
      glow: "bg-yellow-300/20",
      border: "border-yellow-300/20",
      chip: "border-yellow-200/20 bg-yellow-300/10",
      meter: "bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400",
      surface: "bg-[linear-gradient(180deg,rgba(61,43,8,0.95),rgba(22,15,8,0.98))]",
      orb: "bg-yellow-200/20",
    },
  },
  acts: {
    title: "Acts",
    subtitle: "The mission expands outward with courage, movement, and fire.",
    accent: {
      glow: "bg-orange-300/18",
      border: "border-orange-300/18",
      chip: "border-orange-200/20 bg-orange-300/10",
      meter: "bg-gradient-to-r from-orange-200 via-amber-300 to-orange-400",
      surface: "bg-[linear-gradient(180deg,rgba(57,28,13,0.95),rgba(21,13,10,0.98))]",
      orb: "bg-orange-200/20",
    },
  },
  pauline_epistles: {
    title: "Pauline Epistles",
    subtitle: "Doctrine, correction, encouragement, and letters forged in motion.",
    accent: {
      glow: "bg-blue-400/18",
      border: "border-blue-300/18",
      chip: "border-blue-200/20 bg-blue-300/10",
      meter: "bg-gradient-to-r from-blue-200 via-sky-300 to-indigo-400",
      surface: "bg-[linear-gradient(180deg,rgba(10,25,58,0.95),rgba(8,11,26,0.98))]",
      orb: "bg-blue-200/20",
    },
  },
  general_epistles: {
    title: "General Epistles",
    subtitle: "Steady counsel for endurance, holiness, love, and truth.",
    accent: {
      glow: "bg-cyan-300/18",
      border: "border-cyan-300/18",
      chip: "border-cyan-200/20 bg-cyan-300/10",
      meter: "bg-gradient-to-r from-cyan-200 via-sky-300 to-teal-400",
      surface: "bg-[linear-gradient(180deg,rgba(10,38,45,0.95),rgba(8,14,18,0.98))]",
      orb: "bg-cyan-200/20",
    },
  },
  apocalyptic: {
    title: "Apocalyptic",
    subtitle: "The veil lifts: conflict, victory, judgment, and final restoration.",
    accent: {
      glow: "bg-rose-400/18",
      border: "border-rose-300/18",
      chip: "border-rose-200/20 bg-rose-300/10",
      meter: "bg-gradient-to-r from-rose-200 via-pink-300 to-red-400",
      surface: "bg-[linear-gradient(180deg,rgba(54,16,26,0.95),rgba(19,9,13,0.98))]",
      orb: "bg-rose-200/20",
    },
  },
}

function slugifyBook(book: string) {
  return book.toLowerCase().replace(/\s+/g, "_")
}

function formatCategoryLabel(category: string) {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
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

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6">
        <header className="mb-6">
          <div className="text-sm font-bold uppercase tracking-[0.32em] text-cyan-200/80">
            Explorer
          </div>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white">
            Explore the Bible
          </h1>
          <p className="mt-3 max-w-sm text-base leading-7 text-slate-300">
            Master every book through progression and practice.
          </p>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-[radial-gradient(circle_at_top,rgba(126,230,156,0.18),transparent_34%),linear-gradient(180deg,rgba(14,22,39,0.98),rgba(7,10,18,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative z-10 flex items-center gap-5">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full p-[7px]" style={ringStyle}>
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
                Progress Summary
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="text-xl font-black text-white">
                    {derived.booksMastered} / {derived.totalBooks}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                    Books Mastered
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="text-xl font-black text-white">
                    {derived.masteredSegments}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                    Segments Cleared
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Strongest Category
                </div>
                <div className="mt-2 text-lg font-bold text-white">
                  {derived.strongestCategory
                    ? CATEGORY_META[derived.strongestCategory].title
                    : "Beginning the journey"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex-1 space-y-8">
          {CATEGORY_ORDER.map((group) => (
            <section key={group.heading}>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                    Testament
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {group.heading}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {group.categories.map((category) => {
                  const meta = CATEGORY_META[category]
                  const stat = derived.categoryStats[category]

                  return (
                    <ExplorerCategoryCard
                      key={category}
                      href={`/explore/category/${category}`}
                      title={meta.title}
                      category={formatCategoryLabel(category)}
                      subtitle={meta.subtitle}
                      bookCount={stat.bookCount}
                      progressPercent={stat.progressPercent}
                      masteredSegments={stat.masteredSegments}
                      totalSegments={stat.totalSegments}
                      accent={meta.accent}
                    />
                  )
                })}
              </div>
            </section>
          ))}
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
