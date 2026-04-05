"use client"

import { useState, useEffect } from "react"
import { updateFlashcardStatus } from "@/lib/flashcards"
import { addXp } from "@/lib/xp"

export default function FlashcardStudy({
  flashcards,
  messages,
}: {
  flashcards: Array<{ id: string; reference: string; verse_text: string }>
  messages: Record<string, string>
}) {
  const SESSION_SIZE = 10

  const [session, setSession] = useState<Array<{ id: string; reference: string; verse_text: string }>>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [complete, setComplete] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (flashcards.length) {
      const shuffled = [...flashcards].sort(() => 0.5 - Math.random())
      setSession(shuffled.slice(0, SESSION_SIZE))
      setIndex(0)
      setComplete(false)
    } else {
      setSession([])
      setIndex(0)
      setComplete(false)
    }
  }, [flashcards])

  const card = session[index]

  useEffect(() => {
    setFlipped(false)
  }, [index])

  useEffect(() => {
    if (index >= session.length && session.length > 0) {
      setIndex(0)
    }
  }, [session.length, index])

  if (!session.length && !complete) {
    return (
      <div className="text-center text-gray-400">
        {messages.no_flashcards}
      </div>
    )
  }

  if (complete) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Session Complete 🎉</h2>

        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 px-6 py-3 rounded-xl font-semibold"
        >
          Start New Session
        </button>
      </div>
    )
  }

  function nextCard(newSession: Array<{ id: string; reference: string; verse_text: string }>) {
    if (newSession.length === 0) {
      setComplete(true)
      return
    }

    setIndex(0)
  }

  async function handleAnswer(type: "again" | "hard" | "easy") {
    setAnimating(true)
    let newSession = [...session]
    let xpToAdd = 0

    if (type === "again") {
      const current = newSession.splice(index, 1)[0]
      newSession.splice(1, 0, current)
      xpToAdd = 0
    }

    if (type === "hard") {
      const current = newSession.splice(index, 1)[0]
      newSession.push(current)
      xpToAdd = 1
    }

    if (type === "easy") {
      newSession.splice(index, 1)
      xpToAdd = 2
    }

    updateFlashcardStatus(card.id, type).catch(console.error)

    if (xpToAdd > 0) {
      addXp(xpToAdd, "flashcards").catch(console.error)
    }

    setTimeout(() => {
      setSession(newSession)
      setAnimating(false)
      nextCard(newSession)
    }, 150)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 text-center">
        {session.length} remaining
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className={`p-6 rounded-2xl bg-neutral-900 text-white cursor-pointer min-h-[240px] flex items-center justify-center text-center border border-neutral-700 transition-all duration-200 ${animating ? "scale-95 opacity-70" : ""}`}
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
