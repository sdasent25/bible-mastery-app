"use client"

import { useEffect, useState } from "react"

export default function FlashcardStudy({
  card,
}: {
  card: { id: string; reference: string; verse_text: string } | null
}) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [card?.id])

  if (!card) {
    return (
      <div className="text-center text-gray-400">
        Select a flashcard
      </div>
    )
  }

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="p-6 rounded-xl bg-neutral-900 text-white cursor-pointer min-h-[200px] flex items-center justify-center text-center border border-neutral-700"
    >
      {flipped ? card.reference : card.verse_text}
    </div>
  )
}
