"use client"

import { useEffect, useState } from "react"
import { getFlashcards } from "@/lib/flashcards"

import CreateFlashcard from "@/components/flashcards/CreateFlashcard"
import FlashcardStudy from "@/components/flashcards/FlashcardStudy"

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<any[]>([])

  async function load() {
    const data = await getFlashcards()
    setFlashcards(data)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="p-4 space-y-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white text-center">
          Flashcards
        </h1>

        <CreateFlashcard onCreated={load} />

        <FlashcardStudy flashcards={flashcards} />
      </div>
    </div>
  )
}
