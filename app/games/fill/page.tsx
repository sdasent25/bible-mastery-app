'use client'

import { useEffect, useState } from 'react'
import { getFlashcards, type Flashcard } from '@/lib/flashcards'
import { getSubscriptionStatus } from '@/lib/user'
import { updateDailyProgress } from '@/lib/daily'
import { unlockAchievement } from '@/lib/achievements'
import { saveSession } from '@/lib/resume'

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
  const [doubleXP, setDoubleXP] = useState(false)

  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [wordResults, setWordResults] = useState<Record<number, boolean>>({})

  const [missedWords, setMissedWords] = useState<string[]>([])
  const [sessionMissed, setSessionMissed] = useState<string[]>([])

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
    setWordResults({})
  }

  function startGame() {
    if (cards.length === 0) return

    setStarted(true)
    setRound(1)
    setScore(0)
    setStreak(0)
    setXp(0)
    setSessionMissed([])

    generateQuestion(cards)
  }

  function handleSubmit() {
    if (!question) return

    let correct = 0
    const results: Record<number, boolean> = {}

    question.hiddenIndexes.forEach((i) => {
      const user = (answers[i] || '').toLowerCase()
      const actual = question.words[i].toLowerCase()

      const isCorrect = user === actual
      results[i] = isCorrect

      if (isCorrect) {
        correct++
      } else {
        setMissedWords((prev) => [...prev, actual])
        setSessionMissed((prev) => [...prev, actual])
      }
    })

    setWordResults(results)

    const isPerfect = correct === question.hiddenIndexes.length

    if (isPerfect) {
      const xpGain = doubleXP ? 20 : 10
      const nextXp = xp + xpGain
      const nextStreak = streak + 1

      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      setXp((x) => x + xpGain)

      if (nextXp >= 50) {
        unlockAchievement('50 XP Earned')
      }

      if (nextStreak >= 3) {
        unlockAchievement('3 Streak')
      }
    } else {
      setStreak(0)
    }

    updateDailyProgress()
    saveSession({
      game: 'fill',
      round,
      score,
      streak
    })

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
    return <div className="p-10 text-center text-lg font-bold">Loading...</div>
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow text-center">

          <h1 className="text-3xl font-bold mb-4 text-gray-900">Fill in the Blank</h1>

          {sessionMissed.length > 0 && (
            <div className="mb-6">
              <p className="font-semibold mb-2">Review Words:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {sessionMissed.map((w, i) => (
                  <span key={i} className="bg-gray-200 px-2 py-1 rounded">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={startGame}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Start Game
          </button>

          <button
            onClick={() => setDoubleXP((d) => !d)}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            {doubleXP ? 'Disable 2x XP' : 'Enable 2x XP'}
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between mb-6 font-bold text-gray-900">
          <div>Q {round}/10</div>
          <div className="text-blue-600">XP {xp}</div>
          <div className="bg-purple-100 px-4 py-2 rounded-full font-bold text-purple-700 shadow">
            {doubleXP ? '⚡ 2x XP' : 'XP Normal'}
          </div>
          <div>🔥 {streak}</div>
        </div>

        {question && (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">

            <p className="text-xl text-center font-semibold leading-relaxed text-gray-900 opacity-100">

              {question.words.map((w, i) => {
                const isBlank = question.hiddenIndexes.includes(i)
                const isCorrect = wordResults[i]

                if (!isBlank) return <span key={i} className="mx-1 text-gray-900 font-semibold">{w}</span>

                return (
                  <input
                    key={i}
                    value={answers[i] || ''}
                    onChange={(e) =>
                      setAnswers({ ...answers, [i]: e.target.value })
                    }
                    className={`mx-2 w-24 text-center text-lg font-bold border-b-4 text-gray-900 opacity-100 bg-white ${
                      showResult
                        ? isCorrect
                          ? 'border-green-500'
                          : 'border-red-500'
                        : 'border-blue-500'
                    }`}
                  />
                )
              })}

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

                <button
                  onClick={nextQuestion}
                  className="bg-black text-white px-6 py-3 rounded-xl font-bold"
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
