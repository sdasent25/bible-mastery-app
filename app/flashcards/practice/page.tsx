"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getLocale, getMessages } from "@/lib/i18n"

import FlashcardStudy from "@/components/flashcards/FlashcardStudy"

type Flashcard = {
  id: string
  reference: string
  verse_text: string
}

export default function FlashcardsPracticePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [, setPlanType] = useState("free")
  const [hasAccess, setHasAccess] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [flashcardsLoading, setFlashcardsLoading] = useState(true)
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
        .eq("user_id", user.id)
        .single()

      const plan = data?.final_plan ?? "free"
      setPlanType(plan)

      console.log("FLASHCARD ROUTE PLAN:", plan)

      const hasAccess = plan === "pro" || plan === "pro_plus"

      if (!hasAccess) {
        router.push("/pricing?source=flashcards_locked")
        return
      }

      setHasAccess(true)
      setLoading(false)
    }

    void checkAccess()
  }, [router])

  async function load() {
    setFlashcardsLoading(true)

    const locale = getLocale()
    const msgs = await getMessages(locale)
    setMessages(msgs)

    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes?.user) {
      setFlashcardsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userRes.user.id)
      .in("status", ["again", "hard"])

    if (error) {
      console.error(error)
    } else {
      setFlashcards(data || [])
    }

    setFlashcardsLoading(false)
  }

  useEffect(() => {
    if (!hasAccess) return
    async function loadFlashcards() {
      await load()
    }

    void loadFlashcards()
  }, [hasAccess])

  if (loading) return null

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
          Practice
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-xl mx-auto w-full space-y-4">
        <h1 className="text-2xl font-bold text-white text-center">
          Practice Weak Cards
        </h1>

        <p className="text-center text-white/80 text-sm">
          Focus on the verses you struggled with
        </p>

        {flashcardsLoading && (
          <div className="text-center text-gray-400">
            Loading...
          </div>
        )}

        {!flashcardsLoading && flashcards.length === 0 && (
          <div className="text-center space-y-3 mt-10">
            <p className="text-white/80">
              No weak cards yet 🎉
            </p>

            <p className="text-sm text-gray-400">
              You&apos;re doing great — keep training!
            </p>
          </div>
        )}

        {!flashcardsLoading && flashcards.length > 0 && (
          <FlashcardStudy flashcards={flashcards} messages={messages} />
        )}
      </div>
    </div>
  )
}
