"use client"

import { useEffect, useState } from "react"
import { getFlashcards } from "@/lib/flashcards"
import { getLocale, getMessages } from "@/lib/i18n"

import CreateFlashcard from "@/components/flashcards/CreateFlashcard"
import FlashcardStudy from "@/components/flashcards/FlashcardStudy"

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [messages, setMessages] = useState<Record<string, string> | null>(null)

  async function load() {
    const data = await getFlashcards()
    setFlashcards(data)

    const locale = getLocale()
    const msgs = await getMessages(locale)
    setMessages(msgs)
  }

  useEffect(() => {
    load()
  }, [])

  if (!messages) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="p-4 space-y-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white text-center">
          {messages.flashcards}
        </h1>

        <CreateFlashcard onCreated={load} messages={messages} />

        <FlashcardStudy flashcards={flashcards} messages={messages} />
      </div>
    </div>
  )
}
