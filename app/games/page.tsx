'use client'

import Link from 'next/link'

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-6">
          Games
        </h1>

        <div className="grid gap-4">

          <Link href="/games/fill" className="p-6 bg-white rounded-xl shadow hover:shadow-md">
            <h2 className="text-xl font-bold">Fill in the Blank</h2>
            <p className="text-gray-600 mt-2">
              Test your memory by filling in missing words
            </p>
          </Link>

          <div className="p-6 bg-gray-100 rounded-xl opacity-50">
            <h2 className="text-xl font-bold">Flashcard Sprint</h2>
            <p>Coming soon</p>
          </div>

        </div>

      </div>
    </div>
  )
}
