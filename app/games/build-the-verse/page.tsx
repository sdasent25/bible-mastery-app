"use client"

import { useEffect, useMemo, useState } from "react"
import GameHeader from "@/components/GameHeader"
import InstructionModal from "@/components/InstructionModal"
import { getDifficulty, getFlashcards, type Flashcard, prioritizeFlashcards, updateFlashcardProgress } from "@/lib/flashcards"
import { addXp, getXp } from "@/lib/xp"

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

function getHiddenIndexes(tokens: string[], difficulty: "easy" | "medium" | "hard") {
  const allIndexes = tokens.map((_, index) => index)
  const eligibleIndexes = tokens
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => normalizeWord(word).length >= 4)
    .sort((left, right) => normalizeWord(right.word).length - normalizeWord(left.word).length)
    .map(({ index }) => index)

  if (difficulty === "hard") {
    return allIndexes
  }

  if (difficulty === "medium") {
    const targetCount = Math.max(1, Math.ceil(tokens.length / 2))
    const pool = eligibleIndexes.length > 0 ? eligibleIndexes : allIndexes

    return shuffle(pool)
      .slice(0, Math.min(targetCount, pool.length))
      .sort((left, right) => left - right)
  }

  const targetCount = Math.min(
    3,
    Math.max(1, Math.ceil(tokens.length / 6))
  )
  const pool = eligibleIndexes.length > 0 ? eligibleIndexes : allIndexes

  return pool
    .slice(0, Math.min(targetCount, pool.length))
    .sort((left, right) => left - right)
}

export default function BuildTheVersePage() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [current, setCurrent] = useState<Flashcard | null>(null)
  const [tokens, setTokens] = useState<string[]>([])
  const [hiddenIndexes, setHiddenIndexes] = useState<number[]>([])
  const [bank, setBank] = useState<AnswerToken[]>([])
  const [answer, setAnswer] = useState<AnswerToken[]>([])
  const [checked, setChecked] = useState(false)
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [awarded, setAwarded] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [initialTotal, setInitialTotal] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [data, xp] = await Promise.all([
          getFlashcards(),
          getXp(),
        ])
        const sorted = prioritizeFlashcards(data)

        const sample = sorted.slice(0, 5)
        setCards(sample)
        setInitialTotal(sample.length)
        setTotalXp(xp)
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
    const difficulty = getDifficulty(card)
    const nextHiddenIndexes = getHiddenIndexes(t, difficulty)

    setCurrent(card)
    setTokens(t)
    setHiddenIndexes(nextHiddenIndexes)
    setBank(shuffle(nextHiddenIndexes.map((idx) => ({ word: t[idx], idx }))))
    setAnswer([])
    setChecked(false)
    setWasCorrect(null)
    setAwarded(false)
  }, [cards])

  const availableBank = useMemo(() => {
    const used = new Set(answer.map((item) => item.idx))
    return bank.filter((item) => !used.has(item.idx))
  }, [answer, bank])

  const hiddenIndexMap = useMemo(() => {
    return new Map(hiddenIndexes.map((tokenIndex, index) => [tokenIndex, index]))
  }, [hiddenIndexes])

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

    const userWords = tokens.map((word, index) => {
      const answerIndex = hiddenIndexMap.get(index)

      if (answerIndex === undefined) {
        return word.toLowerCase().replace(/[^\w']/g, "")
      }

      return (answer[answerIndex]?.word || "")
        .toLowerCase()
        .replace(/[^\w']/g, "")
    })

    const isCorrect =
      correctWords.length === userWords.length &&
      correctWords.every((word, index) => word === userWords[index])

    setChecked(true)
    setWasCorrect(isCorrect)

    if (!awarded) {
      if (isCorrect) {
        await updateFlashcardProgress(current, "easy")
        const xpResult = await addXp({
          amount: 6,
          source: "build_verse",
          cardId: current.id,
        })

        if (xpResult.success) {
          setSessionXp((currentXp) => currentXp + 6)
          setTotalXp(xpResult.xp)
        }
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

  const progress = initialTotal > 0 ? initialTotal - cards.length + 1 : 0
  const total = initialTotal || cards.length

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
    <>
      <InstructionModal
        title="Build the Verse"
        storageKey="buildVerseSeen"
        steps={[
          "Rebuild the verse in the correct order",
          "Tap words to place them",
          "Tap again to remove",
          "XP only for correct answers",
        ]}
      />

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

        <GameHeader
          reference={current.reference}
          progress={progress}
          total={total}
          sessionXp={sessionXp}
          totalXp={totalXp}
        />

        <div className="bg-gray-800 rounded-2xl p-6 mb-6 min-h-[120px]">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            {getDifficulty(current)} mode
          </div>

          <div className="flex flex-wrap gap-2">
            {tokens.map((token, tokenIndex) => {
              const answerIndex = hiddenIndexMap.get(tokenIndex)

              if (answerIndex === undefined) {
                return (
                  <span
                    key={`${token}-${tokenIndex}`}
                    className="rounded bg-gray-700 px-3 py-1 text-gray-200"
                  >
                    {token}
                  </span>
                )
              }

              const selectedWord = answer[answerIndex]

              if (!selectedWord) {
                return (
                  <button
                    key={`blank-${tokenIndex}`}
                    type="button"
                    disabled
                    className="min-w-[64px] rounded border border-dashed border-gray-500 px-3 py-1 text-gray-400"
                  >
                    __
                  </button>
                )
              }

              return (
                <button
                  key={`${selectedWord.idx}-${answerIndex}`}
                  onClick={() => removeWord(answerIndex)}
                  className="bg-blue-500 px-3 py-1 rounded"
                >
                  {selectedWord.word}
                </button>
              )
            })}
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
    </>
  )
}
