"use client"

import { useEffect, useState } from "react"

export default function LibraryPage() {
  const [cards, setCards] = useState<
    { text: string; ref: string }[]
  >([])

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("flashcards") || "[]")

    setCards(stored)
  }, [])

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 py-8">

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">
        My Flashcards
      </h1>

      {/* Empty State */}
      {cards.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          No flashcards yet. Add your first one!
        </div>
      )}

      {/* List */}
      <div className="max-w-xl mx-auto flex flex-col gap-4">

        {cards.map((card, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-zinc-900 border border-white/10 shadow-md"
          >
            <div className="text-sm text-blue-400 mb-2 font-medium">
              {card.ref}
            </div>

            <div className="text-lg font-semibold leading-relaxed text-white">
              {card.text}
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}
