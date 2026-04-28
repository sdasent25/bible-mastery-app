"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type BookRow = {
  id: string
  book: string
  book_order: number
  testament: string | null
  category: string | null
  theme: string | null
}

export default function BooksSpeedRoundPage() {
  const [books, setBooks] = useState<BookRow[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/quests/books")
      const payload = await res.json()
      setBooks(Array.isArray(payload?.books) ? payload.books : [])
    }

    void load()
  }, [])

  return (
    <div className="mx-auto max-w-lg p-6 text-white md:p-10">
      <div className="rounded-3xl border border-white/10 bg-gray-950 p-6 shadow-2xl">
        <h1 className="text-3xl font-bold text-white">Speed Round</h1>
        <p className="mt-4 text-gray-300">
          Speed Round is ready
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {books.length} books loaded
        </p>

        <Link
          href="/quests/books"
          className="mt-6 inline-flex rounded-2xl bg-gray-700 px-4 py-2 font-semibold text-white transition transform active:scale-95 hover:scale-105"
        >
          Back to Books
        </Link>
      </div>
    </div>
  )
}
