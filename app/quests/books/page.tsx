"use client"

import { useEffect, useState } from "react"

type QuestBook = {
  id: string
  book_order?: number | null
  category: string | null
  book: string | null
  theme: string | null
}

export default function BooksPage() {
  const [books, setBooks] = useState<QuestBook[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/quests/books")
      const { books } = await res.json()

      setBooks(books || [])
    }

    void load()
  }, [])

  if (!books.length) {
    return <div className="text-white">No books loaded</div>
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <h1 className="text-3xl font-bold text-white">Books of the Bible</h1>

        {books.map((book) => (
          <div key={book.id} className="bg-gray-800 p-4 rounded-xl">
            <div className="text-gray-500 text-xs">
              #{book.book_order}
            </div>
            <div className="text-blue-400 text-sm">
              {book.category}
            </div>
            <div className="text-white font-semibold">
              {book.book}
            </div>
            <div className="text-gray-400 text-sm">
              {book.theme}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
