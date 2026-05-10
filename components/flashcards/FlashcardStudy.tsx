"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { type Flashcard, prioritizeFlashcards, updateFlashcardProgress } from "@/lib/flashcards"
import { addXp } from "@/lib/xp"

type FlashcardStudyProps = {
  flashcards: Flashcard[]
  totalLibraryCards?: number
  hasScheduledDueCards?: boolean
}

type ReviewFeedbackTone = "idle" | "again" | "hard" | "easy"

const SESSION_SIZE = 10

function formatDate(value?: string | null) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function getFeedbackCopy(result: "again" | "hard" | "easy") {
  if (result === "again") {
    return "Recall grows through repetition."
  }

  if (result === "hard") {
    return "Keep training."
  }

  return "One verse stronger."
}

export default function FlashcardStudy({
  flashcards,
  totalLibraryCards = 0,
  hasScheduledDueCards = false,
}: FlashcardStudyProps) {
  const [session, setSession] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [complete, setComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackTone, setFeedbackTone] = useState<ReviewFeedbackTone>("idle")
  const [feedbackMessage, setFeedbackMessage] = useState("Keep training.")
  const [reviewedCount, setReviewedCount] = useState(0)
  const [rememberedCount, setRememberedCount] = useState(0)
  const [hardCount, setHardCount] = useState(0)
  const [masteredCount, setMasteredCount] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)

  useEffect(() => {
    const nextSession = prioritizeFlashcards(flashcards).slice(0, SESSION_SIZE)
    setSession(nextSession)
    setCurrentIndex(0)
    setRevealed(false)
    setComplete(false)
    setIsSubmitting(false)
    setFeedbackTone("idle")
    setFeedbackMessage("Keep training.")
    setReviewedCount(0)
    setRememberedCount(0)
    setHardCount(0)
    setMasteredCount(0)
    setSessionXp(0)
  }, [flashcards])

  const totalCards = session.length
  const currentCard = complete ? null : session[currentIndex] ?? null
  const cardsRemaining = Math.max(totalCards - reviewedCount, 0)
  const currentCardNumber = currentCard ? reviewedCount + 1 : totalCards
  const progressPercent = totalCards > 0 ? (reviewedCount / totalCards) * 100 : 0
  const earliestNextReview = useMemo(() => {
    const timestamps = session
      .map((card) => (card.due_date ? new Date(card.due_date).getTime() : null))
      .filter((value): value is number => value !== null && value > Date.now())

    if (!timestamps.length) {
      return null
    }

    return formatDate(new Date(Math.min(...timestamps)).toISOString())
  }, [session])

  const statusClasses = useMemo(() => {
    if (feedbackTone === "again") {
      return "border-rose-300/25 bg-rose-400/10 text-rose-100"
    }

    if (feedbackTone === "hard") {
      return "border-amber-300/25 bg-amber-300/10 text-amber-50"
    }

    if (feedbackTone === "easy") {
      return "border-emerald-300/25 bg-emerald-400/10 text-emerald-50"
    }

    return "border-white/10 bg-white/[0.04] text-slate-200"
  }, [feedbackTone])

  async function handleAnswer(result: "again" | "hard" | "easy") {
    if (!currentCard || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      let xpToAdd = 0

      if (result === "hard") {
        xpToAdd = 1
      } else if (result === "easy") {
        xpToAdd = 2
      }

      if (xpToAdd > 0) {
        const xpResult = await addXp({
          amount: xpToAdd,
          source: "flashcards",
          cardId: currentCard.id,
          isFirstAttempt: true,
        }).catch(console.error)

        if (xpResult?.success) {
          setSessionXp((currentXp) => currentXp + xpToAdd)
        }
      }

      const updatedCard = await updateFlashcardProgress(currentCard, result)
      setSession((existingSession) =>
        existingSession.map((sessionCard) =>
          sessionCard.id === updatedCard.id ? updatedCard : sessionCard
        )
      )

      setReviewedCount((count) => count + 1)
      setFeedbackTone(result)
      setFeedbackMessage(getFeedbackCopy(result))

      if (result === "again") {
        setHardCount((count) => count + 1)
      } else {
        setRememberedCount((count) => count + 1)
        if (result === "easy") {
          setMasteredCount((count) => count + 1)
        }
      }

      const nextIndex = currentIndex + 1

      if (nextIndex >= totalCards) {
        setComplete(true)
        setRevealed(false)
      } else {
        setCurrentIndex(nextIndex)
        setRevealed(false)
      }
    } catch (error) {
      console.error("Failed to update flashcard progress", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session.length && !complete) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
          Scripture Recall
        </p>
        <h2 className="mt-4 text-3xl font-bold text-white">
          {totalLibraryCards === 0 ? "No verses added yet." : "All caught up."}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-300">
          {totalLibraryCards === 0
            ? "Add your first verse to begin Scripture Memory Training."
            : hasScheduledDueCards
              ? "You have no verses due right now. Keep building your memory deck or return when your next review arrives."
              : "You have no verses due right now. Keep building your memory deck or return when your next review arrives."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/flashcards/create"
            className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Add Verse
          </Link>
          {totalLibraryCards > 0 && (
            <>
              <Link
                href="/flashcards/list"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Library
              </Link>
              <Link
                href="/flashcards"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Memory Training
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  if (complete) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
          Scripture Recall
        </p>
        <h2 className="mt-4 text-3xl font-bold text-white">
          Training Complete
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-300">
          Your review session is complete. Return tomorrow or add more verses to keep memory training alive.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Cards Reviewed</p>
            <p className="mt-2 text-3xl font-bold text-white">{reviewedCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Remembered</p>
            <p className="mt-2 text-3xl font-bold text-white">{rememberedCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Hard Cards</p>
            <p className="mt-2 text-3xl font-bold text-white">{hardCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Mastered</p>
            <p className="mt-2 text-3xl font-bold text-white">{masteredCount}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-300/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">XP Earned</p>
            <p className="mt-2 text-3xl font-bold text-white">+{sessionXp}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Next Review</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {earliestNextReview ? `Next review arrives ${earliestNextReview}.` : "Your next review is scheduled soon."}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/flashcards"
            className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Back to Memory Training
          </Link>
          <Link
            href="/flashcards/list"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Review Library
          </Link>
          <Link
            href="/flashcards/create"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Add Another Verse
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
            Scripture Recall
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Train your memory through focused verse review.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Start with the reference, recall the verse mentally, then reveal and rate how firmly it lives in memory.
          </p>
        </div>

        <div className={`rounded-[1.5rem] border p-4 lg:w-[320px] ${statusClasses}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            Session Focus
          </p>
          <p className="mt-2 text-sm leading-6">
            {feedbackMessage}
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-300/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Cards Remaining</p>
          <p className="mt-2 text-3xl font-bold text-white">{cardsRemaining}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current Card</p>
          <p className="mt-2 text-3xl font-bold text-white">{currentCardNumber}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reviewed This Session</p>
          <p className="mt-2 text-3xl font-bold text-white">{reviewedCount}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">XP Earned</p>
          <p className="mt-2 text-3xl font-bold text-white">+{sessionXp}</p>
        </div>
      </section>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {currentCard && (
        <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.42)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
              Recall First
            </span>
            <span className="text-sm font-semibold text-slate-400">
              Card {currentCardNumber} of {totalCards}
            </span>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 text-center md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Reference
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {currentCard.reference}
            </h2>

            {!revealed ? (
              <div className="mt-8">
                <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300">
                  Recall the verse mentally before revealing the text.
                </p>
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-5 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-amber-300 sm:w-auto"
                >
                  Reveal Verse
                </button>
              </div>
            ) : (
              <div className="mt-8">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Verse Text
                  </p>
                  <p className="mt-4 text-lg leading-8 text-white md:text-xl">
                    {currentCard.verse_text}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => void handleAnswer("again")}
                    disabled={isSubmitting}
                    className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-5 py-4 text-left transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="text-base font-semibold text-rose-100">I struggled</div>
                    <div className="mt-1 text-sm text-rose-100/80">Needs more repetition.</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAnswer("hard")}
                    disabled={isSubmitting}
                    className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-left transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="text-base font-semibold text-amber-50">I remembered</div>
                    <div className="mt-1 text-sm text-amber-50/80">Keep it in active review.</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAnswer("easy")}
                    disabled={isSubmitting}
                    className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-left transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="text-base font-semibold text-emerald-50">Mastered it</div>
                    <div className="mt-1 text-sm text-emerald-50/80">Ready for a longer interval.</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
