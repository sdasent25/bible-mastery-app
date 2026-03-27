'use client'

import { useState } from 'react'

const correctOrder = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy'
]

export default function BooksGame() {
  const [books, setBooks] = useState(
    [...correctOrder].sort(() => Math.random() - 0.5)
  )

  const [result, setResult] = useState<string | null>(null)

  function moveUp(index: number) {
    if (index === 0) return

    const newBooks = [...books]
    ;[newBooks[index], newBooks[index - 1]] = [
      newBooks[index - 1],
      newBooks[index]
    ]

    setBooks(newBooks)
  }

  function moveDown(index: number) {
    if (index === books.length - 1) return

    const newBooks = [...books]
    ;[newBooks[index], newBooks[index + 1]] = [
      newBooks[index + 1],
      newBooks[index]
    ]

    setBooks(newBooks)
  }

  function checkOrder() {
    const isCorrect = books.every(
      (b, i) => b === correctOrder[i]
    )

    setResult(isCorrect ? 'correct' : 'wrong')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Order the Books
        </h1>

        <div className="space-y-3">
          {books.map((book, i) => (
            <div
              key={book}
              className="flex justify-between items-center p-4 bg-white rounded-xl border text-gray-900 font-semibold"
            >
              <span>{book}</span>

              <div className="flex gap-2">
                <button onClick={() => moveUp(i)}>⬆️</button>
                <button onClick={() => moveDown(i)}>⬇️</button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={checkOrder}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Check
          </button>
        </div>

        {result === 'correct' && (
          <p className="text-green-600 text-center mt-4 font-bold">
            Perfect! 🎉
          </p>
        )}

        {result === 'wrong' && (
          <p className="text-red-600 text-center mt-4 font-bold">
            Not quite — try again 💪
          </p>
        )}

      </div>
    </div>
  )
}
