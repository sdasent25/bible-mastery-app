"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { updateFlashcardProgress } from "@/lib/flashcards"
import { addXp } from "@/lib/xp"

export default function FlashcardStudy({
  flashcards,
  messages,
}: {
  flashcards: Array<{
    id: string
    reference: string
    verse_text: string
    due_date?: string | null
    ease_factor?: number | null
    interval?: number | null
    repetitions?: number | null
    lapses?: number | null
  }>
  messages: Record<string, string>
}) {
  const router = useRouter()
  const SESSION_SIZE = 10

  const [session, setSession] = useState<Array<{
    id: string
    reference: string
    verse_text: string
    due_date?: string | null
    ease_factor?: number | null
    interval?: number | null
    repetitions?: number | null
    lapses?: number | null
  }>>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [complete, setComplete] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [xpPop, setXpPop] = useState<string | null>(null)

  const tapSound = useRef<HTMLAudioElement | null>(null)
  const correctSound = useRef<HTMLAudioElement | null>(null)
  const wrongSound = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    tapSound.current = new Audio("/sounds/tap.mp3")
    correctSound.current = new Audio("/sounds/correct.mp3")
    wrongSound.current = new Audio("/sounds/wrong.mp3")
  }, [])

  useEffect(() => {
    if (flashcards.length) {
      const prioritized = [...flashcards].sort((a, b) => {
        if (!a.due_date) return -1
        if (!b.due_date) return 1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })

      setSession(prioritized.slice(0, SESSION_SIZE))
      setIndex(0)
      setComplete(false)
    } else {
      setSession([])
      setIndex(0)
      setComplete(false)
    }
  }, [flashcards])

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
      <div className="text-center text-gray-200">
        {messages.no_flashcards}
      </div>
    )
  }

  const card = session[index]

  if (complete) {
    return (
      <div className="text-center space-y-4 mt-10 px-4">
        <h2 className="text-2xl font-bold text-white">Session Complete 🎉</h2>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 py-3 rounded-xl font-semibold"
        >
          Start New Session
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-neutral-700 py-3 rounded-xl font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  function nextCard(newSession: Array<{
    id: string
    reference: string
    verse_text: string
    due_date?: string | null
    ease_factor?: number | null
    interval?: number | null
    repetitions?: number | null
    lapses?: number | null
  }>) {
    if (newSession.length === 0) {
      setComplete(true)
      return
    }

    setIndex(0)
  }

  function handleFlip() {
    tapSound.current?.play().catch(() => {})
    setFlipped(!flipped)
  }

  async function handleAnswer(type: "again" | "hard" | "easy") {
    setAnimating(true)
    let newSession = [...session]
    let xpToAdd = 0

    if (type === "again") {
      const current = newSession.splice(index, 1)[0]
      newSession.splice(1, 0, current)
      xpToAdd = 0
      wrongSound.current?.play().catch(() => {})
    }

    if (type === "hard") {
      const current = newSession.splice(index, 1)[0]
      newSession.push(current)
      xpToAdd = 1
      correctSound.current?.play().catch(() => {})
    }

    if (type === "easy") {
      newSession.splice(index, 1)
      xpToAdd = 2
      correctSound.current?.play().catch(() => {})
    }

    updateFlashcardProgress(card, type).catch(console.error)

    if (xpToAdd > 0) {
      setXpPop(`+${xpToAdd} XP`)
      setTimeout(() => setXpPop(null), 800)
      addXp(xpToAdd, "flashcards").catch(console.error)
    }

    setTimeout(() => {
      setSession(newSession)
      setAnimating(false)
      nextCard(newSession)
    }, 150)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-gray-300"
        >
          ← Dashboard
        </button>

        <div className="text-sm text-gray-300">
          {session.length} left
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 relative max-w-xl mx-auto w-full">
        {xpPop && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-green-400 font-bold animate-bounce">
            {xpPop}
          </div>
        )}

        <div className="mt-2">
          <div
            onClick={handleFlip}
            className="perspective"
          >
          <div
            className={`relative w-full min-h-[260px] transition-transform duration-500 transform-style preserve-3d ${
              flipped ? "rotate-y-180" : ""
            } ${animating ? "scale-95" : ""}`}
          >
            <div className="absolute w-full h-full backface-hidden p-6 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-center border border-neutral-700 text-lg leading-relaxed">
              {card.verse_text}
            </div>

            <div className="absolute w-full h-full backface-hidden rotate-y-180 p-6 rounded-2xl bg-neutral-800 text-white flex items-center justify-center text-center border border-neutral-700">
              {card.reference}
            </div>
          </div>
          </div>
        </div>

        {flipped && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={() => handleAnswer("again")}
              className="bg-red-500 py-4 rounded-xl font-semibold"
            >
              {messages.didnt_know}
            </button>

            <button
              onClick={() => handleAnswer("hard")}
              className="bg-amber-500 py-4 rounded-xl font-semibold text-black"
            >
              {messages.almost}
            </button>

            <button
              onClick={() => handleAnswer("easy")}
              className="bg-blue-600 py-4 rounded-xl font-semibold"
            >
              {messages.got_it}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
