"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import FlashcardList from "@/components/flashcards/FlashcardList"
import Paywall from "@/components/Paywall"
import { FLASHCARD_PAYWALL_COPY, canAccessFlashcards } from "@/lib/flashcardAccess"
import { deleteFlashcard, getFlashcards, type Flashcard } from "@/lib/flashcards"
import { getUserPlan } from "@/lib/getUserPlan"

export default function FlashcardListPage() {
  const searchParams = useSearchParams()
  const [cards, setCards] = useState<Flashcard[]>([])
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const nextPlan = await getUserPlan()
        setPlan(nextPlan)

        if (!canAccessFlashcards(nextPlan)) {
          setCards([])
          return
        }

        const data = await getFlashcards()
        setCards(data || [])
      } catch (error) {
        console.error("Failed to load flashcards", error)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const stats = useMemo(() => {
    const mastered = cards.filter((card) => card.status === "mastered").length
    const due = cards.filter((card) => !card.due_date || new Date(card.due_date).getTime() <= Date.now()).length

    return {
      total: cards.length,
      mastered,
      due,
    }
  }, [cards])
  const wasJustCreated = searchParams.get("created") === "1"

  async function handleDelete(card: Flashcard) {
    const confirmed = window.confirm(`Delete ${card.reference} from your verse library?`)

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(card.id)
      await deleteFlashcard(card.id)
      setCards((existingCards) => existingCards.filter((existingCard) => existingCard.id !== card.id))
    } catch (error) {
      console.error("Failed to delete flashcard", error)
      window.alert("We couldn't remove that verse right now. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white md:px-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-56 rounded-full bg-white/5" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-24 rounded-[1.75rem] bg-white/5" />
            <div className="h-24 rounded-[1.75rem] bg-white/5" />
            <div className="h-24 rounded-[1.75rem] bg-white/5" />
          </div>
          <div className="h-56 rounded-[2rem] bg-white/5" />
        </div>
      </div>
    )
  }

  if (!canAccessFlashcards(plan)) {
    return (
      <Paywall
        title={FLASHCARD_PAYWALL_COPY.title}
        message={FLASHCARD_PAYWALL_COPY.message}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_24%),linear-gradient(180deg,_#0f172a_0%,_#020617_54%,_#000000_100%)] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/flashcards"
          className="inline-flex items-center text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          Back to Memory Training
        </Link>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Your Verse Library
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Keep every verse moving toward memory.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Review what is due, see where each verse sits on the memory path, and return to the
              next drill that keeps recall strong.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/flashcards/review"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Start Review
            </Link>
            <Link
              href="/flashcards/create"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Add Verse
            </Link>
          </div>
        </div>

        {wasJustCreated && (
          <section className="mt-6 rounded-[1.75rem] border border-emerald-300/18 bg-emerald-400/10 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                  Verse Added
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  Verse added. Start learning it now?
                </p>
              </div>
              <Link
                href="/flashcards/review"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Start Review
              </Link>
            </div>
          </section>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-amber-400/20 bg-amber-300/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Verses in Training</p>
            <p className="mt-3 text-3xl font-extrabold text-white">{stats.total}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Due for Review</p>
            <p className="mt-3 text-3xl font-extrabold text-white">{stats.due}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Mastered Verses</p>
            <p className="mt-3 text-3xl font-extrabold text-white">{stats.mastered}</p>
          </div>
        </section>

        {!cards.length ? (
          <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Verse Library
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              No verses added yet.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Add your first verse to begin Scripture Memory Training.
            </p>
            <Link
              href="/flashcards/create"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Add Verse
            </Link>
          </section>
        ) : (
          <section className="mt-6">
            <FlashcardList
              flashcards={cards}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </section>
        )}
      </div>
    </div>
  )
}
