"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function FlashcardsPage() {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)

  const progress = 3
  const total = 10
  const percent = (progress / total) * 100

  const trainingCards = [
    {
      id: "learn",
      title: "Learn",
      description: "Memorize scripture step by step",
      path: "/flashcards/learn",
    },
    {
      id: "review",
      title: "Review Flashcards",
      description: "Go through all your flashcards",
      path: "/flashcards/review",
    },
    {
      id: "practice",
      title: "Practice Weak Cards",
      description: "Focus on the ones you struggle with",
      path: "/flashcards/practice",
    },
  ]

  return (
    <div className="w-full flex flex-col items-center py-8 px-4 text-white">

      {/* Title */}
      <h1 className="text-4xl font-bold mb-2 tracking-tight">
        Flashcards
      </h1>

      {/* Status Row */}
      <div className="w-full max-w-xl flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-400/30 shadow-sm">
          🔥 <span className="text-sm font-medium">7 Day Streak</span>
        </div>

        <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/30 shadow-sm">
          ⚡ <span className="text-sm font-medium">120 XP</span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="w-full max-w-xl mb-5">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Today's Training</span>
          <span>{progress} / {total}</span>
        </div>

        <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <div
        onClick={() => router.push("/flashcards/learn")}
        className="w-full max-w-xl p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 
        shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.97] 
        transition-all cursor-pointer mb-5"
      >
        <div className="text-2xl font-bold">
          Continue Training
        </div>
        <div className="text-sm text-blue-100 mt-1">
          Keep building your memory
        </div>
      </div>

      {/* PRIMARY ACTIONS */}
      <div className="w-full max-w-xl grid grid-cols-2 gap-3 mb-6">

        <div
          onClick={() => router.push("/flashcards/create")}
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 
          cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all shadow-lg"
        >
          <div className="text-base font-semibold">➕ Add</div>
          <div className="text-xs text-purple-100">New card</div>
        </div>

        <div
          onClick={() => router.push("/flashcards/library")}
          className="p-4 rounded-2xl bg-zinc-900 border border-white/10 
          cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all"
        >
          <div className="text-base font-semibold">📚 Library</div>
          <div className="text-xs text-gray-400">Your cards</div>
        </div>

      </div>

      {/* TRAINING MODES */}
      <div className="w-full max-w-xl flex flex-col gap-3">
        {trainingCards.map((card) => (
          <div
            key={card.id}
            onClick={() => router.push(card.path)}
            onMouseEnter={() => setHovered(card.id)}
            onMouseLeave={() => setHovered(null)}
            className={`p-4 rounded-2xl border border-white/10 bg-zinc-900 transition-all cursor-pointer
            ${
              hovered === card.id
                ? "scale-[1.02] bg-zinc-800 shadow-md shadow-black/30"
                : ""
            }`}
          >
            <div className="text-base font-semibold">
              {card.title}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {card.description}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
