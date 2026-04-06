"use client"

import { useState } from "react"

const leaderboard = [
  { id: 1, name: "You", xp: 1855 },
  { id: 2, name: "Sarah", xp: 1720 },
  { id: 3, name: "David", xp: 1600 },
  { id: 4, name: "Rachel", xp: 1500 },
  { id: 5, name: "John", xp: 1400 },
]

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"family" | "global">("family")
  const currentUser = leaderboard.find((user) => user.name === "You")
  const users = leaderboard

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Leaderboard
      </h1>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setTab("family")}
          className={`px-4 py-2 rounded-xl ${
            tab === "family"
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-white/70"
          }`}
        >
          Family
        </button>

        <button
          onClick={() => setTab("global")}
          className={`px-4 py-2 rounded-xl ${
            tab === "global"
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-white/70"
          }`}
        >
          Global
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-700 bg-[#121826] p-5 text-center">
        <p className="text-sm text-white/60">You</p>
        <p className="mt-2 text-3xl font-bold text-white">
          {currentUser?.xp ?? 0} XP
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-neutral-700 bg-[#121826] p-6 text-center text-white/70">
          No activity yet — start training to climb the leaderboard
        </div>
      ) : (
        <div className="max-w-xl mx-auto mt-6 space-y-3 px-4">
          {users.map((user, index) => {
            const isCurrentUser = user.name === "You"

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                  isCurrentUser
                    ? "bg-[#1E293B] border-green-500"
                    : "bg-[#121826] border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300">
                    #{index + 1}
                  </span>

                  <span className="font-medium text-white">
                    {user.name}
                  </span>
                </div>

                <span className="font-bold text-green-400">
                  {user.xp} XP
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
