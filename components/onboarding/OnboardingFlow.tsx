"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { saveOnboarding } from "@/lib/onboarding"

export default function OnboardingFlow() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [handle, setHandle] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("name, handle, onboarding_complete")
        .eq("id", user.id)
        .maybeSingle()

      if (!active) return

      if (data?.onboarding_complete === true) {
        router.replace("/dashboard")
        return
      }

      setName(data?.name || "")
      setHandle(data?.handle || "")
      setLoading(false)
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [router])

  const finish = async () => {
    const trimmedName = name.trim()
    const trimmedHandle = handle.trim().toLowerCase()

    if (!trimmedName) {
      setError("Please enter your name.")
      return
    }

    if (!trimmedHandle) {
      setError("Please choose a handle.")
      return
    }

    setSaving(true)
    setError("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      return
    }

    const res = await saveOnboarding({
      userId: user.id,
      name: trimmedName,
      handle: trimmedHandle,
    })

    if (!res.ok) {
      setError(res.error || "Error saving profile")
      setSaving(false)
      return
    }

    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 text-white">
        Loading setup...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1a2440_0%,_#0c1220_40%,_#05070d_100%)] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.18),transparent_58%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,36,0.96),rgba(9,12,20,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.32)] sm:p-7">
          <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100/84">
            First-Time Setup
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white">
            Welcome to Bible Athlete
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Set your identity, enter the dashboard, and begin your mission in the Word.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em] text-amber-100/76">
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#121826] px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-amber-200/40"
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em] text-amber-100/76">
                Handle
              </label>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                className="w-full rounded-2xl border border-white/10 bg-[#121826] px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-amber-200/40"
                placeholder="@username"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              onClick={finish}
              disabled={saving}
              className="w-full rounded-full bg-amber-200 px-5 py-4 text-lg font-black text-[#2c1600] shadow-[0_0_36px_rgba(251,191,36,0.22)] transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Enter Dashboard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
