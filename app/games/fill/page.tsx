'use client'

import { useEffect, useState } from 'react'
import { getFlashcards } from '@/lib/flashcards'

export default function FillGame() {
  const [cards, setCards] = useState<any[]>([])
  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any>({})
  const [showResult, setShowResult] = useState(false)
  const [useTimer, setUseTimer] = useState(false)

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
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
          Fill in the Blank
        </h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setUseTimer(!useTimer)}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-900 font-semibold"
          >
            {useTimer ? '⏱ Timer ON' : '⏱ Timer OFF'}
          </button>
        </div>

        {question && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">

            <p className="text-lg leading-relaxed font-medium text-gray-900 text-center">
              {question.words.map((word: string, index: number) => {
                if (question.hiddenIndexes.includes(index)) {
                  return (
                    <input
                      key={index}
                      value={answers[index] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [index]: e.target.value })
                      }
                      className="border-b-2 border-blue-500 mx-1 w-24 text-center font-semibold outline-none"
                    />
                  )
                }

                return <span key={index} className="mx-1">{word}</span>
              })}
            </p>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Submit
              </button>
            </div>

            {showResult && (
              <div className="mt-6">

                <h2 className="text-center text-lg font-bold mb-4 text-gray-900">
                  Results
                </h2>

                <div className="space-y-2">
                  {question.words.map((word: string, index: number) => {
                  if (!question.hiddenIndexes.includes(index)) return null

                  const user = answers[index] || ''
                  const correct = user.toLowerCase() === word.toLowerCase()

                  return (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-center font-semibold ${
                          correct
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {word}
                      </div>
                  )
                  })}
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => generateQuestion(cards)}
                    className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    Next Question
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
