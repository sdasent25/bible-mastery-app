"use client"

import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>

        <button
          onClick={() => router.push("/journey")}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-lg font-semibold transition"
        >
          Start Daily Training
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between">
          <div>
            <p className="text-sm text-white">Level</p>
            <p className="text-lg font-semibold text-white">1</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-white">Streak</p>
            <p className="text-lg font-semibold text-white">🔥 0</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-white mb-2">Daily Progress</p>

          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[30%]" />
          </div>

          <p className="text-xs text-white mt-2">
            Continue your daily journey
          </p>
        </div>
      </div>
    </div>
  )
}
