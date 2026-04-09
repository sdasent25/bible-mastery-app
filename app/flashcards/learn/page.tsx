"use client"

import { useState } from "react"

export default function LearnMode() {
  const verse = {
    text: "Trust in the Lord with all your heart and lean not on your own understanding",
    ref: "Proverbs 3:5",
  }

  const words = verse.text.split(" ")

  const [visible, setVisible] = useState(2)
  const [xp, setXp] = useState(0)
  const [showXP, setShowXP] = useState(false)

  const percent = (visible / words.length) * 100

  const reveal = () => {
    if (visible < words.length) {
      setVisible((v) => Math.min(v + 2, words.length))
      setXp((x) => x + 10)

      setShowXP(true)
      setTimeout(() => setShowXP(false), 600)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-4 relative">

      {/* XP POP */}
      {showXP && (
        <div className="absolute top-16 text-green-400 text-lg font-bold animate-bounce">
          +10 XP ⚡
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 text-center">

        <div className="text-xs text-gray-400 mb-1">
          Card 1 of 10
        </div>

        <div className="text-sm text-gray-400">
          Tap the card to reveal more words
        </div>

        <div className="text-base text-blue-400 font-medium mt-2">
          {verse.ref}
        </div>

      </div>

      {/* PROGRESS */}
      <div className="w-full max-w-md mb-6">
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* CARD */}
      <div
        onClick={reveal}
        className="w-full max-w-xl p-6 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl cursor-pointer active:scale-[0.98] transition"
      >

        <div className="text-xs text-gray-400 mb-3 text-center">
          Memorize this verse
        </div>

        <div className="text-xl md:text-2xl font-semibold leading-relaxed text-center">

          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block mx-1 my-1 px-1"
            >
              {i < visible ? word : "_____"}
            </span>
          ))}

        </div>

      </div>

      {/* XP */}
      <div className="mt-6 text-blue-400 text-sm">
        ⚡ {xp} XP earned
      </div>

    </div>
  )
}
