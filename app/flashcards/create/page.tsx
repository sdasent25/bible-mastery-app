"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFlashcard } from "@/lib/flashcards"

export default function CreateFlashcard() {
  const router = useRouter()

  const [text, setText] = useState("")
  const [ref, setRef] = useState("")

  const handleSave = async () => {
    if (!text || !ref) return

    await createFlashcard({
      verse_text: text,
      reference: ref,
      tags: [],
    })

    setText("")
    setRef("")

    router.push("/flashcards")
  }

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 py-8">

      <h1 className="text-3xl font-bold text-center mb-6">
        Add Flashcard
      </h1>

      <div className="max-w-xl mx-auto flex flex-col gap-4">

        {/* Verse Input */}
        <textarea
          placeholder="Enter scripture..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="p-4 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none min-h-[120px]"
        />

        {/* Reference Input */}
        <input
          placeholder="Reference (e.g. Proverbs 3:5)"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          className="p-4 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none"
        />

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="mt-4 py-3 bg-blue-500 rounded-xl font-semibold hover:scale-105 transition"
        >
          Save Flashcard
        </button>

      </div>

    </div>
  )
}
