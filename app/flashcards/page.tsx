"use client"

import { useState } from "react"

export default function FlashcardsPage() {
  const [hovered, setHovered] = useState<string | null>(null)

  const cards = [
    {
      id: "learn",
      title: "Learn",
      description: "Memorize scripture step by step",
    },
    {
      id: "review",
      title: "Review Flashcards",
      description: "Go through all your flashcards",
    },
    {
      id: "practice",
      title: "Practice Weak Cards",
      description: "Focus on the ones you struggle with",
    },
    {
      id: "create",
      title: "Add Flashcard",
      description: "Add your own verses to learn",
    },
  ]

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 text-white">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6">Flashcards</h1>

      {/* XP / Progress (NEW) */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Daily Progress</span>
          <span>3 / 10</span>
        </div>
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-[30%] transition-all" />
        </div>
      </div>

      {/* Main CTA */}
      <div
        className="w-full max-w-xl p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg hover:scale-[1.02] transition-transform cursor-pointer mb-6"
      >
        <div className="text-2xl font-bold">Start Daily Training</div>
        <div className="text-sm text-blue-100 mt-1">
          Review your flashcards and build memory
        </div>
      </div>

      {/* Mode Cards */}
      <div className="w-full max-w-xl flex flex-col gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onMouseEnter={() => setHovered(card.id)}
            onMouseLeave={() => setHovered(null)}
            className={`p-5 rounded-2xl border border-white/10 bg-zinc-900 transition-all cursor-pointer
              ${hovered === card.id ? "scale-[1.02] bg-zinc-800" : ""}
            `}
          >
            <div className="text-lg font-semibold">{card.title}</div>
            <div className="text-sm text-gray-400 mt-1">
              {card.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
