'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import GameHeader from '@/components/GameHeader'
import InstructionModal from '@/components/InstructionModal'
import LockedOverlay from '@/components/LockedOverlay'
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

export default function FillInTheBlankPage() {
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [plan, setPlan] = useState<PlanType>('free')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [round, setRound] = useState<RoundState | null>(null)
  const [checked, setChecked] = useState(false)
  const [feedbackTone, setFeedbackTone] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [hasAwardedXpForCurrent, setHasAwardedXpForCurrent] = useState(false)
  const [hasUpdatedProgressForCurrent, setHasUpdatedProgressForCurrent] = useState(false)

  useEffect(() => {
    async function initialize() {
      const { plan, isProPlus } = await getSubscriptionStatus()
      setPlan(plan)
      setLoadingPlan(false)

      if (!isProPlus) {
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

    initialize()
  }, [])

  const orderedFlashcards = useMemo(() => orderFlashcards(flashcards), [flashcards])

  const currentCard = orderedFlashcards.length > 0
    ? orderedFlashcards[currentIndex % orderedFlashcards.length]
    : null
  const isLocked = plan !== 'pro_plus' && plan !== 'family_pro_plus'

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

    setChecked(true)
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
    setFeedbackMessage(isCorrect ? 'Nice work! 🎉' : 'Almost there 💪')

    if (isCorrect && currentCard && !hasAwardedXpForCurrent) {
      const xpResult = await addXp({
        amount: CORRECT_XP,
        source: 'flashcards',
        cardId: currentCard.id,
      })

      if (xpResult.success) {
        setSessionXp((currentXp) => currentXp + CORRECT_XP)
        setTotalXp(xpResult.xp)
        setCompletedCount((count) => count + 1)
      }

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
    setFeedbackMessage('')
    setHasUpdatedProgressForCurrent(false)
  }

  function handleNextVerse() {
    if (orderedFlashcards.length === 0) {
      return
    }

    const nextIndex = (currentIndex + 1) % orderedFlashcards.length
    const nextCard = orderedFlashcards[nextIndex]

    setCurrentIndex(nextIndex)
    setRound(createRound(nextCard))
    setChecked(false)
    setFeedbackTone('idle')
    setFeedbackMessage('')
    setHasAwardedXpForCurrent(false)
    setHasUpdatedProgressForCurrent(false)
  }

  const panelClasses = useMemo(() => {
    if (feedbackTone === 'correct') {
      return 'bg-emerald-100/90 ring-4 ring-emerald-300'
    }

    if (feedbackTone === 'incorrect') {
      return 'bg-rose-100/90 ring-4 ring-rose-200'
    }

    return 'bg-white/95'
  }, [feedbackTone])

  if (loadingPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <p className="text-lg text-slate-100">Loading game...</p>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <p className="text-lg text-slate-100">Loading your verses...</p>
      </div>
    )
  }

  if (!isLocked && orderedFlashcards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-white shadow-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Fill-in-the-Blank</h1>
          <p className="mt-2 text-slate-300">Complete missing words from your verses</p>
          <p className="mt-8 text-lg font-semibold">Create flashcards first to play.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/flashcards"
              className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Open Flashcards
            </Link>
            <Link
              href="/flashcards"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Flashcards
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <InstructionModal
        title="Fill in the Blank"
        storageKey="fillBlankSeen"
        steps={[
          "Fill in missing words",
          "Choose the correct answers",
          "Complete all blanks to earn XP",
        ]}
      />

      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937,_#020617_62%)] px-4 py-8 md:px-6 md:py-10">
        <div className={`mx-auto max-w-5xl space-y-8 ${isLocked ? 'pointer-events-none opacity-40' : ''}`}>
          <header className="text-center text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Game Training</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Fill-in-the-Blank</h1>
            <p className="mt-3 text-base text-slate-300 md:text-lg">Complete the missing words from memory</p>
          </header>

          <GameHeader
            reference={currentCard?.reference ?? 'Proverbs 3:5'}
            progress={completedCount}
            total={isLocked ? 5 : flashcards.length}
            sessionXp={sessionXp}
            totalXp={totalXp}
          />

          <section className="mx-auto max-w-4xl">
            <div className={`rounded-[2rem] border border-white/10 p-6 shadow-2xl transition-all duration-300 md:p-8 ${panelClasses}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Verse Challenge
                </span>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700">
                    {currentCard ? getDifficulty(currentCard) : 'easy'}
                  </span>
                  <span>
                  Card {isLocked ? 1 : (currentIndex % orderedFlashcards.length) + 1} of {isLocked ? 5 : orderedFlashcards.length}
                  </span>
                </div>
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
                      className={`w-28 rounded-xl border px-3 py-2 text-center text-base font-semibold outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500 ${inputClasses}`}
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
                  {feedbackMessage || 'Ready'}
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
                disabled={round ? round.answers.some((answer) => !answer.trim()) : true}
                className="rounded-xl bg-sky-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-200 disabled:text-slate-500"
              >
                Check Answers
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
                className="rounded-xl bg-amber-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                Next Verse
              </button>
            </div>
          </section>

          <div className="text-center">
            <Link href="/flashcards" className="text-sm font-semibold text-slate-300 transition hover:text-white">
              Back to Flashcards
            </Link>
          </div>
        </div>

        {isLocked && (
          <LockedOverlay
            title="Pro+ Required"
            message="Unlock advanced training modes and master Scripture."
          />
        )}
      </div>
    </>
  )
}
