'use client'

import { useEffect, useState } from 'react'
import { getFlashcards } from '@/lib/flashcards'

type Question = {
  original: string
  words: string[]
  hiddenIndexes: number[]
}

export default function FillGame() {
  const [cards, setCards] = useState<any[]>([])
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [useTimer, setUseTimer] = useState(false)
  const [time, setTime] = useState(15)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await getFlashcards()
    setCards(data)
    generateQuestion(data)
  }

  function generateQuestion(data: any[]) {
    if (data.length === 0) return

    const card = data[Math.floor(Math.random() * data.length)]
    const words = card.verse.split(' ')

    let hideCount = 2
    if (card.status === 'learning') hideCount = Math.floor(words.length * 0.4)
    if (card.status === 'mastered') hideCount = Math.floor(words.length * 0.7)

    const hiddenIndexes: number[] = []

    while (hiddenIndexes.length < hideCount) {
      const index = Math.floor(Math.random() * words.length)
      if (!hiddenIndexes.includes(index)) {
        hiddenIndexes.push(index)
      }
    }

    setQuestion({
      original: card.verse,
      words,
      hiddenIndexes
    })

    setAnswers({})
    setShowResult(false)
  }

  function handleSubmit() {
    setShowResult(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">Fill in the Blank</h1>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useTimer}
              onChange={() => setUseTimer(!useTimer)}
            />
            Enable Timer
          </label>
        </div>

        {question && (
          <div className="bg-white p-6 rounded-xl shadow">

            <p className="text-lg leading-relaxed">
              {question.words.map((word, index) => {
                if (question.hiddenIndexes.includes(index)) {
                  return (
                    <input
                      key={index}
                      value={answers[index] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [index]: e.target.value })
                      }
                      className="border-b-2 border-gray-400 mx-1 w-24 text-center"
                    />
                  )
                }

                return <span key={index} className="mx-1">{word}</span>
              })}
            </p>

            <button
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Submit
            </button>

            {showResult && (
              <div className="mt-4">
                {question.words.map((word, index) => {
                  if (!question.hiddenIndexes.includes(index)) return null

                  const user = answers[index] || ''
                  const correct = user.toLowerCase() === word.toLowerCase()

                  return (
                    <div key={index} className={correct ? 'text-green-600' : 'text-red-600'}>
                      {word}
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
