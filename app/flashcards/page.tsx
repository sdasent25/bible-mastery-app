"use client"

import { useEffect, useState } from "react"
import { getFlashcards } from "@/lib/flashcards"

import CreateFlashcard from "@/components/flashcards/CreateFlashcard"
import FlashcardList from "@/components/flashcards/FlashcardList"
import FlashcardStudy from "@/components/flashcards/FlashcardStudy"

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

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
        <h1 className="text-2xl font-bold text-white">Flashcards</h1>

        <CreateFlashcard onCreated={load} />

        <FlashcardStudy card={selected} />

        <FlashcardList
          flashcards={flashcards}
          onSelect={setSelected}
        />
      </div>
    </div>
  )
}
