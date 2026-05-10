"use client"

import { useEffect, useMemo, useState } from "react"
import FlashcardStudy from "@/components/flashcards/FlashcardStudy"
import Paywall from "@/components/Paywall"
import { FLASHCARD_PAYWALL_COPY, canAccessFlashcards } from "@/lib/flashcardAccess"
import { getFlashcards, type Flashcard } from "@/lib/flashcards"
import { getUserPlan } from "@/lib/getUserPlan"

function isDueForReview(card: Flashcard) {
  if (!card.due_date) {
    return true
  }

  return new Date(card.due_date).getTime() <= Date.now()
}

export default function ReviewMode() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCards = async () => {
      try {
        const nextPlan = await getUserPlan()
        setPlan(nextPlan)

        if (!canAccessFlashcards(nextPlan)) {
          setCards([])
          return
        }

        const loadedCards = await getFlashcards()
        setCards(loadedCards)
      } catch (error) {
        console.error("Failed to load flashcards", error)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    void loadCards()
  }, [])

  const reviewCards = useMemo(
    () =>
      cards.filter(
        (card) =>
          isDueForReview(card) ||
          (card.lapses ?? 0) > 0 ||
          card.status === "learning"
      ),
    [cards]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white md:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-full bg-white/5" />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="h-24 rounded-[1.5rem] bg-white/5" />
            <div className="h-24 rounded-[1.5rem] bg-white/5" />
            <div className="h-24 rounded-[1.5rem] bg-white/5" />
            <div className="h-24 rounded-[1.5rem] bg-white/5" />
          </div>
          <div className="h-96 rounded-[2rem] bg-white/5" />
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
      <div className="mx-auto max-w-5xl">
        <FlashcardStudy flashcards={reviewCards} />
      </div>
    </div>
  )
}
