"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ProPlusOnboarding() {
  const router = useRouter()
  const [selected, setSelected] = useState<number>(10)

  async function handleContinue() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from("profiles")
      .update({
        questions_per_day: selected,
      })
      .eq("id", user.id)

    router.push("/journey")
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        <h1 className="text-3xl font-bold mb-4">
          You’re unlocked 🔓
        </h1>

        <p className="text-gray-300 mb-6">
          Choose your daily training depth
        </p>

        {[5, 10, 15].map((num) => (
          <button
            key={num}
            onClick={() => setSelected(num)}
            className={`w-full mb-3 py-4 rounded-xl font-semibold transition ${
              selected === num
                ? "bg-green-500 text-black"
                : "bg-[#121826]"
            }`}
          >
            {num} Questions
          </button>
        ))}

        <p className="text-xs text-gray-400 mb-4">
          You can change this anytime in Settings
        </p>

        <button
          onClick={handleContinue}
          className="w-full bg-green-500 py-4 rounded-xl font-bold text-black"
        >
          Start My Journey
        </button>

      </div>
    </div>
  )
}