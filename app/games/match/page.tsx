'use client'

import { useEffect, useState } from 'react'
import { getFlashcards, type Flashcard } from '@/lib/flashcards'

export default function MatchGame() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [pairs, setPairs] = useState<Flashcard[]>([])
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    async function load() {
      const data = await getFlashcards()

      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setPairs(shuffled.slice(0, 4))
      setCards(shuffled)
    }

    load()
  }, [])

  function handleMatch(reference: string) {
    if (!selectedVerse) return

    const correct = pairs.find(p => p.verse === selectedVerse)

    if (correct?.reference === reference) {
      setScore(s => s + 1)
      setStreak(s => s + 1)
      setPairs(prev => prev.filter(p => p.verse !== selectedVerse))
    } else {
      setStreak(0)
    }

    setSelectedVerse(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6 text-gray-900 font-bold">
          <div>Score: {score}</div>
          <div>🔥 {streak}</div>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* VERSES */}
          <div className="space-y-4">
            {pairs.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedVerse(card.verse)}
                className={`p-4 rounded-xl border cursor-pointer ${
                  selectedVerse === card.verse
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                {card.verse}
              </div>
            ))}
          </div>

          {/* REFERENCES */}
          <div className="space-y-4">
            {[...pairs].sort(() => Math.random() - 0.5).map((card) => (
              <div
                key={card.id}
                onClick={() => handleMatch(card.reference)}
                className="p-4 rounded-xl border bg-white border-gray-200 cursor-pointer hover:bg-gray-100"
              >
                {card.reference}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}
