"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getFlashcards } from "@/lib/flashcards"
import { getLocale, getMessages } from "@/lib/i18n"

import FlashcardStudy from "@/components/flashcards/FlashcardStudy"

type Flashcard = {
  id: string
  reference: string
  verse_text: string
}

export default function FlashcardsReviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [messages, setMessages] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("user_access")
        .select("final_plan")
        .single()

      if (data?.final_plan === "pro" || data?.final_plan === "pro_plus") {
        setHasAccess(true)
      } else {
        router.push("/pricing?source=flashcards_locked")
      }

      setLoading(false)
    }

    void checkAccess()
  }, [router])

  async function load() {
    const data = await getFlashcards()
    setFlashcards(data)

    const locale = getLocale()
    const msgs = await getMessages(locale)
    setMessages(msgs)
  }

  useEffect(() => {
    if (!hasAccess) return
    async function loadFlashcards() {
      await load()
    }

    void loadFlashcards()
  }, [hasAccess])

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>
  }

  if (!hasAccess) return null

  if (!messages) return null

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/flashcards")}
          className="text-sm text-gray-300"
        >
          ← Flashcards
        </button>

        <div className="text-sm text-white/80">
          Review
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-xl mx-auto w-full space-y-4">
        <h1 className="text-2xl font-bold text-white text-center">
          Review Flashcards
        </h1>

        <p className="text-center text-white/80 text-sm">
          Go through your flashcards and strengthen your memory
        </p>

        <FlashcardStudy flashcards={flashcards} messages={messages} />
      </div>
    </div>
  )
}
