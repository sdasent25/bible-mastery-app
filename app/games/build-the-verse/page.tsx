"use client"

import { useEffect, useMemo, useState } from "react"
import { getFlashcards, type Flashcard, updateFlashcardProgress } from "@/lib/flashcards"
import { addXp } from "@/lib/xp"

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function tokenize(text: string) {
  return text.split(/\s+/).filter(Boolean)
}

function normalizeWord(w: string) {
  return w.toLowerCase().replace(/[^\w']/g, "")
}

type AnswerToken = {
  word: string
  idx: number
}

export default function BuildTheVersePage() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [current, setCurrent] = useState<Flashcard | null>(null)
  const [tokens, setTokens] = useState<string[]>([])
  const [bank, setBank] = useState<AnswerToken[]>([])
  const [answer, setAnswer] = useState<AnswerToken[]>([])
  const [checked, setChecked] = useState(false)
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [awarded, setAwarded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFlashcards()

        const sorted = [...data].sort((a, b) => {
          const da = a.due_date ? new Date(a.due_date).getTime() : new Date(0).getTime()
          const db = b.due_date ? new Date(b.due_date).getTime() : new Date(0).getTime()
          return da - db
        })

        const sample = sorted.slice(0, 5)
        setCards(sample)
      } catch (error) {
        console.error("Failed to load flashcards", error)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (!cards.length) return

    const card = cards[0]
    const t = tokenize(card.verse_text || "")

    setCurrent(card)
    setTokens(t)
    setBank(shuffle(t.map((word, idx) => ({ word, idx }))))
    setAnswer([])
    setChecked(false)
    setWasCorrect(null)
    setAwarded(false)
  }, [cards])

  const availableBank = useMemo(() => {
    const used = new Set(answer.map((item) => item.idx))
    return bank.filter((item) => !used.has(item.idx))
  }, [answer, bank])

  function addWord(word: string, idx: number) {
    if (checked) return
    setAnswer((prev) => [...prev, { word, idx }])
  }

  function removeWord(i: number) {
    if (checked) return
    setAnswer((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function checkAnswer() {
    if (!current) return

    const correctWords = tokens.map((w) =>
      w.toLowerCase().replace(/[^\w']/g, "")
    )

    const userWords = answer.map((a) =>
      a.word.toLowerCase().replace(/[^\w']/g, "")
    )

    const isCorrect =
      correctWords.length === userWords.length &&
      correctWords.every((word, index) => word === userWords[index])

    setChecked(true)
    setWasCorrect(isCorrect)

    if (!awarded) {
      if (isCorrect) {
        await updateFlashcardProgress(current, "easy")
        await addXp({
          amount: 6,
          source: "build_verse",
          cardId: current.id,
        })
      } else {
        await updateFlashcardProgress(current, "again")
      }
      setAwarded(true)
    }
  }

  function nextCard() {
    setWasCorrect(null)
    setCards((prev) => prev.slice(1))
  }

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  if (!current) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">Build the Verse</h1>
        <p>No cards available.</p>
      </div>
    )
  }

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <button
        onClick={() => window.location.href = "/flashcards"}
        className="mb-4 text-sm text-gray-300"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">
        Build the Verse
      </h1>

      <div className="text-sm text-blue-400 mb-4">
        {current.reference}
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 mb-6 min-h-[120px]">
        <div className="flex flex-wrap gap-2">
          {answer.map((a, i) => (
            <button
              key={`${a.idx}-${i}`}
              onClick={() => removeWord(i)}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              {a.word}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {availableBank.map((w) => (
          <button
            key={w.idx}
            onClick={() => addWord(w.word, w.idx)}
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
          >
            {w.word}
          </button>
        ))}
      </div>

      {!checked ? (
        <button
          onClick={checkAnswer}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Check
        </button>
      ) : (
        <div className="space-y-3">
          {wasCorrect ? (
            <div className="text-green-400 font-semibold">
              Correct!
            </div>
          ) : (
            <div className="text-red-400 font-semibold">
              Not quite — try again
            </div>
          )}

          <div>
            <div className="text-sm text-gray-400">Correct answer:</div>
            <div className="mt-1 text-gray-200">
              {tokens.join(" ")}
            </div>
          </div>

          <button
            onClick={nextCard}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
