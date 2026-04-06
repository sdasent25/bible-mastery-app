"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { getProgramById } from "@/lib/programs"
import { getProgramProgress, getResumeSegmentIndex } from "@/lib/programProgress"
import { getUserPlan } from "@/lib/userPlan"
import { supabase } from "@/lib/supabase"

type HomeState = {
  currentSegmentLabel: string
  currentSegmentSlug: string
  segmentNumber: number
  totalSegments: number
}

function getSegmentChapterSummary(segment: string) {
  const match = segment.match(/^([a-z]+)-(\d+)-(\d+)$/)
  if (!match) {
    return "3 chapter segment"
  }

  const start = Number(match[2])
  const end = Number(match[3])
  return `Chapters ${start}-${end}`
}

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [trainingEnabled, setTrainingEnabled] = useState(true)
  const [homeState, setHomeState] = useState<HomeState | null>(null)

  useEffect(() => {
    let active = true

    async function loadHome() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      const plan = await getUserPlan()
      if (!plan) {
        router.replace("/onboarding")
        return
      }

      const program = getProgramById("genesis")
      if (!program) {
        if (active) {
          setLoading(false)
        }
        return
      }

      const progress = await getProgramProgress(program.id)
      const resumeIndex = getResumeSegmentIndex(progress, program.segments.length)
      const currentSegment = program.segments[resumeIndex] || program.segments[0]

      if (!active) return

      setTrainingEnabled(plan.trainingEnabled)
      setHomeState({
        currentSegmentLabel: currentSegment.label,
        currentSegmentSlug: currentSegment.segment,
        segmentNumber: Math.min(resumeIndex + 1, program.segments.length),
        totalSegments: program.segments.length,
      })
      setLoading(false)
    }

    void loadHome()

    return () => {
      active = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 text-white">
        Loading...
      </div>
    )
  }

  const continueHref = homeState
    ? `/segment?program=genesis&segment=${homeState.currentSegmentSlug}`
    : "/journey"

  const segmentSummary = homeState
    ? getSegmentChapterSummary(homeState.currentSegmentSlug)
    : "3 chapter segment"

  return (
    <main className="min-h-screen bg-[#0B0F1A] px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center gap-4">
        <div className="mb-2 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#7ee69c]">
            Daily Path
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">
            Choose your next step
          </h1>
        </div>

        <section className="rounded-xl border border-white/10 bg-[#121826] p-5 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#7ee69c]">
            Continue Reading
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">
            {homeState?.currentSegmentLabel || "Genesis 1–3"}
          </h2>
          <p className="mt-2 text-base text-white">
            {segmentSummary}
          </p>
          <p className="mt-1 text-sm text-white">
            Segment {homeState?.segmentNumber || 1} of {homeState?.totalSegments || 16}
          </p>
          <button
            onClick={() => router.push(continueHref)}
            className="mt-5 w-full rounded-xl bg-[#22c55e] px-5 py-4 text-lg font-black text-[#07110b] shadow-[0_0_35px_rgba(34,197,94,0.28)] transition hover:scale-[1.01]"
          >
            Continue
          </button>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#121826] p-5 shadow-[0_0_40px_rgba(34,197,94,0.06)]">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#7ee69c]">
            Quick Training
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">
            1-2 minutes
          </h2>
          <p className="mt-2 text-base text-white">
            Jump into a fast session to keep momentum even on a busy day.
          </p>
          <button
            onClick={() => router.push("/quiz?mode=quick")}
            className="mt-5 w-full rounded-xl border border-[#22c55e]/40 bg-[#162033] px-5 py-4 text-lg font-bold text-white transition hover:border-[#22c55e] hover:bg-[#1a2740]"
          >
            Start Training
          </button>
        </section>

        <button
          onClick={() => router.push("/quiz?mode=quick")}
          className="rounded-xl border border-white/10 bg-transparent px-5 py-4 text-base font-bold text-white transition hover:border-white/25"
        >
          I don&apos;t have time to read today
        </button>

        {!trainingEnabled && (
          <p className="text-center text-sm text-white">
            Quick training is still available anytime, even if you turned daily training off in onboarding.
          </p>
        )}
      </div>
    </main>
  )
}
