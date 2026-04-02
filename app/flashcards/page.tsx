'use client'

import { useEffect, useState } from 'react'

type Flashcard = {
  reference: string
  text: string
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchCards = async () => {
      const res = await fetch('/api/flashcards')
      const data = await res.json()
      setCards(data)
    }

    fetchCards()
  }, [])

  const currentCard = cards[currentIndex]

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <p>No flashcards yet</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl max-w-xl w-full text-center">
        <p className="text-sm text-slate-400 mb-2">
          {currentCard?.reference}
        </p>

        <p className="text-xl leading-relaxed mb-6">
          {currentCard?.text}
        </p>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % cards.length)}
          className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500"
        >
          Next Card
        </button>
      </div>
    </div>
  )
}
