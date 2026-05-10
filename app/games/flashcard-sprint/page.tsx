'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import GameHeader from '@/components/GameHeader'
import InstructionModal from '@/components/InstructionModal'
import LockedOverlay from '@/components/LockedOverlay'
import { canAccessFlashcards } from '@/lib/flashcardAccess'
import { getFlashcards, prioritizeFlashcards, type Flashcard, updateFlashcardProgress } from '@/lib/flashcards'
import { type PlanType, getSubscriptionStatus } from '@/lib/user'
import { addXp, getXp } from '@/lib/xp'

const SESSION_LENGTH = 10
const CORRECT_XP = 5
const PREVIEW_SPRINT_CARD = {
  status: 'learning' as Flashcard['status'],
  verse: 'For God so loved the world, that he gave his only Son...',
  reference: 'John 3:16',
}

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
  const ordered = prioritizeFlashcards(cards)

  if (ordered.length <= SESSION_LENGTH) {
    return ordered
  }

  return ordered.slice(0, SESSION_LENGTH)
}

function getFeedbackCopy(result: 'correct' | 'review') {
  return result === 'correct' ? 'One verse stronger.' : 'Keep training.'
}

export default function FlashcardSprintPage() {
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [plan, setPlan] = useState<PlanType>('free')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [feedbackTone, setFeedbackTone] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('Keep training.')
  const [isAnswering, setIsAnswering] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)

  useEffect(() => {
    async function initialize() {
      const { plan } = await getSubscriptionStatus()
      setPlan(plan)
      setLoadingPlan(false)

      if (!canAccessFlashcards(plan)) {
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

    void initialize()
  }, [])

  const sessionFinished = sessionCards.length > 0 && currentIndex >= sessionCards.length
  const currentCard = sessionFinished ? null : sessionCards[currentIndex] || null
  const progressCount = Math.min(currentIndex + (currentCard ? 1 : 0), sessionCards.length)
  const progressPercent = sessionCards.length > 0 ? (currentIndex / sessionCards.length) * 100 : 0
  const isLocked = !canAccessFlashcards(plan)
  const cardsRemaining = Math.max(sessionCards.length - currentIndex, 0)

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
      return 'bg-emerald-100/95 ring-4 ring-emerald-300 scale-[1.01]'
    }

    if (feedbackTone === 'incorrect') {
      return 'bg-rose-100/95 ring-4 ring-rose-200 scale-[1.01]'
    }

    return 'bg-white/95'
  }, [feedbackTone])

  function resetSession(nextCards = flashcards) {
    setSessionCards(buildSprintDeck(nextCards))
    setCurrentIndex(0)
    setRevealed(false)
    setCorrectCount(0)
    setSessionXp(0)
    setElapsedSeconds(0)
    setFeedbackTone('idle')
    setFeedbackMessage('Keep training.')
    setIsAnswering(false)
    setHasAnswered(false)
  }

  async function handleAnswer(result: 'correct' | 'review') {
    if (!currentCard || isAnswering || !revealed) {
      return
    }

    setIsAnswering(true)
    const isFirstAttempt = !hasAnswered
    setHasAnswered(true)

    if (result === 'correct') {
      setCorrectCount((count) => count + 1)

      const xpResult = await addXp({
        amount: CORRECT_XP,
        source: 'flashcards',
        cardId: currentCard.id,
        isFirstAttempt,
      })

      if (xpResult.success) {
        setSessionXp((currentXp) => currentXp + CORRECT_XP)
        setTotalXp(xpResult.xp)
      }

      setFeedbackTone('correct')
    } else {
      setFeedbackTone('incorrect')
    }

    setFeedbackMessage(getFeedbackCopy(result))

    const updatedCard = await updateFlashcardProgress(
      currentCard,
      result === 'correct' ? 'easy' : 'again'
    )

    if (updatedCard) {
      const nextFlashcards = flashcards.map((flashcard) =>
        flashcard.id === updatedCard.id ? updatedCard : flashcard
      )
      const nextSessionCards = sessionCards.map((flashcard) =>
        flashcard.id === updatedCard.id ? updatedCard : flashcard
      )
      setFlashcards(nextFlashcards)
      setSessionCards(nextSessionCards)
    }

    window.setTimeout(() => {
      setCurrentIndex((index) => index + 1)
      setRevealed(false)
      setFeedbackTone('idle')
      setFeedbackMessage('Keep training.')
      setIsAnswering(false)
      setHasAnswered(false)
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

  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <p className="text-lg text-slate-100">Loading your sprint deck...</p>
      </div>
    )
  }

  if (!isLocked && flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-white shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Timed Recall</p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">No sprint cards ready.</h1>
          <p className="mt-3 text-base text-slate-300">
            Add verses to build your sprint deck.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/flashcards/create"
              className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Add Verse
            </Link>
            <Link
              href="/flashcards"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Memory Training
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
            Training Complete
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Memory Sprint</h1>
          <p className="mt-3 text-base text-slate-300">
            Practice fast recall under pressure.
          </p>

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
              Sprint Again
            </button>
            <Link
              href="/flashcards/review"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Review Cards
            </Link>
            <Link
              href="/flashcards"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Memory Training
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <InstructionModal
        title="Memory Sprint"
        storageKey="sprintSeen"
        steps={[
          'Fast recall with your saved verses',
          'Reveal the reference, then judge your recall honestly',
          'Earn Memory XP with eligible first-attempt recall. Daily limits apply.',
        ]}
      />

      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_18%),linear-gradient(180deg,_#1e293b_0%,_#020617_60%)] px-4 py-8 md:px-6 md:py-10">
        <div className={`mx-auto max-w-5xl space-y-8 ${isLocked ? 'pointer-events-none opacity-40' : ''}`}>
          <div className="flex items-center justify-between gap-4">
            <Link href="/flashcards" className="text-sm font-semibold text-slate-300 transition hover:text-white">
              Back to Memory Training
            </Link>
            <Link href="/flashcards/create" className="text-sm font-semibold text-amber-200 transition hover:text-amber-100">
              Add Verse
            </Link>
          </div>

          <header className="text-center text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Timed Recall</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Memory Sprint</h1>
            <p className="mt-3 text-base text-slate-300 md:text-lg">Practice fast recall under pressure.</p>
            <p className="mt-4 text-sm text-slate-400">
              Earn Memory XP with eligible first-attempt recall. Daily limits apply.
            </p>
          </header>

          <section className="grid grid-cols-2 gap-3 text-white md:grid-cols-4">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Remaining</p>
              <p className="mt-2 text-2xl font-bold">{cardsRemaining}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current Card</p>
              <p className="mt-2 text-2xl font-bold">{isLocked ? 1 : progressCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Timer</p>
              <p className="mt-2 text-2xl font-bold">{formatElapsed(elapsedSeconds)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Correct</p>
              <p className="mt-2 text-2xl font-bold text-emerald-300">{correctCount}</p>
            </div>
          </section>

          <GameHeader
            progress={isLocked ? 1 : currentIndex + 1}
            total={isLocked ? SESSION_LENGTH : sessionCards.length}
            sessionXp={sessionXp}
            totalXp={totalXp}
          />

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {(currentCard || isLocked) && (
            <section className="mx-auto max-w-3xl">
              <div
                className={`rounded-[2rem] border border-white/10 p-6 text-slate-950 shadow-2xl transition-all duration-300 md:p-8 ${cardClasses}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    {formatStatusLabel((currentCard ?? PREVIEW_SPRINT_CARD).status)}
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    Card {isLocked ? 1 : progressCount} of {isLocked ? SESSION_LENGTH : sessionCards.length}
                  </span>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Scripture Prompt
                  </p>
                </div>

                <div className="mt-8 min-h-56">
                  <p className="text-center text-2xl font-extrabold leading-relaxed text-slate-950 md:text-3xl">
                    {revealed
                      ? (currentCard ?? PREVIEW_SPRINT_CARD).reference
                      : (currentCard ?? PREVIEW_SPRINT_CARD).verse}
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
                    {feedbackMessage || 'Keep training.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {!revealed && (
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="rounded-xl bg-amber-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-amber-400"
                  >
                    Reveal Reference
                  </button>
                )}

                {revealed && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAnswer('correct')}
                      disabled={isAnswering}
                      className="rounded-xl bg-emerald-500 px-5 py-4 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      {isAnswering ? 'Saving...' : 'I remembered'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswer('review')}
                      disabled={isAnswering}
                      className="rounded-xl bg-rose-500 px-5 py-4 font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-rose-300"
                    >
                      {isAnswering ? 'Saving...' : 'Needs review'}
                    </button>
                  </>
                )}
              </div>
            </section>
          )}

          <div className="text-center">
            <Link href="/flashcards" className="text-sm font-semibold text-slate-300 transition hover:text-white">
              Back to Memory Training
            </Link>
          </div>
        </div>

        {isLocked && (
          <LockedOverlay
            title="Unlock Scripture Memory Training"
            message="Create verse cards, train recall, and strengthen retention."
          />
        )}
      </div>
    </>
  )
}
