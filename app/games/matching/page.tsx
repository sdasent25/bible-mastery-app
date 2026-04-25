"use client"

import { useEffect, useState } from "react"
import GameHeader from "@/components/GameHeader"
import InstructionModal from "@/components/InstructionModal"
import { getDifficulty, getFlashcards, prioritizeFlashcards, type Flashcard, updateFlashcardProgress } from "@/lib/flashcards"
import { addXp, getXp } from "@/lib/xp"

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function MatchingGamePage() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [left, setLeft] = useState<Flashcard[]>([])
  const [right, setRight] = useState<Flashcard[]>([])
  const [selectedLeft, setSelectedLeft] = useState<Flashcard | null>(null)
  const [selectedRight, setSelectedRight] = useState<Flashcard | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [data, xp] = await Promise.all([
          getFlashcards(),
          getXp(),
        ])
        const ordered = prioritizeFlashcards(data)
        const difficulty = ordered[0] ? getDifficulty(ordered[0]) : "medium"
        const pairCount = difficulty === "easy" ? 3 : difficulty === "hard" ? 5 : 4
        const sample = ordered.slice(0, pairCount)

        setCards(sample)
        setLeft(sample)
        setRight(shuffle(sample))
        setTotalXp(xp)
      } catch (error) {
        console.error("Failed to load flashcards", error)
        setCards([])
        setLeft([])
        setRight([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleMatch = async (leftCard: Flashcard, rightCard: Flashcard) => {
    if (checking) {
      return
    }

    setChecking(true)

    try {
      if (leftCard.id === rightCard.id) {
        setMatched((prev) => [...prev, leftCard.id])

        await updateFlashcardProgress(leftCard, "easy")

        const xpResult = await addXp({
          amount: 3,
          source: "matching",
          cardId: leftCard.id,
        })

        if (xpResult.success) {
          setSessionXp((currentXp) => currentXp + 3)
          setTotalXp(xpResult.xp)
        }
      }
    } catch (error) {
      console.error("Failed to process match", error)
    } finally {
      setSelectedLeft(null)
      setSelectedRight(null)
      setChecking(false)
    }
  }

  useEffect(() => {
    if (!selectedLeft || !selectedRight) {
      return
    }

    void handleMatch(selectedLeft, selectedRight)
  }, [selectedLeft, selectedRight])

  if (loading) {
    return <div className="p-6 text-white">Loading matching game...</div>
  }

  if (!cards.length) {
    return (
      <div className="p-6 text-white max-w-4xl mx-auto">
        <button
          onClick={() => window.location.href = "/flashcards"}
          className="mb-4 text-sm text-gray-300"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-4">
          Matching Game
        </h1>

        <p className="text-gray-300">
          Create a few flashcards first to start matching.
        </p>
      </div>
    )
  }

  const visibleLeft = left.filter((card) => !matched.includes(card.id))
  const visibleRight = right.filter((card) => !matched.includes(card.id))
  const isComplete = matched.length === cards.length
  const progress = matched.length
  const total = cards.length

  return (
    <>
      <InstructionModal
        title="Matching"
        storageKey="matchingSeen"
        steps={[
          "Match verses to references",
          "Tap one from each side",
          "XP only for correct matches",
        ]}
      />

      <div className="p-4 md:p-6 text-white max-w-5xl mx-auto">
        <button
          onClick={() => window.location.href = "/flashcards"}
          className="mb-4 text-sm text-gray-300"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-2">
          Matching Game
        </h1>

        <p className="text-sm text-gray-300 mb-6">
          Match each verse with its reference.
        </p>

        <GameHeader
          progress={progress}
          total={total}
          sessionXp={sessionXp}
          totalXp={totalXp}
        />

        {!!cards.length && (
          <div className="mb-4 inline-flex rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
            {getDifficulty(cards[0])} mode
          </div>
        )}

        {isComplete ? (
          <div className="bg-gray-800 rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">
              All Matched
            </h2>
            <p className="text-gray-300">
              Great job. You matched every card.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {visibleLeft.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedLeft(card)}
                  disabled={checking}
                  className={`w-full rounded-2xl p-4 text-left transition border ${
                    selectedLeft?.id === card.id
                      ? "bg-blue-600 border-blue-400"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  } ${checking ? "opacity-70" : ""}`}
                >
                  <div className="text-base leading-relaxed">
                    {card.verse_text}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visibleRight.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedRight(card)}
                  disabled={checking}
                  className={`w-full rounded-2xl p-4 text-left transition border ${
                    selectedRight?.id === card.id
                      ? "bg-green-600 border-green-400"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  } ${checking ? "opacity-70" : ""}`}
                >
                  <div className="text-base font-medium">
                    {card.reference}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
