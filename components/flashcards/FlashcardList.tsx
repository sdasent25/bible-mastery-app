"use client"

export default function FlashcardList({
  flashcards,
  onSelect,
}: {
  flashcards: Array<{ id: string; reference: string; verse_text: string }>
  onSelect: (card: { id: string; reference: string; verse_text: string }) => void
}) {
  if (!flashcards.length) {
    return (
      <div className="text-center text-gray-400">
        No flashcards yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {flashcards.map((card) => (
        <div
          key={card.id}
          onClick={() => onSelect(card)}
          className="p-3 rounded-lg bg-neutral-800 cursor-pointer hover:bg-neutral-700 transition"
        >
          <p className="text-sm text-gray-300">{card.reference}</p>
          <p className="text-white truncate">{card.verse_text}</p>
        </div>
      ))}
    </div>
  )
}
