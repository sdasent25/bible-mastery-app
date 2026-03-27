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
    return <div className="p-10 text-center">Loading...</div>
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">

          <h1 className="text-3xl font-bold mb-4">Fill in the Blank</h1>

          <p className="text-gray-600 mb-6">
            Test your memory using your saved flashcards
          </p>

          <button
            onClick={startGame}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Start Game
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6 font-semibold text-gray-800">
          <div>Q {round}/10</div>
          <div className="text-blue-600">XP: {xp}</div>
          <div>🔥 {streak}</div>
        </div>

        {/* CARD */}
        {question && (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">

            <p className="text-lg text-center leading-relaxed text-gray-900 font-medium">
              {question.words.map((w, i) =>
                question.hiddenIndexes.includes(i) ? (
                  <input
                    key={i}
                    value={answers[i] || ''}
                    onChange={(e) =>
                      setAnswers({ ...answers, [i]: e.target.value })
                    }
                    className="border-b-2 border-blue-600 mx-1 w-24 text-center font-bold text-gray-900 bg-transparent focus:outline-none"
                  />
                ) : (
                  <span key={i} className="mx-1">{w}</span>
                )
              )}
            </p>

            {!showResult ? (
              <div className="text-center mt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Submit
                </button>
              </div>
            ) : (
              <div className="text-center mt-6">

                {lastCorrect ? (
                  <p className="text-green-600 text-xl font-bold">
                    Nice! +10 XP 🎉
                  </p>
                ) : (
                  <>
                    <p className="text-red-600 text-xl font-bold">
                      Not quite — keep going 💪
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      Correct answers:
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {question.hiddenIndexes.map((i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-200 rounded text-sm font-semibold"
                        >
                          {question.words[i]}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <button
                  onClick={nextQuestion}
                  className="mt-4 bg-black text-white px-6 py-3 rounded-xl font-bold"
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
