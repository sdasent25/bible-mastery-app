"use client"

import { useState } from "react"

export default function FlashcardsPage() {
  const [hovered, setHovered] = useState<string | null>(null)

  const progress = 3
  const total = 10
  const percent = (progress / total) * 100

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
      <h1 className="text-4xl font-bold mb-4 tracking-tight">
        Flashcards
      </h1>

      {/* Status Bar */}
      <div className="w-full max-w-xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-400/20">
          <span>🔥</span>
          <span className="text-sm font-medium">7 Day Streak</span>
        </div>

        <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20">
          <span>⚡</span>
          <span className="text-sm font-medium">120 XP</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Today&apos;s Training</span>
          <span>{progress} / {total}</span>
        </div>

        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Main CTA */}
      <div
        className="w-full max-w-xl p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer mb-6"
      >
        <div className="text-2xl font-bold">
          Continue Training
        </div>
        <div className="text-sm text-blue-100 mt-1">
          Keep building your memory
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
            ${
              hovered === card.id
                ? "scale-[1.02] bg-zinc-800 shadow-lg shadow-black/30"
                : ""
            }
            `}
          >
            <div className="text-lg font-semibold">
              {card.title}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {card.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
