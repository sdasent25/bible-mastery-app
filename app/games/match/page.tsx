'use client'

import { useEffect, useState } from 'react'
import { getFlashcards, type Flashcard } from '@/lib/flashcards'
import { addXp } from '@/lib/xp'
import { updateDailyProgress } from '@/lib/daily'
import { saveSession } from '@/lib/resume'

export default function MatchGame() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [pairs, setPairs] = useState<Flashcard[]>([])
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [doubleXP, setDoubleXP] = useState(false)
  const [answeredCards, setAnsweredCards] = useState<string[]>([])
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getFlashcards()

      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setPairs(shuffled.slice(0, 4))
      setCards(shuffled)
    }

    load()
  }, [])

  async function handleMatch(reference: string) {
    if (!selectedVerse) return

    const correct = pairs.find(p => p.verse === selectedVerse)
    const isFirstAttempt = correct ? !answeredCards.includes(correct.id) : false

    if (correct?.reference === reference) {
      setScore(s => s + (doubleXP ? 2 : 1))
      saveSession({
        game: 'match',
        score,
        streak
      })
      setStreak(s => s + 1)
      updateDailyProgress()
      await addXp({
        amount: doubleXP ? 20 : 10,
        source: 'flashcards',
        cardId: correct.id,
        isFirstAttempt,
      })
      setAnsweredCards((prev) => (prev.includes(correct.id) ? prev : [...prev, correct.id]))
      setPairs(prev => prev.filter(p => p.verse !== selectedVerse))
      setResult('correct')
    } else {
      if (correct) {
        setAnsweredCards((prev) => (prev.includes(correct.id) ? prev : [...prev, correct.id]))
      }
      setStreak(0)
      setResult('wrong')
    }

    setSelectedVerse(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6 text-gray-900 font-bold">
          <div>Score: {score}</div>
          <div className="bg-purple-100 px-4 py-2 rounded-full font-bold text-purple-700">
            {doubleXP ? '⚡ 2x XP' : 'XP Normal'}
          </div>
          <div>🔥 {streak}</div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setDoubleXP((d) => !d)}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all duration-200"
          >
            {doubleXP ? 'Disable 2x XP' : 'Enable 2x XP'}
          </button>
        </div>

        {result === 'correct' && (
          <div className="text-center mb-4">
            <div className="text-3xl">✅</div>
            <p className="text-green-600 font-bold text-lg">
              Correct Match!
            </p>
          </div>
        )}

        {result === 'wrong' && (
          <div className="text-center mb-4">
            <p className="text-red-600 font-bold text-lg">
              Try again
            </p>
          </div>
        )}

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
