'use client'

import { useState } from 'react'

const sections = [
  {
    title: 'Pentateuch',
    books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']
  },
  {
    title: 'History',
    books: [
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
      'Ezra', 'Nehemiah', 'Esther'
    ]
  },
  {
    title: 'Poetry & Wisdom',
    books: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon']
  },
  {
    title: 'Major Prophets',
    books: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel']
  },
  {
    title: 'Minor Prophets',
    books: [
      'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
      'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
    ]
  },

  // NEW TESTAMENT

  {
    title: 'Gospels',
    books: ['Matthew', 'Mark', 'Luke', 'John']
  },
  {
    title: 'Acts',
    books: ['Acts']
  },
  {
    title: "Paul's Letters",
    books: [
      'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
      'Ephesians', 'Philippians', 'Colossians',
      '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon'
    ]
  },
  {
    title: 'General Letters',
    books: [
      'Hebrews', 'James', '1 Peter', '2 Peter',
      '1 John', '2 John', '3 John', 'Jude'
    ]
  },
  {
    title: 'Revelation',
    books: ['Revelation']
  }
]

export default function BooksGame() {
  const [gameSections, setGameSections] = useState(
    sections.map(section => ({
      ...section,
      books: [...section.books].sort(() => Math.random() - 0.5)
    }))
  )

  const [result, setResult] = useState<string | null>(null)

  function moveUp(sectionIndex: number, index: number) {
    if (index === 0) return

    const updated = [...gameSections]
    const books = [...updated[sectionIndex].books]

    ;[books[index], books[index - 1]] = [books[index - 1], books[index]]

    updated[sectionIndex].books = books
    setGameSections(updated)
  }

  function moveDown(sectionIndex: number, index: number) {
    const books = gameSections[sectionIndex].books
    if (index === books.length - 1) return

    const updated = [...gameSections]
    const newBooks = [...books]

    ;[newBooks[index], newBooks[index + 1]] = [newBooks[index + 1], newBooks[index]]

    updated[sectionIndex].books = newBooks
    setGameSections(updated)
  }

  function checkOrder() {
    const isCorrect = gameSections.every(section =>
      section.books.every((book, i) =>
        book === sections.find(s => s.title === section.title)?.books[i]
      )
    )

    setResult(isCorrect ? 'correct' : 'wrong')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Books of the Bible
        </h1>

        {gameSections.map((section, sIndex) => (
          <div key={section.title} className="mb-6">

            <h2 className="text-lg font-bold text-blue-700 mb-3">
              {section.title}
            </h2>

            <div className="space-y-2">
              {section.books.map((book, i) => (
                <div
                  key={book}
                  className="flex justify-between items-center p-4 bg-white rounded-xl border text-gray-900 font-semibold"
                >
                  <span>{book}</span>

                  <div className="flex gap-2">
                    <button onClick={() => moveUp(sIndex, i)}>⬆️</button>
                    <button onClick={() => moveDown(sIndex, i)}>⬇️</button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}

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
            Not quite — keep going 💪
          </p>
        )}

      </div>
    </div>
  )
}
