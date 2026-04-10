"use client"

import { useEffect, useState } from "react"

export default function PracticeMode() {
  const [cards, setCards] = useState<
    { text: string; ref: string; level?: string }[]
  >([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("flashcards") || "[]")

    // Filter only weak cards
    const weakCards = stored.filter(
      (card) => card.level === "again" || card.level === "hard"
    )

    setCards(weakCards)
  }, [])

  const current = cards[index]
  const words = current?.text.split(" ") || []

  // HARDER MASKING (only show 2 words)
  const masked = words.map((w, i) =>
    i < 2 ? w : "_____"
  )

  const handleAnswer = (level: "again" | "hard" | "easy") => {
    const stored =
      JSON.parse(localStorage.getItem("flashcards") || "[]")

    const updatedStored = stored.map((card: { text: string; ref: string; level?: string }) =>
      card.text === current.text && card.ref === current.ref
        ? { ...card, level }
        : card
    )

    localStorage.setItem("flashcards", JSON.stringify(updatedStored))

    const weakCards = updatedStored.filter(
      (card: { text: string; ref: string; level?: string }) =>
        card.level === "again" || card.level === "hard"
    )

    setCards(weakCards)
    setFlipped(false)

    if (weakCards.length === 0) {
      setIndex(0)
      return
    }

    if (index < weakCards.length - 1) {
      setIndex(index)
    } else {
      setIndex(0)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-white bg-black text-center px-6">

        <div className="text-2xl mb-4">🎉</div>

        <div className="text-lg font-semibold mb-2">
          No weak cards
        </div>

        <div className="text-gray-400">
          You're doing great. Come back after more review.
        </div>

      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-4">

      {/* Header */}
      <div className="mb-6 text-center">

        <div style={{ color: "#ffffff" }} className="text-sm mb-1 font-medium">
          Practice Mode
        </div>

        <div style={{ color: "#ffffff" }} className="text-sm">
          Recall as much as you can before flipping
        </div>

        <div className="text-blue-400 text-sm mt-2 font-medium">
          {current.ref}
        </div>

      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full max-w-xl p-6 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl cursor-pointer text-center transition hover:scale-[1.02]"
      >

        <div className="text-2xl md:text-3xl font-bold text-white leading-relaxed">

          {(flipped ? words : masked).map((word, i) => (
            <span
              key={i}
              style={{ color: flipped ? "#ffffff" : (i < 2 ? "#ffffff" : "#6b7280") }}
              className="inline-block mx-1 my-1"
            >
              {word}
            </span>
          ))}

        </div>

      </div>

      {/* Buttons */}
      {flipped && (
        <div className="mt-8 flex gap-4">

          <button
            onClick={() => handleAnswer("again")}
            className="px-5 py-2 bg-red-500 rounded-xl hover:scale-105 transition"
          >
            Again
          </button>

          <button
            onClick={() => handleAnswer("hard")}
            className="px-5 py-2 bg-yellow-500 rounded-xl hover:scale-105 transition"
          >
            Hard
          </button>

          <button
            onClick={() => handleAnswer("easy")}
            className="px-5 py-2 bg-green-500 rounded-xl hover:scale-105 transition"
          >
            Easy
          </button>

        </div>
      )}

    </div>
  )
}
