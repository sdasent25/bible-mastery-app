You are fixing and stabilizing the Fill-in-the-Blank game page in a Next.js App Router app.

GOAL:
- Use saved flashcards as the source
- Start a 10-question round
- Always render a question after Start Game
- Show a clear empty state if no flashcards exist
- Keep the UI clean, readable, and engaging
- Remove fragile logic and replace the entire file

IMPORTANT:
- Return the FULL FILE ONLY
- Do not return explanations
- Do not use snippets
- Keep the existing imports unless replaced below

FILE: /app/games/fill/page.tsx

REPLACE THE ENTIRE FILE WITH:

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
    .sort((a, b) => a - b)
}

function buildQuestion(card: Flashcard): FillQuestion | null {
  const verseText = card.verse?.trim()

  if (!verseText) {
    return null
  }

  const words = verseText.split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return null
  }

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

  const [useTimer, setUseTimer] = useState(false)
  const [time, setTime] = useState(DEFAULT_TIME)

  const hasCards = cards.length > 0

  useEffect(() => {
    async function init() {
      await getSubscriptionStatus()
      const data = await getFlashcards()
      setCards(data)
      setLoading(false)
    }

    init()
  }, [])

  useEffect(() => {
    if (!started || !useTimer || !question || showResult) return

    const interval = window.setInterval(() => {
      setTime((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          handleSubmit()
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [started, useTimer, question, showResult])

  const progressPercent = useMemo(() => {
    return (round / ROUND_LENGTH) * 100
  }, [round])

  function generateQuestionFromCards(sourceCards: Flashcard[]) {
    if (sourceCards.length === 0) {
      setQuestion(null)
      return
    }

    const shuffled = [...sourceCards].sort(() => Math.random() - 0.5)

    for (const card of shuffled) {
      const nextQuestion = buildQuestion(card)
      if (nextQuestion) {
        setQuestion(nextQuestion)
        setAnswers({})
        setShowResult(false)
        setTime(DEFAULT_TIME)
        return
      }
    }

    setQuestion(null)
  }

  function startGame() {
    if (!hasCards) return

    setStarted(true)
    setRound(1)
    setScore(0)
    setStreak(0)
    generateQuestionFromCards(cards)
  }

  function handleSubmit() {
    if (!question) return

    let correctCount = 0

    question.hiddenIndexes.forEach((index) => {
      const userAnswer = (answers[index] || '').trim().toLowerCase()
      const correctAnswer = question.words[index].trim().toLowerCase()

      if (userAnswer === correctAnswer) {
        correctCount += 1
      }
    })

    const isPerfect = correctCount === question.hiddenIndexes.length

    if (isPerfect) {
      setScore((current) => current + 1)
      setStreak((current) => current + 1)
    } else {
      setStreak(0)
    }

    setShowResult(true)
  }

  function nextQuestion() {
    if (round >= ROUND_LENGTH) {
      setStarted(false)
      setQuestion(null)
      return
    }

    setRound((current) => current + 1)
    generateQuestionFromCards(cards)
  }

  function restartGame() {
    setStarted(false)
    setRound(1)
    setScore(0)
    setStreak(0)
    setQuestion(null)
    setAnswers({})
    setShowResult(false)
    setTime(DEFAULT_TIME)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-lg font-semibold text-gray-900">Loading game...</p>
      </div>
    )
  }

  if (!hasCards) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-extrabold text-gray-900">Fill in the Blank</h1>
          <p className="mt-3 text-base text-gray-700">
            You need at least one saved flashcard before this game can start.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/flashcards"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Flashcards
            </Link>
            <Link
              href="/games"
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Back to Games
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-extrabold text-gray-900">Fill in the Blank</h1>
          <p className="mt-3 text-base text-gray-700">
            Use your saved flashcards to complete missing words and strengthen recall.
          </p>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setUseTimer((current) => !current)}
              className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              {useTimer ? '⏱ Timer On' : '⏱ Timer Off'}
            </button>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={startGame}
              className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
            >
              Start Game
            </button>
          </div>

          <p className="mt-4 text-sm font-medium text-gray-600">
            10 questions · built from your own flashcards
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow">
            Question {round} / {ROUND_LENGTH}
          </div>
          <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow">
            Score: {score}
          </div>
          <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 shadow">
            🔥 {streak} streak
          </div>
        </div>

        {useTimer && (
          <div className="mb-4 text-center text-base font-bold text-red-600">
            ⏱ {time}s
          </div>
        )}

        {question ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Reference
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">{question.reference}</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <div className="flex flex-wrap items-center justify-center gap-y-3 text-lg font-medium leading-relaxed text-gray-900">
                {question.words.map((word, index) => {
                  if (question.hiddenIndexes.includes(index)) {
                    return (
                      <input
                        key={index}
                        value={answers[index] || ''}
                        onChange={(event) =>
                          setAnswers((current) => ({
                            ...current,
                            [index]: event.target.value
                          }))
                        }
                        className="mx-1 w-24 rounded-none border-0 border-b-2 border-blue-500 bg-transparent px-1 py-1 text-center font-bold text-gray-900 outline-none focus:border-blue-700"
                      />
                    )
                  }

                  return (
                    <span key={index} className="mx-1">
                      {word}
                    </span>
                  )
                })}
              </div>
            </div>

            {!showResult ? (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-2xl bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            ) : (
              <div className="mt-6 text-center">
                <p className="text-xl font-extrabold text-gray-900">
                  {streak > 0 ? 'Nice! 🎉' : 'Keep going 💪'}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  You can keep building memory with the next verse.
                </p>

                <div className="mt-5 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="rounded-2xl bg-gray-900 px-6 py-3 font-bold text-white transition hover:bg-black"
                  >
                    {round >= ROUND_LENGTH ? 'See Results' : 'Next'}
                  </button>
                  <button
                    type="button"
                    onClick={restartGame}
                    className="rounded-2xl border border-gray-300 px-6 py-3 font-bold text-gray-900 transition hover:bg-gray-100"
                  >
                    Restart
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center shadow">
            <p className="text-lg font-semibold text-gray-900">Preparing your question...</p>
          </div>
        )}
      </div>
    </div>
  )
}