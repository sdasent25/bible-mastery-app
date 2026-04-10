"use client"

import { useState } from "react"

export default function LearnMode() {
  const verses = [
    "Trust in the Lord with all your heart and lean not on your own understanding",
    "I can do all things through Christ who strengthens me",
    "The Lord is my shepherd I shall not want",
    "Be strong and courageous do not be afraid",
    "Your word is a lamp to my feet and a light to my path",
    "Cast all your anxiety on Him because He cares for you",
    "Rejoice always pray without ceasing",
    "Love one another as I have loved you",
    "Seek first the kingdom of God",
    "Walk by faith not by sight",
  ]

  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(2)
  const [xp, setXp] = useState(0)
  const [completed, setCompleted] = useState(false)

  const words = verses[index].split(" ")

  const percent = ((index + 1) / verses.length) * 100

  const reveal = () => {
    if (visible < words.length) {
      setVisible((v) => Math.min(v + 2, words.length))
    }
  }

  const next = () => {
    setXp((x) => x + 10)

    if (index < verses.length - 1) {
      setIndex((i) => i + 1)
      setVisible(2)
    } else {
      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6">
        <h1 className="text-3xl font-bold mb-4">🔥 Session Complete</h1>

        <div className="text-green-400 text-xl mb-4">
          +{xp} XP ⚡
        </div>

        <button
          onClick={() => {
            setIndex(0)
            setVisible(2)
            setXp(0)
            setCompleted(false)
          }}
          className="px-6 py-3 bg-blue-500 rounded-xl"
        >
          Train Again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-4">

      {/* HEADER */}
      <div className="mb-6 text-center">

        <div style={{ color: "#ffffff" }} className="text-sm mb-1 font-medium">
          Card {index + 1} of {verses.length}
        </div>

        <div style={{ color: "#ffffff" }} className="text-sm">
          Tap the card to reveal more words
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

        <div className="text-2xl font-bold text-white text-center">

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
          className="mt-8 px-6 py-3 bg-blue-500 rounded-xl hover:scale-105 transition"
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
