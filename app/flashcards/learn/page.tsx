"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getFlashcards } from "@/lib/flashcards"

const STOP_WORDS = new Set([
  "the", "and", "of", "so", "he", "she", "it", "in", "to", "a", "is", "was",
  "were", "be", "been", "being", "that", "this", "these", "those", "for",
  "on", "at", "by", "from", "with", "as", "an", "but", "if", "or", "nor", "not",
])

type Flashcard = {
  id: string
  verse_text: string
  reference: string
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/[^\w]/g, "").trim()
}

function tokenizeVerse(verse: string) {
  return verse.split(" ").map((token) => ({
    original: token,
    clean: normalizeWord(token),
  }))
}

function getEligibleIndices(tokens: { original: string; clean: string }[]) {
  return tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.clean.length > 2 && !STOP_WORDS.has(token.clean))
    .map(({ index }) => index)
}

function getRandomIndices(pool: number[], count: number) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, pool.length)).sort((a, b) => a - b)
}

export default function FlashcardsLearnPage() {
  const router = useRouter()

  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [mascot, setMascot] = useState<"idle" | "happy" | "sad">("idle")
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([])
  const [inputs, setInputs] = useState<string[]>([])
  const [fullVerseInput, setFullVerseInput] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)

  const tapSound = useRef<HTMLAudioElement | null>(null)
  const correctSound = useRef<HTMLAudioElement | null>(null)
  const wrongSound = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getFlashcards()
      setFlashcards((data || []) as Flashcard[])
    }

    load()
  }, [])

  useEffect(() => {
    tapSound.current = new Audio("/sounds/tap.mp3")
    correctSound.current = new Audio("/sounds/correct.mp3")
    wrongSound.current = new Audio("/sounds/wrong.mp3")
  }, [])

  const card = flashcards[index]

  const tokens = useMemo(() => {
    if (!card) return []
    return tokenizeVerse(card.verse_text)
  }, [card])

  const eligibleIndices = useMemo(() => {
    return getEligibleIndices(tokens)
  }, [tokens])

  useEffect(() => {
    if (!card || tokens.length === 0) return

    let nextHidden: number[] = []

    if (step === 0) {
      nextHidden = getRandomIndices(eligibleIndices, 2)
    } else if (step === 1) {
      nextHidden = getRandomIndices(
        eligibleIndices,
        Math.max(2, Math.ceil(eligibleIndices.length / 2))
      )
    } else {
      nextHidden = []
    }

    setHiddenIndices(nextHidden)
    setInputs(new Array(nextHidden.length).fill(""))
    setFullVerseInput("")
    setFeedback(null)
  }, [card, step, eligibleIndices, tokens.length])

  if (!flashcards.length) {
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

        <div className="px-4 py-10 text-center text-white/80">
          No flashcards yet
        </div>
      </div>
    )
  }

  function renderPrompt() {
    if (step === 2) {
      return (
        <div className="p-6 rounded-2xl bg-neutral-900 text-white text-center border border-neutral-700 min-h-[160px] flex items-center justify-center text-lg leading-relaxed">
          Type the full verse from memory
        </div>
      )
    }

    return (
      <div className="p-6 rounded-2xl bg-neutral-900 text-white text-center border border-neutral-700 min-h-[180px] flex flex-wrap items-center justify-center gap-2 text-lg leading-relaxed">
        {tokens.map((token, tokenIndex) => {
          const isHidden = hiddenIndices.includes(tokenIndex)

          if (!isHidden) {
            return (
              <span key={`token-${tokenIndex}`} className="text-white">
                {token.original}
              </span>
            )
          }

          return (
            <span
              key={`blank-${tokenIndex}`}
              className="inline-flex items-center justify-center min-w-[84px] h-11 px-3 rounded-xl border border-blue-500 bg-blue-500/10 text-blue-200 text-base font-medium"
            >
              blank
            </span>
          )
        })}
      </div>
    )
  }

  function normalizeText(text: string) {
    return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim()
  }

  function handleInputChange(value: string, inputIndex: number) {
    setInputs((prev) => {
      const next = [...prev]
      next[inputIndex] = value
      return next
    })
  }

  function nextCard() {
    setIndex((prev) => (prev + 1) % flashcards.length)
    setStep(0)
    setMascot("idle")
    setHiddenIndices([])
    setInputs([])
    setFullVerseInput("")
    setFeedback(null)
  }

  function handleSubmit() {
    tapSound.current?.play().catch(() => undefined)

    if (step < 2) {
      const correctAnswers = hiddenIndices.map((hiddenIndex) => tokens[hiddenIndex]?.clean || "")
      const userAnswers = inputs.map((value) => normalizeWord(value))

      const isCorrect =
        correctAnswers.length === userAnswers.length &&
        correctAnswers.every((answer, i) => userAnswers[i] === answer)

      if (isCorrect) {
        correctSound.current?.play().catch(() => undefined)
        setFeedback("correct")
        setMascot("happy")

        setTimeout(() => {
          setMascot("idle")
          setFeedback(null)
          if (step < 2) {
            setStep((prev) => prev + 1)
          }
        }, 800)
      } else {
        wrongSound.current?.play().catch(() => undefined)
        setFeedback("wrong")
        setMascot("sad")

        setTimeout(() => {
          setMascot("idle")
        }, 800)
      }

      return
    }

    const isFullVerseCorrect =
      normalizeText(fullVerseInput) === normalizeText(card.verse_text)

    if (isFullVerseCorrect) {
      correctSound.current?.play().catch(() => undefined)
      setFeedback("correct")
      setMascot("happy")

      setTimeout(() => {
        setMascot("idle")
        nextCard()
      }, 800)
    } else {
      wrongSound.current?.play().catch(() => undefined)
      setFeedback("wrong")
      setMascot("sad")

      setTimeout(() => {
        setMascot("idle")
      }, 800)
    }
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
        <div className="flex justify-center">
          <img
            src={
              mascot === "idle"
                ? "/flame-idle.png"
                : mascot === "happy"
                ? "/flame-happy.png"
                : "/flame-sad.png"
            }
            className="w-16 h-16 object-contain animate-float transition-all duration-300"
            alt="mascot"
          />
        </div>

        <h1 className="text-2xl font-bold text-white text-center">
          Active Recall
        </h1>

        <p className="text-center text-white/80 text-sm">
          Fill in the missing parts of the verse
        </p>

        {renderPrompt()}

        {step < 2 ? (
          <div className={`grid gap-3 ${inputs.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
            {inputs.map((value, inputIndex) => (
              <input
                key={`input-${inputIndex}`}
                value={value}
                onChange={(e) => handleInputChange(e.target.value, inputIndex)}
                placeholder={`Missing word ${inputIndex + 1}`}
                className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:border-blue-500 text-base"
              />
            ))}
          </div>
        ) : (
          <textarea
            value={fullVerseInput}
            onChange={(e) => setFullVerseInput(e.target.value)}
            placeholder="Type the full verse..."
            className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:border-blue-500 text-base min-h-[140px]"
          />
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

        {step < 2 && (
          <p className="text-center text-white/70 text-sm">
            Enter the missing words in order
          </p>
        )}

        {step === 2 && (
          <p className="text-center text-white/70 text-sm">
            Type the full verse as accurately as you can
          </p>
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
