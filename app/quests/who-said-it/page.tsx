"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

const books = [
  { key: "genesis", label: "Genesis" },
  { key: "exodus", label: "Exodus" },
  { key: "leviticus", label: "Leviticus" },
  { key: "numbers", label: "Numbers" },
  { key: "deuteronomy", label: "Deuteronomy" },
]

type BookProgress = {
  total: number
  completed: number
}

type ProgressMap = Record<string, BookProgress>

function Ring({ percent }: { percent: number }) {
  const p = Math.min(100, Math.max(0, percent || 0))
  return (
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center"
      style={{
        background: `conic-gradient(#3b82f6 ${p}%, #1f2937 ${p}%)`,
      }}
    >
      <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
        <span className="text-xs text-gray-300">{p}%</span>
      </div>
    </div>
  )
}

export default function WhoSaidItPage() {
  const [progress, setProgress] = useState<ProgressMap>({})
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const result: ProgressMap = {}

      for (const book of books) {
        const { data } = await supabase
          .from("quest_questions")
          .select("id")
          .contains("tags", [book.key])

        result[book.key] = {
          total: data?.length || 0,
          completed: 0,
        }
      }

      setProgress(result)
    }

    void load()
  }, [])

  function isUnlocked(index: number) {
    if (index === 0) return true
    return books[index - 1].key === "genesis"
  }

  return (
    <div className="p-6 md:p-10 text-white max-w-lg mx-auto">
      <button
        onClick={() => router.push("/quests")}
        className="mb-4 text-sm text-gray-300 transition transform active:scale-95"
      >
        ← Back
      </button>

      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        Who Said It
      </h1>

      <div className="mb-6 bg-yellow-500 text-black p-4 rounded-xl text-center">
        ⭐ Daily Challenge — Mixed Questions
      </div>

      <div className="flex flex-col items-center gap-6">
        {books.map((book, i) => {
          const unlocked = isUnlocked(i)
          const isCurrent = i === 0
          const p = progress[book.key] || { total: 0, completed: 0 }

          return (
            <div
              key={book.key}
              className="flex flex-col items-center"
            >
              <div className={isCurrent ? "animate-pulse" : ""}>
                <div className="relative">
                  <Ring percent={(p.total ? Math.round((p.completed / p.total) * 100) : 0)} />
                  <div
                    onClick={() => {
                      if (!unlocked) return
                      router.push(`/quests/who-said-it/play?book=${book.key}`)
                    }}
                    className={`
                      absolute inset-0 flex items-center justify-center text-center cursor-pointer transition transform active:scale-95
                      ${unlocked ? "hover:scale-105" : "opacity-50 pointer-events-none"}
                    `}
                  >
                    <div className="text-sm font-semibold">
                      {unlocked ? book.label.slice(0, 3) : "🔒"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-300">
                {book.label}
              </div>

              {unlocked && (
                <div className="text-xs text-gray-400">
                  {p.completed} / {p.total}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
