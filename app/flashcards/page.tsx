"use client"

import { useRouter } from "next/navigation"

export default function FlashcardsHome() {
  const router = useRouter()

  return (
    <div className="min-h-screen px-4 py-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Flashcards
      </h1>

      <div
        onClick={() => router.push("/flashcards/review")}
        className="bg-blue-600 hover:bg-blue-500 transition rounded-2xl p-6 cursor-pointer text-center"
      >
        <h2 className="text-xl font-semibold text-white">
          Start Daily Training
        </h2>
        <p className="text-sm text-blue-100 mt-1">
          Review your flashcards and build memory
        </p>
      </div>

      <div className="space-y-3">
        <div
          onClick={() => router.push("/flashcards/learn")}
          className="bg-neutral-900 hover:bg-neutral-800 transition rounded-xl p-4 cursor-pointer border border-neutral-700"
        >
          <h3 className="text-white font-semibold">Learn</h3>
          <p className="text-sm text-gray-400">
            Memorize scripture step by step
          </p>
        </div>

        <div
          onClick={() => router.push("/flashcards/review")}
          className="bg-neutral-900 hover:bg-neutral-800 transition rounded-xl p-4 cursor-pointer border border-neutral-700"
        >
          <h3 className="text-white font-semibold">Review Flashcards</h3>
          <p className="text-sm text-gray-400">
            Go through all your flashcards
          </p>
        </div>

        <div
          onClick={() => router.push("/flashcards/practice")}
          className="bg-neutral-900 hover:bg-neutral-800 transition rounded-xl p-4 cursor-pointer border border-neutral-700"
        >
          <h3 className="text-white font-semibold">Practice Weak Cards</h3>
          <p className="text-sm text-gray-400">
            Focus on the ones you struggle with
          </p>
        </div>

        <div
          onClick={() => router.push("/flashcards/create")}
          className="bg-neutral-900 hover:bg-neutral-800 transition rounded-xl p-4 cursor-pointer border border-neutral-700"
        >
          <h3 className="text-white font-semibold">Add Flashcard</h3>
          <p className="text-sm text-gray-400">
            Add your own verses to learn
          </p>
        </div>
      </div>
    </div>
  )
}
