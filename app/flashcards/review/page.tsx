"use client"

import { useState } from "react"

export default function ReviewMode() {
  const cards = [
    {
      front: "Trust in the Lord with all your heart...",
      back: "Trust in the Lord with all your heart and lean not on your own understanding",
      ref: "Proverbs 3:5",
    },
    {
      front: "I can do all things...",
      back: "I can do all things through Christ who strengthens me",
      ref: "Philippians 4:13",
    },
  ]

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = cards[index]

  const next = () => {
    setFlipped(false)

    if (index < cards.length - 1) {
      setIndex((i) => i + 1)
    } else {
      setIndex(0)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-4">

      {/* Header */}
      <div className="mb-6 text-center">
        <div style={{ color: "#ffffff" }} className="text-sm mb-1 font-medium">
          Card {index + 1} of {cards.length}
        </div>

        <div style={{ color: "#ffffff" }} className="text-sm">
          Tap the card to flip
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full max-w-xl p-6 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl cursor-pointer text-center transition hover:scale-[1.02]"
      >

        <div className="text-xs text-gray-400 mb-2">
          {current.ref}
        </div>

        <div className="text-2xl font-bold text-white leading-relaxed">
          {flipped ? current.back : current.front}
        </div>

      </div>

      {/* Buttons */}
      {flipped && (
        <div className="mt-8 flex gap-4">

          <button
            onClick={next}
            className="px-5 py-2 bg-red-500 rounded-xl hover:scale-105 transition"
          >
            Again
          </button>

          <button
            onClick={next}
            className="px-5 py-2 bg-yellow-500 rounded-xl hover:scale-105 transition"
          >
            Hard
          </button>

          <button
            onClick={next}
            className="px-5 py-2 bg-green-500 rounded-xl hover:scale-105 transition"
          >
            Easy
          </button>

        </div>
      )}

    </div>
  )
}
