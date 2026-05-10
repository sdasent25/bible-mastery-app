"use client"

import {
  type Flashcard,
  getFlashcardVisibilityStatus,
  isFlashcardDue,
} from "@/lib/flashcards"

type FlashcardListProps = {
  flashcards: Flashcard[]
  onDelete?: (card: Flashcard) => void | Promise<void>
  deletingId?: string | null
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not yet reviewed"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function getStatusLabel(card: Flashcard) {
  const status = getFlashcardVisibilityStatus(card)

  if (status === "needs_review") {
    return "Needs Review"
  }

  if (status === "due") {
    return "Due"
  }

  if (status === "mastered") {
    return "Mastered"
  }

  if (status === "learning") {
    return "Learning"
  }

  return "New"
}

function getStatusClasses(card: Flashcard) {
  const status = getFlashcardVisibilityStatus(card)

  if (status === "needs_review") {
    return "border-rose-300/20 bg-rose-400/10 text-rose-100"
  }

  if (status === "due") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100"
  }

  if (status === "mastered") {
    return "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
  }

  if (status === "learning") {
    return "border-sky-300/20 bg-sky-400/10 text-sky-100"
  }

  return "border-white/10 bg-white/5 text-slate-200"
}

function getReviewLabel(card: Flashcard) {
  if (!card.due_date) {
    return "Next review unscheduled"
  }

  return isFlashcardDue(card)
    ? "Due now"
    : `Next review ${formatDate(card.due_date)}`
}

export default function FlashcardList({
  flashcards,
  onDelete,
  deletingId = null,
}: FlashcardListProps) {
  if (!flashcards.length) {
    return null
  }

  return (
    <div className="grid gap-4">
      {flashcards.map((card) => (
        <article
          key={card.id}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${getStatusClasses(card)}`}>
                  {getStatusLabel(card)}
                </span>
                <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 md:hidden">
                  {getReviewLabel(card)}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-white">
                {card.reference}
              </h3>
            </div>

            {onDelete && (
              <button
                type="button"
                onClick={() => void onDelete(card)}
                disabled={deletingId === card.id}
                className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === card.id ? "Removing..." : "Delete"}
              </button>
            )}
          </div>

          <p className="mt-4 line-clamp-4 text-base leading-7 text-slate-200">
            {card.verse_text}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 md:hidden">
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              {getReviewLabel(card)}
            </span>
            {card.last_reviewed && (
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Last reviewed {formatDate(card.last_reviewed)}
              </span>
            )}
          </div>

          <div className="mt-5 hidden grid-cols-2 gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4 text-sm md:grid xl:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 font-semibold text-white">{getStatusLabel(card)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Next Review</p>
              <p className="mt-2 font-semibold text-white">{getReviewLabel(card)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Last Reviewed</p>
              <p className="mt-2 font-semibold text-white">{formatDate(card.last_reviewed)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Session History</p>
              <p className="mt-2 font-semibold text-white">
                {card.repetitions ?? 0} reps • {card.lapses ?? 0} lapses
              </p>
            </div>
          </div>

          {card.tags && card.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {card.tags.map((tag) => (
                <span
                  key={`${card.id}-${tag}`}
                  className="rounded-full bg-amber-300/10 px-3 py-1 text-sm font-medium text-amber-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!card.tags?.length && (
            <div className="mt-4 hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                No tags added yet
              </p>
            </div>
          )}

          <div className="mt-4 hidden md:flex md:flex-wrap md:gap-2">
            {!card.tags?.length && (
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Untagged
              </span>
            )}
            {card.due_date && (
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Interval {card.interval ?? 0} day{(card.interval ?? 0) === 1 ? "" : "s"}
              </span>
            )}
            {card.ease_factor && (
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Ease {card.ease_factor.toFixed(1)}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
