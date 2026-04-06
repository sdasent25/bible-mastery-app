"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSignup = async () => {
    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage("Account created. Continue to your journey.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070F] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1F2A44] bg-[#0B1220] p-6 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          Become a Bible Athlete
        </h1>

        <p className="mb-6 text-center text-sm text-gray-400">
          Start your journey today. Build consistency in God&apos;s Word.
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-[#1F2A44] bg-[#05070F] p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-[#1F2A44] bg-[#05070F] p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            {loading ? "Creating account..." : "Start My Journey"}
          </button>

          {message && (
            <p className="text-center text-sm text-gray-400">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
