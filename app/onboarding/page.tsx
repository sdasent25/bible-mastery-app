"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function OnboardingPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [handle, setHandle] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const bannedWords = ["admin", "god", "jesus", "test"]

  function isValidHandle(value: string) {
    const clean = value.toLowerCase()

    if (!/^[a-z0-9_]+$/.test(clean)) return false
    if (bannedWords.some(word => clean.includes(word))) return false

    return true
  }

  async function handleSubmit() {
    setError("")

    if (!name || !handle) {
      setError("Please complete all fields")
      return
    }

    if (!isValidHandle(handle)) {
      setError("Invalid handle. Use letters, numbers, underscore only.")
      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: name,
        handle: handle.toLowerCase(),
      })
      .eq("id", user.id)

    if (updateError) {
      setError("Handle may already be taken")
      setLoading(false)
      return
    }

    router.push("/journey?preview=true")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070F] px-4">
      <div className="w-full max-w-md bg-[#0B1220] border border-[#1F2A44] rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Create Your Identity
        </h1>

        <p className="text-white text-sm text-center mb-6">
          This is how you'll appear on leaderboards and challenges
        </p>

        <div className="space-y-4">
          <input
            placeholder="Your Name"
            className="w-full p-3 rounded-lg bg-[#05070F] border border-[#1F2A44] text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="@handle"
            className="w-full p-3 rounded-lg bg-[#05070F] border border-[#1F2A44] text-white"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-green-500 text-black font-bold"
          >
            {loading ? "Saving..." : "Start Preview"}
          </button>
        </div>
      </div>
    </div>
  )
}
