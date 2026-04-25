"use client"

import { useEffect, useState } from "react"
import { getFlashcards } from "@/lib/flashcards"

type FlashcardListItem = {
  id: string
  reference: string
  verse_text: string
}

export default function FlashcardListPage() {
  const [cards, setCards] = useState<FlashcardListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFlashcards()
        setCards(data || [])
      } catch (error) {
        console.error("Failed to load flashcards", error)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <div className="p-6 text-white">Loading cards...</div>
  }

  if (!cards.length) {
    return (
      <div className="p-6 text-white">
        <button
          onClick={() => window.location.href = "/flashcards"}
          className="mb-4 text-sm text-gray-300"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-2">My Cards</h1>
        <p>No flashcards yet. Create your first one.</p>
      </div>
    )
  }

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <button
        onClick={() => window.location.href = "/flashcards"}
        className="mb-4 text-sm text-gray-300"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">
        My Cards
      </h1>

      <div className="grid gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-gray-800 rounded-xl p-4"
          >
            <div className="text-sm text-blue-400 mb-2">
              {card.reference}
            </div>

            <div className="text-lg">
              {card.verse_text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
