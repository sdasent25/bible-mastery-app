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
    <div className="p-6 text-white max-w-md mx-auto">
      <button
        onClick={() => router.push("/quests")}
        className="mb-4 text-sm text-gray-300"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">
        Who Said It
      </h1>

      <div className="flex flex-col items-center gap-6">
        {books.map((book, i) => {
          const unlocked = isUnlocked(i)
          const p = progress[book.key] || { total: 0, completed: 0 }

          return (
            <div
              key={book.key}
              className="flex flex-col items-center"
            >
              <div
                onClick={() => {
                  if (!unlocked) return
                  router.push(`/quests/who-said-it/play?book=${book.key}`)
                }}
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  text-center cursor-pointer transition
                  ${unlocked ? "bg-blue-600 hover:scale-105" : "bg-gray-700 opacity-50"}
                `}
              >
                {unlocked ? book.label.slice(0, 3) : "🔒"}
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
