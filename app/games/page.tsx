'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSubscriptionStatus } from '@/lib/user'

const games = [
  {
    title: 'Flashcard Sprint',
    description: 'Move fast through verse recall rounds built for quick memorization reps.'
  },
  {
    title: 'Fill-in-the-Blank',
    description: 'Complete missing words from scripture passages to sharpen precise recall.'
  },
  {
    title: 'Match Verse → Reference',
    description: 'Pair each verse with its correct reference through rapid matching challenges.'
  }
]

export default function GamesPage() {
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

  if (loadingPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-lg text-gray-700">Loading games...</p>
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
            Game Training
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Train your mind through interactive challenges
          </p>
          <p className="mt-6 text-lg font-semibold text-gray-900">
            Unlock Game Training with Pro+
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
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Game Training
          </h1>
          <p className="mt-2 text-base text-gray-600 md:text-lg">
            Train your mind through interactive challenges
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {games.map((game) => (
            <article key={game.title} className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-md">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{game.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{game.description}</p>
              </div>
              <button
                type="button"
                className="mt-6 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-black"
              >
                Play
              </button>
            </article>
          ))}
        </section>

        <div className="text-center">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-600 transition hover:text-gray-900">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
