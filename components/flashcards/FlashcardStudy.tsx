"use client"

import { useState, useEffect } from "react"
import { updateFlashcardStatus } from "@/lib/flashcards"

export default function FlashcardStudy({
  flashcards,
  messages,
}: {
  flashcards: Array<{ id: string; reference: string; verse_text: string }>
  messages: Record<string, string>
}) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [animating, setAnimating] = useState(false)

  const card = flashcards[index]

  useEffect(() => {
    setFlipped(false)
  }, [index])

  useEffect(() => {
    if (index >= flashcards.length && flashcards.length > 0) {
      setIndex(0)
    }
  }, [flashcards.length, index])

  if (!flashcards.length) {
    return (
      <div className="text-center text-gray-400">
        {messages.no_flashcards}
      </div>
    )
  }

  function nextCard() {
    setIndex((prev) => (prev + 1) % flashcards.length)
  }

  async function handleAnswer(type: "again" | "hard" | "easy") {
    setAnimating(true)

    try {
      await updateFlashcardStatus(card.id, type)
    } catch (err) {
      console.error(err)
    }

    setTimeout(() => {
      nextCard()
      setAnimating(false)
    }, 200)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 text-center">
        {messages.progress}: {index + 1} / {flashcards.length}
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className={`p-6 rounded-2xl bg-neutral-900 text-white cursor-pointer min-h-[240px] flex items-center justify-center text-center border border-neutral-700 transition-all duration-200 ${animating ? "scale-95 opacity-70" : "hover:scale-[1.01]"}`}
      >
        <div className="text-lg leading-relaxed">
          {flipped ? card.reference : card.verse_text}
        </div>
      </div>

      {flipped && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAnswer("again")}
            className="bg-red-500 py-3 rounded-xl font-semibold active:scale-95"
          >
            {messages.didnt_know}
          </button>

          <button
            onClick={() => handleAnswer("hard")}
            className="bg-amber-500 py-3 rounded-xl font-semibold active:scale-95 text-black"
          >
            {messages.almost}
          </button>

          <button
            onClick={() => handleAnswer("easy")}
            className="bg-blue-600 py-3 rounded-xl font-semibold active:scale-95"
          >
            {messages.got_it}
          </button>
        </div>
      )}
    </div>
  )
}
