"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getFlashcards } from "@/lib/flashcards"

export default function FlashcardsLearnPage() {
  const router = useRouter()

  const [flashcards, setFlashcards] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)

  useEffect(() => {
    async function load() {
      const data = await getFlashcards()
      setFlashcards(data || [])
    }

    load()
  }, [])

  if (!flashcards.length) {
    return (
      <div className="text-center text-gray-400 mt-10">
        No flashcards yet
      </div>
    )
  }

  const card = flashcards[index]
  const words = card.verse_text.split(" ")

  function getDisplayText() {
    if (step === 0) return words.slice(0, 2).join(" ")
    if (step === 1) return words.slice(0, 4).join(" ")
    if (step === 2) return words.slice(0, Math.ceil(words.length / 2)).join(" ")
    return card.verse_text
  }

  function handleNextStep() {
    if (step < 3) {
      setStep(step + 1)
    } else {
      nextCard()
    }
  }

  function nextCard() {
    setIndex((prev) => (prev + 1) % flashcards.length)
    setStep(0)
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
          Learn Step by Step
        </h1>

        <p className="text-center text-white/80 text-sm">
          Reveal the verse gradually and train your memory
        </p>

        <div className="p-6 rounded-2xl bg-neutral-900 text-white text-center border border-neutral-700 min-h-[200px] flex items-center justify-center text-lg leading-relaxed">
          {getDisplayText()}
        </div>

        {step === 3 && (
          <p className="text-center text-gray-400">
            {card.reference}
          </p>
        )}

        <button
          onClick={handleNextStep}
          className="w-full bg-blue-600 py-4 rounded-xl font-semibold"
        >
          {step < 3 ? "Continue" : "Next Verse"}
        </button>
      </div>
    </div>
  )
}
