"use client"

import { useSearchParams, useRouter } from "next/navigation"

export default function MissionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const day = searchParams.get("day") || "1"

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          Day {day}
        </h1>

        <p className="text-white">
          Your mission is ready.
        </p>

        <button
          onClick={() => router.push(`/quiz?day=${day}`)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-lg font-semibold transition"
        >
          Start Mission
        </button>
      </div>
    </div>
  )
}
