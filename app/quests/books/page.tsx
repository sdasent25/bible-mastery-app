"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

type QuestBook = {
  id: string
  category: string | null
  book: string | null
  theme: string | null
}

export default function BooksPage() {
  const [books, setBooks] = useState<QuestBook[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("quest_questions")
        .select("*")
        .eq("type", "books")
        .order("order", { ascending: true })

      setBooks((data as QuestBook[]) || [])
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
