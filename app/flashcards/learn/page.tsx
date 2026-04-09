"use client"

import { useState } from "react"

export default function LearnMode() {
  const verses = [
    {
      text: "Trust in the Lord with all your heart and lean not on your own understanding",
      ref: "Proverbs 3:5",
    },
    {
      text: "I can do all things through Christ who strengthens me",
      ref: "Philippians 4:13",
    },
  ]

  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(2)
  const [completed, setCompleted] = useState(false)

  const current = verses[index]
  const words = current.text.split(" ")

  const reveal = () => {
    if (visible < words.length) {
      setVisible((v) => Math.min(v + 2, words.length))
    }
  }

  const next = () => {
    if (index < verses.length - 1) {
      setIndex((i) => i + 1)
      setVisible(2)
    } else {
      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-white bg-black text-center px-6">
        <h1 className="text-3xl font-bold mb-4">🔥 Session Complete</h1>
        <p className="text-gray-400 mb-6">Great work today</p>

        <div className="text-green-400 text-xl mb-4">
          +100 XP ⚡
        </div>

        <button
          onClick={() => {
            setIndex(0)
            setVisible(2)
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
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center"
      onClick={reveal}
    >
      <div className="text-sm text-gray-400 mb-4">
        {current.ref}
      </div>

      <div className="text-2xl font-semibold leading-relaxed max-w-xl">
        {words.slice(0, visible).join(" ")}
      </div>

      {visible >= words.length && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          className="mt-8 px-6 py-3 bg-blue-500 rounded-xl"
        >
          Next
        </button>
      )}
    </div>
  )
}
