'use client'

import Link from 'next/link'

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Games
        </h1>

        <div className="space-y-4">

          <Link
            href="/games/fill"
            className="block p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Fill in the Blank
            </h2>
            <p className="text-gray-700 mt-2">
              Test your memory by filling in missing words
            </p>
          </Link>

          <div className="p-6 bg-gray-200 rounded-2xl border border-gray-300">
            <h2 className="text-xl font-bold text-gray-700">
              Flashcard Sprint
            </h2>
            <p className="text-gray-600 mt-2">
              Coming soon
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
