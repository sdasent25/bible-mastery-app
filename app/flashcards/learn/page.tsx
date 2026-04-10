"use client"

import { useEffect, useState } from "react"

export default function LearnMode() {
  const [cards, setCards] = useState<{ text: string; ref: string }[]>([])
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(2)
  const [xp, setXp] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [showXP, setShowXP] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("flashcards") || "[]")

    setCards(stored)
  }, [])

  const words = cards[index]?.text.split(" ") || []
  const percent = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0

  const reveal = () => {
    if (visible < words.length) {
      setVisible((v) => Math.min(v + 2, words.length))
    }

    setPressed(true)
    setTimeout(() => setPressed(false), 120)
  }

  const next = () => {
    setXp((x) => x + 10)

    const currentXP =
      Number(localStorage.getItem("xp") || 0)

    localStorage.setItem(
      "xp",
      (currentXP + 10).toString()
    )

    const currentProgress =
      Number(localStorage.getItem("dailyProgress") || 0)

    localStorage.setItem(
      "dailyProgress",
      (currentProgress + 1).toString()
    )

    setShowXP(true)
    setTimeout(() => setShowXP(false), 700)

    if (index < cards.length - 1) {
      setIndex((i) => i + 1)
      setVisible(2)
    } else {
      setCompleted(true)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white bg-black">
        No flashcards found. Add some first.
      </div>
    )
  }

  if (completed) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6">

        <h1 className="text-4xl font-bold mb-4">🔥 Session Complete</h1>

        <div className="text-green-400 text-2xl mb-4">
          +{xp} XP ⚡
        </div>

        <div className="text-gray-400 mb-6">
          Amazing work. Keep your streak alive tomorrow.
        </div>

        <button
          onClick={() => {
            setIndex(0)
            setVisible(2)
            setXp(0)
            setCompleted(false)
          }}
          className="px-6 py-3 bg-blue-500 rounded-xl hover:scale-105 transition"
        >
          Train Again
        </button>

      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-4 relative">

      {/* XP POP */}
      {showXP && (
        <div className="absolute top-16 text-green-400 text-xl font-bold animate-bounce">
          +10 XP ⚡
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 text-center">

        <div style={{ color: "#ffffff" }} className="text-sm mb-1 font-medium">
          Card {index + 1} of {cards.length}
        </div>

        <div style={{ color: "#ffffff" }} className="text-sm">
          Tap the card to reveal more words
        </div>

      </div>

      {/* PROGRESS */}
      <div className="w-full max-w-md mb-6">
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* CARD */}
      <div
        onClick={reveal}
        className={`w-full max-w-xl p-6 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl cursor-pointer transition-all
        ${pressed ? "scale-[0.97]" : "hover:scale-[1.02]"}`}
      >

        <div className="text-2xl md:text-3xl font-bold text-white text-center leading-relaxed">

          {words.map((word, i) => (
            <span
              key={i}
              style={{ color: i < visible ? "#ffffff" : "#6b7280" }}
              className="inline-block mx-1 my-1"
            >
              {i < visible ? word : "_____"}
            </span>
          ))}

        </div>

      </div>

      {/* NEXT BUTTON */}
      {visible >= words.length && (
        <button
          onClick={next}
          className="mt-8 px-6 py-3 bg-blue-500 rounded-xl hover:scale-105 active:scale-95 transition"
        >
          Next →
        </button>
      )}

      {/* XP */}
      <div className="mt-6 text-blue-400 text-sm">
        ⚡ {xp} XP
      </div>

    </div>
  )
}
