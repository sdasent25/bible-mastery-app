'use client'

import { useEffect, useState } from 'react'
import { getFlashcards, type Flashcard } from '@/lib/flashcards'
import { getSubscriptionStatus } from '@/lib/user'

type Question = {
  words: string[]
  hiddenIndexes: number[]
}

export default function FillGame() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)

  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(0)

  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    async function init() {
      await getSubscriptionStatus()
      const data = await getFlashcards()
      setCards(data)
      setLoading(false)
    }
    init()
  }, [])

  function generateQuestion(data: Flashcard[]) {
    const card = data[Math.floor(Math.random() * data.length)]
    const words = card.verse.split(' ')

    const hideCount =
      card.status === 'mastered'
        ? Math.floor(words.length * 0.6)
        : card.status === 'learning'
        ? Math.floor(words.length * 0.4)
        : 2

    const hiddenIndexes: number[] = []

    while (hiddenIndexes.length < hideCount) {
      const i = Math.floor(Math.random() * words.length)
      if (!hiddenIndexes.includes(i)) hiddenIndexes.push(i)
    }

    setQuestion({ words, hiddenIndexes })
    setAnswers({})
    setShowResult(false)
    setLastCorrect(null)
  }

  function startGame() {
    if (cards.length === 0) return

    setStarted(true)
    setRound(1)
    setScore(0)
    setStreak(0)
    setXp(0)

    generateQuestion(cards)
  }

  function handleSubmit() {
    if (!question) return

    let correct = 0

    question.hiddenIndexes.forEach((i) => {
      if ((answers[i] || '').toLowerCase() === question.words[i].toLowerCase()) {
        correct++
      }
    })

    const isCorrect = correct === question.hiddenIndexes.length

    setLastCorrect(isCorrect)

    if (isCorrect) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      setXp((x) => x + 10)
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl font-bold text-gray-900">Loading game...</p>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full">

          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Fill in the Blank
          </h1>

          <p className="text-gray-700 mb-8">
            Strengthen your memory using your saved verses
          </p>

          <button
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md"
          >
            Start Game
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <div className="bg-white px-4 py-2 rounded-full shadow text-gray-900 font-semibold">
            Q {round}/10
          </div>

          <div className="bg-blue-100 px-4 py-2 rounded-full font-bold text-blue-700 shadow">
            XP {xp}
          </div>

          <div className="bg-orange-100 px-4 py-2 rounded-full font-bold text-orange-600 shadow">
            🔥 {streak}
          </div>

        </div>

        {/* GAME CARD */}
        {question && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">

            <div className="mb-6">
              <p className="text-center text-xl font-semibold text-gray-900 leading-relaxed">

                {question.words.map((word, i) =>
                  question.hiddenIndexes.includes(i) ? (
                    <input
                      key={i}
                      value={answers[i] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [i]: e.target.value })
                      }
                      className="mx-2 w-28 text-center text-lg font-bold border-b-4 border-blue-600 bg-transparent focus:outline-none"
                    />
                  ) : (
                    <span key={i} className="mx-2">{word}</span>
                  )
                )}

              </p>
            </div>

            {!showResult ? (
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow"
                >
                  Submit
                </button>
              </div>
            ) : (
              <div className="text-center">

                {lastCorrect ? (
                  <p className="text-green-600 text-2xl font-extrabold mb-4">
                    Nice! +10 XP 🎉
                  </p>
                ) : (
                  <div className="mb-4">
                    <p className="text-red-600 text-xl font-bold mb-3">
                      Not quite — keep going 💪
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                      {question.hiddenIndexes.map((i) => (
                        <span
                          key={i}
                          className="bg-gray-200 px-3 py-1 rounded-lg font-semibold"
                        >
                          {question.words[i]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={nextQuestion}
                  className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg shadow"
                >
                  Next
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
