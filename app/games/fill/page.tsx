'use client'

import { useEffect, useState } from 'react'
import { getFlashcards } from '@/lib/flashcards'
import { getSubscriptionStatus } from '@/lib/user'

export default function FillGame() {
  const [cards, setCards] = useState<any[]>([])
  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any>({})
  const [showResult, setShowResult] = useState(false)

  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  const [useTimer, setUseTimer] = useState(false)
  const [time, setTime] = useState(15)
  const [loading, setLoading] = useState(true)

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
    if (cards.length > 0 && started && !question) {
      generateQuestionFromData(cards)
    }
  }, [cards, started])

  useEffect(() => {
    if (!useTimer || !started) return

    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          handleSubmit()
          return 15
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [useTimer, started])

function generateQuestionFromData(data: any[]) {
  const card = data[Math.floor(Math.random() * data.length)]
  const words = card.verse.split(' ')

    let hideCount = 2
    if (card.status === 'learning') hideCount = Math.floor(words.length * 0.4)
    if (card.status === 'mastered') hideCount = Math.floor(words.length * 0.7)

    const hiddenIndexes: number[] = []

    while (hiddenIndexes.length < hideCount) {
      const i = Math.floor(Math.random() * words.length)
      if (!hiddenIndexes.includes(i)) hiddenIndexes.push(i)
    }

    setQuestion({ words, hiddenIndexes })
    setAnswers({})
    setShowResult(false)
    setTime(15)
  }

  function startGame() {
    setStarted(true)
    setRound(1)
    setScore(0)
    setStreak(0)
    setQuestion(null)
  }

  function handleSubmit() {
    if (!question) return

    let correctCount = 0

    question.hiddenIndexes.forEach((i: number) => {
      const user = (answers[i] || '').toLowerCase()
      const correct = question.words[i].toLowerCase()

      if (user === correct) correctCount++
    })

    const isCorrect = correctCount === question.hiddenIndexes.length

    if (isCorrect) {
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
    generateQuestionFromData(cards)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading game...</p>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">

          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            Fill in the Blank
          </h1>

          <p className="text-gray-700 mb-6">
            Test your memory and improve recall
          </p>

          <button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
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

          <div className="text-sm font-semibold text-gray-700">
            Question {round} / 10
          </div>

          <div className="text-sm font-semibold text-blue-700">
            Score: {score}
          </div>

          <div className="text-sm font-semibold text-orange-600">
            🔥 {streak}
          </div>

        </div>

        {useTimer && (
          <div className="text-center mb-4 text-red-600 font-bold">
            ⏱ {time}s
          </div>
        )}

        {question && (
          <div className="bg-white p-6 rounded-2xl shadow-md border">

            <p className="text-lg text-center font-medium leading-relaxed">
              {question.words.map((word: string, i: number) => {
                if (question.hiddenIndexes.includes(i)) {
                  return (
                    <input
                      key={i}
                      value={answers[i] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [i]: e.target.value })
                      }
                      className="border-b-2 border-blue-500 mx-1 w-24 text-center font-semibold"
                    />
                  )
                }

                return <span key={i} className="mx-1">{word}</span>
              })}
            </p>

            {!showResult && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Submit
                </button>
              </div>
            )}

            {showResult && (
              <div className="text-center mt-6">

                <p className="text-xl font-bold mb-4">
                  {streak > 0 ? 'Nice! 🎉' : 'Keep going 💪'}
                </p>

                <button
                  onClick={nextQuestion}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold"
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
