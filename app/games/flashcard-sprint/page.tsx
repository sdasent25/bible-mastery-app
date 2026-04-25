'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getFlashcards, type Flashcard, updateFlashcardProgress } from '@/lib/flashcards'
import { getSubscriptionStatus } from '@/lib/user'
import { addXp, getXp } from '@/lib/xp'

const SESSION_LENGTH = 10
const CORRECT_XP = 5

function formatStatusLabel(status: Flashcard['status']) {
  if (status === 'mastered') {
    return 'Mastered'
  }

  if (status === 'learning') {
    return 'Learning'
  }

  return 'New'
}

function buildSprintDeck(cards: Flashcard[]) {
  const ordered = [...cards].sort((left, right) => {
    const leftDue = left.due_date ? new Date(left.due_date).getTime() : Number.MIN_SAFE_INTEGER
    const rightDue = right.due_date ? new Date(right.due_date).getTime() : Number.MIN_SAFE_INTEGER

    if (leftDue !== rightDue) {
      return leftDue - rightDue
    }

    return left.createdAt?.localeCompare(right.createdAt || '') || 0
  })

  if (ordered.length <= SESSION_LENGTH) {
    return ordered
  }

  return ordered.slice(0, SESSION_LENGTH)
}

export default function FlashcardSprintPage() {
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [isProPlusUser, setIsProPlusUser] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [feedbackTone, setFeedbackTone] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isAnswering, setIsAnswering] = useState(false)

  useEffect(() => {
    async function initialize() {
      const { isProPlus } = await getSubscriptionStatus()
      setIsProPlusUser(isProPlus)
      setLoadingPlan(false)

      if (!isProPlus) {
        return
      }

      setLoadingData(true)
      const [loadedFlashcards, loadedXp] = await Promise.all([
        getFlashcards(),
        getXp()
      ])

      setFlashcards(loadedFlashcards)
      setSessionCards(buildSprintDeck(loadedFlashcards))
      setTotalXp(loadedXp)
      setLoadingData(false)
    }

    initialize()
  }, [])

  const sessionFinished = sessionCards.length > 0 && currentIndex >= sessionCards.length
  const currentCard = sessionFinished ? null : sessionCards[currentIndex] || null
  const progressCount = Math.min(currentIndex + (currentCard ? 1 : 0), sessionCards.length)
  const progressPercent = sessionCards.length > 0 ? (currentIndex / sessionCards.length) * 100 : 0

  useEffect(() => {
    if (loadingData || sessionCards.length === 0 || sessionFinished) {
      return
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [loadingData, sessionCards.length, sessionFinished])

  const cardClasses = useMemo(() => {
    if (feedbackTone === 'correct') {
      return 'bg-emerald-100/90 ring-4 ring-emerald-300 scale-[1.01]'
    }

    if (feedbackTone === 'incorrect') {
      return 'bg-rose-100/90 ring-4 ring-rose-200 scale-[1.01]'
    }

    return 'bg-white/95'
  }, [feedbackTone])

  function resetSession(nextCards = flashcards) {
    setSessionCards(buildSprintDeck(nextCards))
    setCurrentIndex(0)
    setShowAnswer(false)
    setCorrectCount(0)
    setSessionXp(0)
    setElapsedSeconds(0)
    setFeedbackTone('idle')
    setFeedbackMessage('')
    setIsAnswering(false)
  }

  function handleShowAnswer() {
    setShowAnswer(true)
  }

  async function handleAnswer(result: 'correct' | 'review') {
    if (!currentCard || isAnswering) {
      return
    }

    setIsAnswering(true)
    const updatedCard = await updateFlashcardProgress(
      currentCard,
      result === 'correct' ? 'easy' : 'again'
    )

    let nextTotalXp = totalXp
    let xpEarned = 0

    if (result === 'correct') {
      nextTotalXp = await addXp(CORRECT_XP)
      xpEarned = CORRECT_XP
      setCorrectCount((count) => count + 1)
      setSessionXp((currentXp) => currentXp + CORRECT_XP)
      setTotalXp(nextTotalXp)
      setFeedbackTone('correct')
      setFeedbackMessage('Nice! +XP 🎉')
    } else {
      setFeedbackTone('incorrect')
      setFeedbackMessage('Keep going 💪')
    }

    let nextFlashcards = flashcards
    let nextSessionCards = sessionCards

    if (updatedCard) {
      nextFlashcards = flashcards.map((flashcard) =>
        flashcard.id === updatedCard.id ? updatedCard : flashcard
      )
      nextSessionCards = sessionCards.map((flashcard) =>
        flashcard.id === updatedCard.id ? updatedCard : flashcard
      )
      setFlashcards(nextFlashcards)
      setSessionCards(nextSessionCards)
    }

    window.setTimeout(() => {
      setCurrentIndex((index) => index + 1)
      setShowAnswer(false)
      setFeedbackTone('idle')
      setFeedbackMessage('')
      setIsAnswering(false)

      if (!updatedCard && xpEarned === 0) {
        return
      }
    }, 420)
  }

  function formatElapsed(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  if (loadingPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <p className="text-lg text-slate-100">Loading sprint...</p>
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
            Flashcard Sprint
          </h1>
          <p className="mt-2 text-base text-gray-600">
            How fast can you recall?
          </p>
          <p className="mt-6 text-lg font-semibold text-gray-900">
            Unlock Game Training with Pro+
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing?source=link_upgrade"
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-black"
            >
              Upgrade to Pro+
            </Link>
            <Link
              href="/games"
              className="w-full rounded-xl border border-gray-300 px-5 py-3 text-center font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Back to Games
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <p className="text-lg text-slate-100">Loading your sprint deck...</p>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-white shadow-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Flashcard Sprint</h1>
          <p className="mt-2 text-slate-300">How fast can you recall?</p>
          <p className="mt-8 text-lg font-semibold">Create a few flashcards first to start playing.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/flashcards"
              className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Open Flashcards
            </Link>
            <Link
              href="/games"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Games
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (sessionFinished) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-white shadow-2xl">
          <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Sprint Complete
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Flashcard Sprint</h1>
          <p className="mt-2 text-lg text-slate-300">How fast can you recall?</p>

          <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Correct</p>
              <p className="mt-2 text-3xl font-bold">{correctCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">XP Earned</p>
              <p className="mt-2 text-3xl font-bold text-amber-300">+{sessionXp}</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Time</p>
              <p className="mt-2 text-3xl font-bold">{formatElapsed(elapsedSeconds)}</p>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => resetSession()}
              className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Play Again
            </button>
            <Link
              href="/games"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Games
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_60%)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Game Training</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Flashcard Sprint</h1>
          <p className="mt-3 text-base text-slate-300 md:text-lg">How fast can you recall?</p>
        </header>

        <section className="grid grid-cols-2 gap-3 text-white md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Timer</p>
            <p className="mt-2 text-2xl font-bold">{formatElapsed(elapsedSeconds)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Progress</p>
            <p className="mt-2 text-2xl font-bold">{currentIndex + 1} / {sessionCards.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Correct</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">{correctCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">XP Total</p>
            <p className="mt-2 text-2xl font-bold text-amber-300">{totalXp}</p>
          </div>
        </section>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {currentCard && (
          <section className="mx-auto max-w-3xl">
            <div
              className={`rounded-[2rem] border border-white/10 p-6 text-slate-950 shadow-2xl transition-all duration-300 md:p-8 ${cardClasses}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  {formatStatusLabel(currentCard.status)}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  Card {progressCount} of {sessionCards.length}
                </span>
              </div>

              <div className="mt-10 min-h-56">
                <p className="text-center text-2xl font-extrabold leading-relaxed text-slate-950 md:text-3xl">
                  {showAnswer ? currentCard.reference : currentCard.verse}
                </p>
              </div>

              <div className="mt-6 flex min-h-8 items-center justify-center">
                <p
                  className={`text-center text-base font-semibold transition-all duration-200 ${
                    feedbackTone === 'correct'
                      ? 'text-emerald-700 opacity-100'
                      : feedbackTone === 'incorrect'
                        ? 'text-rose-700 opacity-100'
                        : 'opacity-0'
                  }`}
                >
                  {feedbackMessage || 'Ready'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {!showAnswer ? (
                <button
                  type="button"
                  onClick={handleShowAnswer}
                  className="rounded-xl bg-amber-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  Show Answer
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleAnswer('correct')}
                    disabled={isAnswering}
                    className="rounded-xl bg-emerald-500 px-5 py-4 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {isAnswering ? 'Saving...' : 'Got it right'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswer('review')}
                    disabled={isAnswering}
                    className="rounded-xl bg-rose-500 px-5 py-4 font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    {isAnswering ? 'Saving...' : 'Need to review'}
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        <div className="text-center">
          <Link href="/games" className="text-sm font-semibold text-slate-300 transition hover:text-white">
            Back to Games
          </Link>
        </div>
      </div>
    </div>
  )
}
