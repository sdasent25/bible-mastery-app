"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { generatePlan } from "@/lib/planGenerator"
import { getUserPlan, saveUserPlan } from "@/lib/userPlan"
import { supabase } from "@/lib/supabase"

const readingOptions = [
  { label: "90 Days (Fast)", value: 90 },
  { label: "120 Days (Strong)", value: 120 },
  { label: "180 Days (Balanced)", value: 180 },
  { label: "365 Days (Steady)", value: 365 },
]

const trainingOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [timeline, setTimeline] = useState<number | null>(null)
  const [trainingEnabled, setTrainingEnabled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const plan = useMemo(() => {
    if (timeline === null || trainingEnabled === null) {
      return null
    }

    return generatePlan(timeline, trainingEnabled)
  }, [timeline, trainingEnabled])

  useEffect(() => {
    let active = true

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      const existingPlan = await getUserPlan()
      if (active && existingPlan) {
        router.replace("/home")
        return
      }

      if (active) {
        setLoading(false)
      }
    }

    void initialize()

    return () => {
      active = false
    }
  }, [router])

  async function handleStartJourney() {
    if (!plan) return

    try {
      setSaving(true)
      await saveUserPlan(plan)
      router.push("/home")
    } catch (error) {
      console.error("Error saving onboarding plan:", error)
      setSaving(false)
    }
  }

  function renderStep() {
    if (step === 1) {
      return (
        <>
          <div className="space-y-3 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#7ee69c]">
              Step 1 of 3
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              How quickly do you want to complete the Bible?
            </h1>
            <p className="text-base text-white">
              Choose a pace that feels sustainable every day.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            {readingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTimeline(option.value)
                  setStep(2)
                }}
                className="rounded-xl border border-white/10 bg-[#121826] px-5 py-5 text-left text-xl font-bold text-white shadow-[0_0_30px_rgba(34,197,94,0.08)] transition hover:border-[#22c55e]/50 hover:bg-[#162033]"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )
    }

    if (step === 2) {
      return (
        <>
          <div className="space-y-3 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#7ee69c]">
              Step 2 of 3
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Do you want quick training sessions during the day?
            </h1>
            <p className="text-base text-white">
              These are short bursts that keep momentum high when time is tight.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            {trainingOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  setTrainingEnabled(option.value)
                  setStep(3)
                }}
                className="rounded-xl border border-white/10 bg-[#121826] px-5 py-5 text-left text-xl font-bold text-white shadow-[0_0_30px_rgba(34,197,94,0.08)] transition hover:border-[#22c55e]/50 hover:bg-[#162033]"
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            className="mt-5 w-full rounded-xl border border-white/10 px-5 py-4 text-sm font-bold text-white transition hover:border-white/25"
          >
            Back
          </button>
        </>
      )
    }

    return (
      <>
        <div className="space-y-3 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#7ee69c]">
            Step 3 of 3
          </p>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Your daily plan is ready
          </h1>
          <p className="text-base text-white">
            This keeps reading deep and training quick.
          </p>
        </div>

        {plan && (
          <div className="mt-8 space-y-4 rounded-xl border border-white/10 bg-[#121826] p-5 text-white shadow-[0_0_40px_rgba(34,197,94,0.08)]">
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">
                You&apos;ll complete the Bible in {plan.timeline} days
              </p>
              <p className="text-base text-white">
                Reading about {plan.segmentsPerDay} segments per day
              </p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm uppercase tracking-[0.24em] text-white">Segments per day</span>
              <span className="text-lg font-bold">{plan.segmentsPerDay}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm uppercase tracking-[0.24em] text-white">Training enabled</span>
              <span className="text-lg font-bold">{plan.trainingEnabled ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm uppercase tracking-[0.24em] text-white">Estimated completion</span>
              <span className="text-lg font-bold">{plan.estimatedDays} days</span>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3">
          <button
            onClick={handleStartJourney}
            disabled={!plan || saving}
            className="rounded-xl bg-[#22c55e] px-5 py-4 text-lg font-black text-[#07110b] shadow-[0_0_35px_rgba(34,197,94,0.28)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Start My Journey"}
          </button>
          <button
            onClick={() => setStep(2)}
            disabled={saving}
            className="rounded-xl border border-white/10 px-5 py-4 text-sm font-bold text-white transition hover:border-white/25 disabled:opacity-60"
          >
            Back
          </button>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 text-white">
        Loading...
      </div>
    )
  }

  return (
    <main className="flex min-h-screen overflow-hidden bg-[#0B0F1A] px-4 py-6 text-white">
      <div className="m-auto w-full max-w-xl rounded-3xl border border-white/10 bg-[#101726] p-6 shadow-[0_0_70px_rgba(34,197,94,0.08)] sm:p-8">
        {renderStep()}
      </div>
    </main>
  )
}
