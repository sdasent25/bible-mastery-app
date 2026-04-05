"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getFlashcards } from "@/lib/flashcards"

function getRandomIndices(length: number, count: number) {
  const indices = new Set<number>()
  const target = Math.min(length, count)

  while (indices.size < target) {
    indices.add(Math.floor(Math.random() * length))
  }

  return Array.from(indices)
}

export default function FlashcardsLearnPage() {
  const router = useRouter()

  const [flashcards, setFlashcards] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [input, setInput] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([])
  const tapSound = useRef<HTMLAudioElement | null>(null)
  const correctSound = useRef<HTMLAudioElement | null>(null)
  const wrongSound = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    tapSound.current = new Audio("/sounds/tap.mp3")
    correctSound.current = new Audio("/sounds/correct.mp3")
    wrongSound.current = new Audio("/sounds/wrong.mp3")
  }, [])

  useEffect(() => {
    async function load() {
      const data = await getFlashcards()
      setFlashcards(data || [])
    }

    load()
  }, [])

  function normalize(text: string) {
    return text.toLowerCase().replace(/[^\w\s]/g, "").trim()
  }

  useEffect(() => {
    if (!flashcards.length) return

    const words = flashcards[index]?.verse_text.split(" ") || []

    if (step === 0) {
      setHiddenIndices(getRandomIndices(words.length, 2))
      return
    }

    if (step === 1) {
      setHiddenIndices(getRandomIndices(words.length, Math.ceil(words.length / 2)))
      return
    }

    setHiddenIndices([])
  }, [index, step, flashcards])

  if (!flashcards.length) {
    return (
      <div className="text-center text-gray-400 mt-10">
        No flashcards yet
      </div>
    )
  }

  const card = flashcards[index]
  const words = card.verse_text.split(" ")

  function getPrompt() {
    if (step === 2) {
      return "Type the full verse"
    }

    return words.map((word, i) =>
      hiddenIndices.includes(i) ? "_____" : word
    ).join(" ")
  }

  function getAnswer() {
    const verseWords = card.verse_text.split(" ")
    return hiddenIndices.map(i => verseWords[i]).join(" ")
  }

  function handleSubmit() {
    tapSound.current?.play().catch(() => {})

    const correctWords = hiddenIndices.map(i => words[i])
    const userWords = input.split(" ")

    const correct = step === 2
      ? [normalize(card.verse_text)]
      : correctWords.map(w => normalize(w))
    const user = step === 2
      ? [normalize(input)]
      : userWords.map(w => normalize(w))

    const isCorrect = step === 2
      ? correct[0].includes(user[0]) || user[0].includes(correct[0])
      : correct.every((word) => user.includes(word))

    if (isCorrect) {
      correctSound.current?.play().catch(() => {})
      setFeedback("correct")

      setTimeout(() => {
        setInput("")
        setFeedback(null)

        if (step < 2) {
          setStep(step + 1)
        } else {
          nextCard()
        }
      }, 800)
    } else {
      wrongSound.current?.play().catch(() => {})
      setFeedback("wrong")
    }
  }

  function nextCard() {
    setIndex((prev) => (prev + 1) % flashcards.length)
    setStep(0)
    setInput("")
    setFeedback(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/flashcards")}
          className="text-sm text-gray-300"
        >
          ← Flashcards
        </button>

        <div className="text-sm text-white/80">
          Learn
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-xl mx-auto w-full space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">
          Active Recall
        </h1>

        <p className="text-center text-white/80 text-sm">
          Fill in the missing parts of the verse
        </p>

        <div className="p-6 rounded-2xl bg-neutral-900 text-white text-center border border-neutral-700 min-h-[200px] flex items-center justify-center text-lg leading-relaxed">
          {getPrompt()}
        </div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none text-base"
        />

        {feedback === "correct" && (
          <div className="text-green-400 text-center font-semibold">
            Correct ✅
          </div>
        )}

        {feedback === "wrong" && (
          <div className="text-red-400 text-center font-semibold">
            Try again
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 py-4 rounded-xl font-semibold"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
