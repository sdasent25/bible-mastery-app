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

  const maskedText = words
    .map((word, i) => (i < visible ? word : "_____"))
    .join(" ")

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center relative"
      onClick={reveal}
    >

      {/* XP POP */}
      {showXP && (
        <div className="absolute top-20 text-green-400 text-xl font-bold animate-bounce">
          +10 XP ⚡
        </div>
      )}

      {/* Instruction */}
      <div className="text-sm text-gray-400 mb-2">
        Tap to reveal the verse step-by-step
      </div>

      {/* Reference */}
      <div className="text-sm text-gray-500 mb-4">
        {verse.ref}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-6">
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl">

        <div className="text-xs text-gray-400 mb-3">
          Memorize this verse
        </div>

        <div className="text-3xl md:text-4xl font-semibold leading-relaxed">
          {maskedText}
        </div>

      </div>

      {/* XP Total */}
      <div className="mt-6 text-blue-400 text-sm">
        ⚡ {xp} XP earned
      </div>

    </div>
  )
}
