"use client"

import { useState } from "react"
import { createFlashcard } from "@/lib/flashcards"

export default function CreateFlashcard({
  onCreated,
  messages,
}: {
  onCreated: () => void | Promise<void>
  messages: Record<string, string>
}) {
  const [verse, setVerse] = useState("")
  const [reference, setReference] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!verse.trim() || !reference.trim()) return

    setLoading(true)

    try {
      await createFlashcard({
        verse_text: verse,
        reference,
      })

      setVerse("")
      setReference("")
      await onCreated()
    } catch (err) {
      console.error(err)
      alert("Failed to save flashcard")
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        placeholder={messages.enter_verse}
        value={verse}
        onChange={(e) => setVerse(e.target.value)}
        className="w-full p-3 rounded-lg bg-neutral-900 text-white border border-neutral-700 focus:outline-none"
      />

      <input
        placeholder={messages.reference}
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        className="w-full p-3 rounded-lg bg-neutral-900 text-white border border-neutral-700 focus:outline-none"
      />

      <button
        className="w-full bg-green-600 hover:bg-green-500 transition py-3 rounded-lg font-semibold"
        disabled={loading}
      >
        {loading ? messages.saving : messages.add_flashcard}
      </button>
    </form>
  )
}
