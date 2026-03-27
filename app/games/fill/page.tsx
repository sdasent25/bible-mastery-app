'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getFlashcards, type Flashcard } from '@/lib/flashcards'
import { getSubscriptionStatus } from '@/lib/user'

type FillQuestion = {
  cardId: string
  reference: string
  words: string[]
  hiddenIndexes: number[]
}

const ROUND_LENGTH = 10
const DEFAULT_TIME = 15

function pickHiddenIndexes(words: string[], status: Flashcard['status']) {
  const safeIndexes = words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => word.trim().length > 0)

  let hideCount = 2

  if (status === 'learning') {
    hideCount = Math.max(2, Math.floor(words.length * 0.35))
  }

  if (status === 'mastered') {
    hideCount = Math.max(3, Math.floor(words.length * 0.6))
  }

  hideCount = Math.min(hideCount, safeIndexes.length)

  const shuffled = [...safeIndexes].sort(() => Math.random() - 0.5)
  return shuffled
    .slice(0, hideCount)
    .map(({ index }) => index)
}

function buildQuestion(card: Flashcard): FillQuestion | null {
  if (!card.verse) return null

  const words = card.verse.split(' ').filter(Boolean)

  if (words.length === 0) return null

  return {
    cardId: card.id,
    reference: card.reference,
    words,
    hiddenIndexes: pickHiddenIndexes(words, card.status)
  }
}

export default function FillGame() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)

  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  const [question, setQuestion] = useState<FillQuestion | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    async function init() {
      await getSubscriptionStatus()
      const data = await getFlashcards()
      setCards(data)
      setLoading(false)
    }

    init()
  }, [])

  function startGame() {
    if (cards.length === 0) return

    setStarted(true)
    setRound(1)
    setScore(0)
    setStreak(0)

    generateQuestion(cards)
  }

  function generateQuestion(data: Flashcard[]) {
    const shuffled = [...data].sort(() => Math.random() - 0.5)

    for (const card of shuffled) {
      const q = buildQuestion(card)
      if (q) {
        setQuestion(q)
        setAnswers({})
        setShowResult(false)
        return
      }
    }
  }

  function handleSubmit() {
    if (!question) return

    let correct = 0

    question.hiddenIndexes.forEach((i) => {
      if ((answers[i] || '').toLowerCase() === question.words[i].toLowerCase()) {
        correct++
      }
    })

    if (correct === question.hiddenIndexes.length) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
    }

    setShowResult(true)
  }

  function nextQuestion() {
    if (round >= 10) {
      setStarted(false)
      return
    }

    setRound((r) => r + 1)
    generateQuestion(cards)
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  if (!started) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Fill in the Blank</h1>
        <button onClick={startGame} className="bg-blue-600 text-white px-6 py-3 rounded">
          Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4">Score: {score} | 🔥 {streak}</div>

      {question && (
        <div>
          <p className="mb-4">
            {question.words.map((w, i) =>
              question.hiddenIndexes.includes(i) ? (
                <input
                  key={i}
                  value={answers[i] || ''}
                  onChange={(e) =>
                    setAnswers({ ...answers, [i]: e.target.value })
                  }
                  className="border-b mx-1"
                />
              ) : (
                <span key={i} className="mx-1">{w}</span>
              )
            )}
          </p>

          {!showResult ? (
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
              Submit
            </button>
          ) : (
            <button onClick={nextQuestion} className="bg-black text-white px-4 py-2 rounded">
              Next
            </button>
          )}
        </div>
      )}
    </div>
  )
}