"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getFlashcards } from "@/lib/flashcards"

const STOP_WORDS = [
  "the", "and", "of", "to", "a", "is", "in", "that", "he", "she", "it", "so", "for", "on", "with", "as", "was"
]

function isMeaningful(word: string) {
  return !STOP_WORDS.includes(word.toLowerCase())
}

function getValidIndices(words: string[]) {
  return words
    .map((w: string, i: number) => (isMeaningful(w) ? i : null))
    .filter((i): i is number => i !== null)
}

function getRandomIndicesFromValid(words: string[], count: number) {
  const valid = getValidIndices(words)
  const shuffled = [...valid].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(valid.length, count))
}

export default function FlashcardsLearnPage() {
  const router = useRouter()

  const [flashcards, setFlashcards] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [input, setInput] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([])
  const [inputs, setInputs] = useState<string[]>([])
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
      setHiddenIndices(getRandomIndicesFromValid(words, 2))
      return
    }

    if (step === 1) {
      setHiddenIndices(getRandomIndicesFromValid(words, Math.ceil(words.length / 2)))
      return
    }

    setHiddenIndices([])
  }, [index, step, flashcards])

  useEffect(() => {
    if (hiddenIndices.length) {
      setInputs(new Array(hiddenIndices.length).fill(""))
    } else {
      setInputs([])
    }
  }, [hiddenIndices])

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
  }

  function getAnswer() {
    const verseWords = card.verse_text.split(" ")
    return hiddenIndices.map(i => verseWords[i]).join(" ")
  }

  function handleSubmit() {
    tapSound.current?.play().catch(() => {})

    const verseWords = card.verse_text.split(" ")
    const correctWords = hiddenIndices.map((i: number) => verseWords[i])

    const normalizedCorrect = step === 2
      ? [normalize(card.verse_text)]
      : correctWords.map((w: string) => normalize(w))
    const normalizedUser = step === 2
      ? [normalize(input)]
      : inputs.map((w: string) => normalize(w))

    const isCorrect = step === 2
      ? normalizedCorrect[0].includes(normalizedUser[0]) || normalizedUser[0].includes(normalizedCorrect[0])
      : normalizedCorrect.every((word: string, i: number) =>
          normalizedUser[i] === word
        )

    if (isCorrect) {
      correctSound.current?.play().catch(() => {})
      setFeedback("correct")

      setTimeout(() => {
        setInput("")
        setInputs([])
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
    setInputs([])
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

        <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-700 min-h-[160px] flex flex-wrap gap-2 justify-center text-lg leading-relaxed">
          {step === 2 ? (
            <span>{getPrompt()}</span>
          ) : (
            words.map((word: string, i: number) =>
              hiddenIndices.includes(i) ? (
                <span
                  key={i}
                  className="px-2 py-1 border-b-2 border-blue-500 min-w-[40px] text-center"
                >
                  _____
                </span>
              ) : (
                <span key={i}>{word}</span>
              )
            )
          )}
        </div>

        {step === 2 ? (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none text-base"
          />
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {inputs.map((val: string, i: number) => (
              <input
                key={i}
                value={val}
                onChange={(e) => {
                  const updated = [...inputs]
                  updated[i] = e.target.value
                  setInputs(updated)
                }}
                className="w-20 p-2 text-center rounded-lg bg-neutral-900 border border-neutral-700 text-white"
              />
            ))}
          </div>
        )}

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
