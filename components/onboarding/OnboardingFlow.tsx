"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { saveOnboarding } from "@/lib/onboarding"

export default function OnboardingFlow() {
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [handle, setHandle] = useState("")
  const [goal, setGoal] = useState("")
  const [time, setTime] = useState("")
  const [isFamily, setIsFamily] = useState(false)

  const next = () => setStep((s) => s + 1)

  const finish = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const res = await saveOnboarding({
      userId: user.id,
      name,
      handle,
      goal,
      time_commitment: time,
      is_family: isFamily,
    })

    if (!res.ok) {
      alert(res.error || "Error saving profile")
      return
    }

    router.push("/home")
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {step === 0 && (
          <>
            <h1 className="text-3xl font-black text-center mb-6">
              Welcome to Bible Athlete
            </h1>
            <p className="text-center text-gray-300 mb-6">
              Build discipline. Master scripture.
            </p>
            <button onClick={next} className="w-full bg-green-500 py-4 rounded-xl text-black font-bold">
              Get Started
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4">What&apos;s your name?</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-lg bg-[#121826]"
            />
            <button onClick={next} className="mt-4 w-full bg-green-500 py-3 rounded-lg text-black font-bold">
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Choose a handle</h2>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              className="w-full p-4 rounded-lg bg-[#121826]"
              placeholder="@username"
            />
            <button onClick={next} className="mt-4 w-full bg-green-500 py-3 rounded-lg text-black font-bold">
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Why are you here?</h2>

            {["Consistency", "Learn deeply", "Discipline"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGoal(g)
                  next()
                }}
                className="w-full mb-3 py-3 bg-[#121826] rounded-lg"
              >
                {g}
              </button>
            ))}
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Daily time?</h2>

            {["5", "10", "15"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTime(t)
                  next()
                }}
                className="w-full mb-3 py-3 bg-[#121826] rounded-lg"
              >
                {t} minutes
              </button>
            ))}
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Who are you training with?
            </h2>

            <button
              onClick={() => {
                setIsFamily(false)
                next()
              }}
              className="w-full mb-3 py-3 bg-[#121826] rounded-lg"
            >
              Just me
            </button>

            <button
              onClick={() => {
                setIsFamily(true)
                next()
              }}
              className="w-full mb-3 py-3 bg-[#121826] rounded-lg"
            >
              My family
            </button>
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Preview Mode</h2>

            <p className="text-gray-300 mb-6">
              You&apos;re about to experience your first step. Complete it to unlock your full journey.
            </p>

            <button
              onClick={finish}
              className="w-full bg-green-500 py-4 rounded-xl text-black font-bold"
            >
              Start My First Step
            </button>
          </>
        )}
      </div>
    </div>
  )
}
