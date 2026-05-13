"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CreateFlashcard from "@/components/flashcards/CreateFlashcard"
import Paywall from "@/components/Paywall"
import { FLASHCARD_PAYWALL_COPY, canAccessFlashcards } from "@/lib/flashcardAccess"
import { getUserPlan } from "@/lib/getUserPlan"

export default function CreateFlashcardPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [plan, setPlan] = useState("free")

  useEffect(() => {
    const loadPlan = async () => {
      const nextPlan = await getUserPlan()
      setPlan(nextPlan)
      setLoadingPlan(false)
    }

    void loadPlan()
  }, [])

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white md:px-6">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-full bg-white/5" />
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
      <div className="mx-auto max-w-4xl">
        <Link
          href="/flashcards"
          className="inline-flex items-center text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          Back to Memory Training
        </Link>

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.42)] md:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Add Verse
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Create a personal memory card from the Scripture passage you want to train.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Build your verse library with the passages you return to for recall, retention, and
              steady memory discipline.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <CreateFlashcard
              onCreated={() => router.push("/flashcards/list?created=1")}
              submitLabel="Save Verse"
              savingLabel="Saving Verse..."
            />
          </div>
        </section>
      </div>
    </div>
  )
}
