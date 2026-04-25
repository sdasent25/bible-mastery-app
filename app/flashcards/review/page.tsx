"use client"

import { useEffect, useMemo, useState } from "react"

import { getFlashcards, type Flashcard, updateFlashcardProgress } from "@/lib/flashcards"

export default function ReviewMode() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const loadCards = async () => {
      try {
        const loadedCards = await getFlashcards()
        setCards(loadedCards)
      } catch (error) {
        console.error("Failed to load flashcards", error)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    void loadCards()
  }, [])

  const weakCards = useMemo(
    () => cards.filter((card) => (card.lapses ?? 0) > 0 || (card.interval ?? 1) <= 2),
    [cards]
  )

  useEffect(() => {
    if (index >= weakCards.length && weakCards.length > 0) {
      setIndex(0)
    }
  }, [index, weakCards.length])

  const current = weakCards[index] ?? null
  const words = current?.verse.split(" ") || []

  const masked = words.map((word, wordIndex) =>
    wordIndex < 3 ? word : "_____"
  )

  const handleAnswer = async (result: "again" | "hard" | "easy") => {
    if (!current) {
      return
    }

    try {
      const updatedCard = await updateFlashcardProgress(current, result)
      setCards((existingCards) =>
        existingCards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        )
      )
      setFlipped(false)
      setIndex((currentIndex) => {
        if (weakCards.length <= 1) {
          return 0
        }

        return currentIndex < weakCards.length - 1 ? currentIndex + 1 : 0
      })
    } catch (error) {
      console.error("Failed to update flashcard progress", error)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white bg-black">
        Loading weak cards...
      </div>
    )
  }

  if (weakCards.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white bg-black">
        No weak cards found. Add some first.
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-4">

      <div className="mb-6 text-center">

        <div style={{ color: "#ffffff" }} className="text-sm mb-1 font-medium">
          Card {index + 1} of {weakCards.length}
        </div>

        <div style={{ color: "#ffffff" }} className="text-sm">
          Try to recall the full verse before flipping
        </div>

        <div className="text-blue-400 text-sm mt-2 font-medium">
          {current?.reference}
        </div>

      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full max-w-xl p-6 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl cursor-pointer text-center transition hover:scale-[1.02]"
      >

        <div className="text-2xl md:text-3xl font-bold text-white leading-relaxed">

          {(flipped ? words : masked).map((word, wordIndex) => (
            <span
              key={wordIndex}
              style={{ color: flipped ? "#ffffff" : (wordIndex < 3 ? "#ffffff" : "#6b7280") }}
              className="inline-block mx-1 my-1"
            >
              {word}
            </span>
          ))}

        </div>

      </div>

      {flipped && (
        <div className="mt-8 flex gap-4">

          <button
            onClick={() => void handleAnswer("again")}
            className="px-5 py-2 bg-red-500 rounded-xl hover:scale-105 transition"
          >
            Again
          </button>

          <button
            onClick={() => void handleAnswer("hard")}
            className="px-5 py-2 bg-yellow-500 rounded-xl hover:scale-105 transition"
          >
            Hard
          </button>

          <button
            onClick={() => void handleAnswer("easy")}
            className="px-5 py-2 bg-green-500 rounded-xl hover:scale-105 transition"
          >
            Easy
          </button>

        </div>
      )}

    </div>
  )
}
