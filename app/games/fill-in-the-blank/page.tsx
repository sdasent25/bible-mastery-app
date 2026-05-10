'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import GameHeader from '@/components/GameHeader'
import InstructionModal from '@/components/InstructionModal'
import LockedOverlay from '@/components/LockedOverlay'
import { canAccessFlashcards } from '@/lib/flashcardAccess'
import { getDifficulty, getFlashcards, prioritizeFlashcards, type Flashcard, updateFlashcardProgress } from '@/lib/flashcards'
import { type PlanType, getSubscriptionStatus } from '@/lib/user'
import { addXp, getXp } from '@/lib/xp'

const CORRECT_XP = 5
const PREVIEW_FILL_TOKENS = ['Trust', 'in', 'the', 'Lord', 'with', 'all', 'your', 'heart']
const PREVIEW_BLANKS = [
  { tokenIndex: 3, answer: 'Lord', hint: 'L___' },
  { tokenIndex: 7, answer: 'heart', hint: 'H____' },
]

type PuzzleBlank = {
  tokenIndex: number
  answer: string
  hint: string
}

type VersePuzzle = {
  tokens: string[]
  blanks: PuzzleBlank[]
}

type RoundState = {
  puzzle: VersePuzzle
  answers: string[]
  blankResults: boolean[]
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, '')
}

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

function buildPuzzle(verse: string, difficulty: 'easy' | 'medium' | 'hard'): VersePuzzle {
  const tokens = verse.trim().split(/\s+/).filter(Boolean)
  const eligibleIndexes = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => normalizeWord(token).length >= 3)
    .map(({ index }) => index)

  const blankCount = difficulty === 'easy'
    ? Math.min(2, Math.max(1, Math.min(eligibleIndexes.length, Math.floor(tokens.length / 6) || 1)))
    : difficulty === 'hard'
      ? Math.min(6, Math.max(3, Math.min(eligibleIndexes.length, Math.ceil(tokens.length / 3) || 3)))
      : Math.min(
          4,
          Math.max(2, Math.min(eligibleIndexes.length, Math.floor(tokens.length / 4) || 2))
        )

  const chosenIndexes = (eligibleIndexes.length > 0 ? shuffle(eligibleIndexes) : tokens.map((_, index) => index))
    .slice(0, Math.min(blankCount, tokens.length))
    .sort((left, right) => left - right)

  return {
    tokens,
    blanks: chosenIndexes.map((tokenIndex) => ({
      tokenIndex,
      answer: tokens[tokenIndex],
      hint: difficulty === 'easy'
        ? `${normalizeWord(tokens[tokenIndex]).charAt(0).toUpperCase()}${'_'.repeat(Math.max(normalizeWord(tokens[tokenIndex]).length - 1, 0))}`
        : difficulty === 'medium'
          ? `${'_'.repeat(Math.max(normalizeWord(tokens[tokenIndex]).length, 1))}`
          : ''
    }))
  }
}

function orderFlashcards(cards: Flashcard[]) {
  return prioritizeFlashcards(cards)
}

function createRound(card: Flashcard): RoundState {
  const puzzle = buildPuzzle(card.verse, getDifficulty(card))

  return {
    puzzle,
    answers: puzzle.blanks.map(() => ''),
    blankResults: puzzle.blanks.map(() => false)
  }
}

function getFeedbackCopy(isCorrect: boolean) {
  return isCorrect ? 'One verse stronger.' : 'Recall grows through repetition.'
}

export default function FillInTheBlankPage() {
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [plan, setPlan] = useState<PlanType>('free')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [round, setRound] = useState<RoundState | null>(null)
  const [checked, setChecked] = useState(false)
  const [feedbackTone, setFeedbackTone] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('Keep training.')
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [hasAwardedXpForCurrent, setHasAwardedXpForCurrent] = useState(false)
  const [hasUpdatedProgressForCurrent, setHasUpdatedProgressForCurrent] = useState(false)

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

      const ordered = orderFlashcards(loadedFlashcards)

      setFlashcards(loadedFlashcards)
      setRound(ordered.length > 0 ? createRound(ordered[0]) : null)
      setTotalXp(loadedXp)
      setLoadingData(false)
    }

    void initialize()
  }, [])

  const orderedFlashcards = useMemo(() => orderFlashcards(flashcards), [flashcards])

  const currentCard = orderedFlashcards.length > 0 && reviewedCount < orderedFlashcards.length
    ? orderedFlashcards[currentIndex]
    : null
  const totalRounds = orderedFlashcards.length
  const sessionFinished = totalRounds > 0 && reviewedCount >= totalRounds
  const isLocked = !canAccessFlashcards(plan)
  const cardsRemaining = Math.max(totalRounds - reviewedCount, 0)

  const blankIndexMap = useMemo(() => {
    return new Map(round?.puzzle.blanks.map((blank, index) => [blank.tokenIndex, index]) || [])
  }, [round])

  function handleAnswerChange(index: number, value: string) {
    setRound((currentRound) => {
      if (!currentRound) {
        return currentRound
      }

      return {
        ...currentRound,
        answers: currentRound.answers.map((answer, answerIndex) => (answerIndex === index ? value : answer))
      }
    })
  }

  async function handleCheckAnswers() {
    if (!round || checked) {
      return
    }

    const results = round.puzzle.blanks.map((blank, index) => {
      return normalizeWord(round.answers[index] || '') === normalizeWord(blank.answer)
    })
    const isCorrect = results.every(Boolean)
    const isFirstAttempt = !hasAnswered

    setChecked(true)
    setHasAnswered(true)
    setRound((currentRound) => {
      if (!currentRound) {
        return currentRound
      }

      return {
        ...currentRound,
        blankResults: results
      }
    })
    setFeedbackTone(isCorrect ? 'correct' : 'incorrect')
    setFeedbackMessage(getFeedbackCopy(isCorrect))

    if (isCorrect && currentCard && !hasAwardedXpForCurrent) {
      const xpResult = await addXp({
        amount: CORRECT_XP,
        source: 'fill_in_the_blank',
        cardId: currentCard.id,
        isFirstAttempt,
      })

      if (xpResult.success) {
        setSessionXp((currentXp) => currentXp + CORRECT_XP)
        setTotalXp(xpResult.xp)
      }

      setCorrectCount((count) => count + 1)
      setHasAwardedXpForCurrent(true)
    }

    if (currentCard && !hasUpdatedProgressForCurrent) {
      const updatedCard = await updateFlashcardProgress(
        currentCard,
        isCorrect ? 'easy' : 'again'
      )

      setFlashcards((currentFlashcards) =>
        currentFlashcards.map((flashcard) =>
          flashcard.id === updatedCard.id ? updatedCard : flashcard
        )
      )
      setHasUpdatedProgressForCurrent(true)
    }
  }

  function handleTryAgain() {
    if (!round) {
      return
    }

    setRound({
      puzzle: round.puzzle,
      answers: round.puzzle.blanks.map(() => ''),
      blankResults: round.puzzle.blanks.map(() => false)
    })
    setChecked(false)
    setFeedbackTone('idle')
    setFeedbackMessage('Keep training.')
    setHasUpdatedProgressForCurrent(false)
  }

  function handleNextVerse() {
    if (orderedFlashcards.length === 0 || !checked) {
      return
    }

    const nextReviewedCount = reviewedCount + 1
    setReviewedCount(nextReviewedCount)

    if (nextReviewedCount >= orderedFlashcards.length) {
      setRound(null)
      return
    }

    const nextIndex = currentIndex + 1
    const nextCard = orderedFlashcards[nextIndex]

    setCurrentIndex(nextIndex)
    setRound(createRound(nextCard))
    setChecked(false)
    setFeedbackTone('idle')
    setFeedbackMessage('Keep training.')
    setHasAnswered(false)
    setHasAwardedXpForCurrent(false)
    setHasUpdatedProgressForCurrent(false)
  }

  const panelClasses = useMemo(() => {
    if (feedbackTone === 'correct') {
      return 'bg-emerald-100/95 ring-4 ring-emerald-300'
    }

    if (feedbackTone === 'incorrect') {
      return 'bg-rose-100/95 ring-4 ring-rose-200'
    }

    return 'bg-white/95'
  }, [feedbackTone])

  const progressPercent = totalRounds > 0 ? (reviewedCount / totalRounds) * 100 : 0

  if (loadingPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <p className="text-lg text-slate-100">Loading memory training...</p>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <p className="text-lg text-slate-100">Preparing your training verses...</p>
      </div>
    )
  }

  if (!isLocked && orderedFlashcards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-white shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Memory Training</p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">No verses ready.</h1>
          <p className="mt-3 text-base text-slate-300">
            Add a verse first to begin fill-in-the-blank memory training.
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
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Fill the Blank</h1>
          <p className="mt-3 text-base text-slate-300">
            Train exact wording through focused Scripture recall.
          </p>

          <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reviewed</p>
              <p className="mt-2 text-3xl font-bold">{reviewedCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Remembered</p>
              <p className="mt-2 text-3xl font-bold">{correctCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">XP Earned</p>
              <p className="mt-2 text-3xl font-bold text-amber-300">+{sessionXp}</p>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/flashcards/review"
              className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Review Cards
            </Link>
            <Link
              href="/flashcards"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Memory Training
            </Link>
            <Link
              href="/flashcards/create"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Add Verse
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <InstructionModal
        title="Fill the Blank"
        storageKey="fillBlankSeen"
        steps={[
          "Reveal the verse reference and train exact wording",
          "Fill every blank before checking your recall",
          "Earn Memory XP when eligible. Daily limits keep training fair.",
        ]}
      />

      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_18%),linear-gradient(180deg,_#1f2937_0%,_#020617_62%)] px-4 py-8 md:px-6 md:py-10">
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Memory Training</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Fill the Blank</h1>
            <p className="mt-3 text-base text-slate-300 md:text-lg">Train exact wording through focused Scripture recall.</p>
            <p className="mt-4 text-sm text-slate-400">
              Earn Memory XP when eligible. Daily limits keep training fair.
            </p>
          </header>

          <section className="grid grid-cols-2 gap-3 text-white md:grid-cols-4">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Remaining</p>
              <p className="mt-2 text-2xl font-bold">{cardsRemaining}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current Card</p>
              <p className="mt-2 text-2xl font-bold">{currentCard ? currentIndex + 1 : totalRounds}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reviewed</p>
              <p className="mt-2 text-2xl font-bold">{reviewedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">XP Earned</p>
              <p className="mt-2 text-2xl font-bold text-amber-300">+{sessionXp}</p>
            </div>
          </section>

          <GameHeader
            reference={currentCard?.reference ?? 'Proverbs 3:5'}
            progress={Math.min(reviewedCount + 1, totalRounds || 1)}
            total={isLocked ? 5 : totalRounds || 1}
            sessionXp={sessionXp}
            totalXp={totalXp}
          />

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <section className="mx-auto max-w-4xl">
            <div className={`rounded-[2rem] border border-white/10 p-6 shadow-2xl transition-all duration-300 md:p-8 ${panelClasses}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Focused Recall
                </span>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700">
                    {currentCard ? getDifficulty(currentCard) : 'easy'}
                  </span>
                  <span>
                    Card {isLocked ? 1 : currentIndex + 1} of {isLocked ? 5 : totalRounds}
                  </span>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Verse Reference
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-700">
                  {currentCard?.reference ?? 'Proverbs 3:5'}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-4 text-center text-xl font-bold leading-relaxed text-slate-950 md:text-2xl">
                {(isLocked ? PREVIEW_FILL_TOKENS : round?.puzzle.tokens || []).map((token, tokenIndex) => {
                  const blankIndex = isLocked
                    ? PREVIEW_BLANKS.findIndex((blank) => blank.tokenIndex === tokenIndex)
                    : blankIndexMap.get(tokenIndex) ?? -1

                  if (blankIndex === -1) {
                    return (
                      <span key={`${token}-${tokenIndex}`} className="px-1">
                        {token}
                      </span>
                    )
                  }

                  const isCorrect = isLocked ? false : round?.blankResults[blankIndex]
                  const inputClasses = checked
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-slate-300 bg-white text-slate-950'

                  return (
                    <span key={`blank-${tokenIndex}`} className="flex flex-col items-center gap-2">
                      <input
                        type="text"
                        value={isLocked ? '' : round?.answers[blankIndex] || ''}
                        onChange={(event) => handleAnswerChange(blankIndex, event.target.value)}
                        disabled={isLocked || (checked && !!round?.blankResults.every(Boolean))}
                        placeholder={isLocked ? PREVIEW_BLANKS[blankIndex].hint : round?.puzzle.blanks[blankIndex].hint}
                        className={`w-28 rounded-xl border px-3 py-2 text-center text-base font-semibold outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300 ${inputClasses}`}
                      />
                      {checked && !isCorrect && !isLocked && (
                        <span className="text-xs font-semibold text-rose-700">
                          {round?.puzzle.blanks[blankIndex].answer}
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>

              <div className="mt-6 min-h-7 text-center">
                <p
                  className={`text-base font-semibold transition-all duration-200 ${
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

              {checked && round && round.blankResults.some((result) => !result) && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-800">Correct answers</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {round.puzzle.blanks.map((blank, index) => (
                      <span key={`${blank.answer}-${index}`} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-rose-700">
                        {blank.answer}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleCheckAnswers}
                disabled={checked || (round ? round.answers.some((answer) => !answer.trim()) : true)}
                className="rounded-xl bg-amber-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-200 disabled:text-slate-500"
              >
                Check Recall
              </button>
              <button
                type="button"
                onClick={handleTryAgain}
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={handleNextVerse}
                disabled={!checked}
                className="rounded-xl bg-sky-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-200 disabled:text-slate-500"
              >
                Continue
              </button>
            </div>
          </section>

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
