'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { flashcards } from '@/lib/flashcards'
import { getSubscriptionStatus } from '@/lib/user'

export default function FlashcardsPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isProPlusUser, setIsProPlusUser] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(true)

  useEffect(() => {
    async function loadPlan() {
      const { isProPlus } = await getSubscriptionStatus()
      setIsProPlusUser(isProPlus)
      setLoadingPlan(false)
    }

    loadPlan()
  }, [])

  const currentCard = flashcards[currentCardIndex]

  const handleRevealAnswer = () => {
    setShowAnswer(true)
  }

  const handleNextCard = () => {
    setCurrentCardIndex((previousIndex) => (previousIndex + 1) % flashcards.length)
    setShowAnswer(false)
  }

  if (loadingPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-lg text-gray-700">Loading flashcards...</p>
      </div>
    )
  }

  if (!isProPlusUser) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-3xl text-white">
            🔒
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Flashcard Training
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Memorize and master scripture
          </p>
          <p className="mt-6 text-lg font-semibold text-gray-900">
            Unlock Flashcard Training with Pro+
          </p>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            Practice verse recall with a focused card-by-card training flow built for memorization.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href="/upgrade"
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-black"
            >
              Upgrade to Pro+
            </Link>
            <Link
              href="/dashboard"
              className="w-full rounded-xl border border-gray-300 px-5 py-3 text-center font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Flashcard Training
          </h1>
          <p className="mt-2 text-base text-gray-600 md:text-lg">
            Memorize and master scripture
          </p>
        </header>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {currentCard.category}
            </span>
            <span className="text-sm font-medium text-gray-500">
              Card {currentCardIndex + 1} of {flashcards.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRevealAnswer}
            className="flex min-h-80 w-full flex-col justify-between rounded-3xl border border-gray-200 bg-linear-to-br from-white to-slate-50 p-6 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                {showAnswer ? 'Reference' : 'Verse'}
              </p>
            </div>

            <div className="py-6 text-center">
              {showAnswer ? (
                <p className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                  {currentCard.reference}
                </p>
              ) : (
                <p className="text-xl leading-relaxed font-semibold text-gray-900 md:text-2xl">
                  {currentCard.verse}
                </p>
              )}
            </div>

            <p className="text-center text-sm text-gray-500">
              {showAnswer ? 'Tap next to keep training.' : 'Tap the card or use the button to reveal the answer.'}
            </p>
          </button>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleRevealAnswer}
              disabled={showAnswer}
              className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {showAnswer ? 'Answer Shown' : 'Show Answer'}
            </button>
            <button
              type="button"
              onClick={handleNextCard}
              className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Next Card
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/dashboard" className="text-sm font-semibold text-gray-600 transition hover:text-gray-900">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
