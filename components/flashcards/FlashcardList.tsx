"use client"

import type { Flashcard } from "@/lib/flashcards"

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

function getStatusLabel(status: Flashcard["status"]) {
  if (status === "mastered") {
    return "Mastered"
  }

  if (status === "learning") {
    return "Learning"
  }

  return "New"
}

function getReviewLabel(card: Flashcard) {
  if (!card.due_date) {
    return "Due now"
  }

  return new Date(card.due_date).getTime() <= Date.now()
    ? "Due now"
    : `Due ${formatDate(card.due_date)}`
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                {getStatusLabel(card.status)}
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">
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

          <p className="mt-4 text-base leading-7 text-slate-200">
            {card.verse_text}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              {getReviewLabel(card)}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Last reviewed {formatDate(card.last_reviewed)}
            </span>
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
        </article>
      ))}
    </div>
  )
}
