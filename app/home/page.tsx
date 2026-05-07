"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  getGenesisMissionArt,
  getGenesisMissionMeta,
} from "@/lib/genesisCampaign"
import { getProgramById } from "@/lib/programs"
import { getProgramProgress, getResumeSegmentIndex } from "@/lib/programProgress"
import { getUserPlan, type UserPlan } from "@/lib/userPlan"
import { supabase } from "@/lib/supabase"

type HomeState = {
  currentSegmentLabel: string
  currentSegmentSlug: string
  currentSegmentIndex: number
  segmentNumber: number
  totalSegments: number
  highlightedRangeLabel: string
  completedToday: number
  progressPercent: number
  segmentsPerDay: number
  completedMissionCount: number
  masteryCount: number
  masteryPercent: number
  missionTitle: string
  missionSubtitle: string
  missionAtmosphere: string
  missionArt: string
}

type MasteryRow = {
  segment: string
  mastered: boolean
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

  function getCompletedToday(segmentIndex: number, plan: UserPlan) {
    if (plan.segmentsPerDay <= 1) {
      return 0
    }

    return segmentIndex % plan.segmentsPerDay
  }

  useEffect(() => {
    let active = true

    async function loadHome() {
      // 1. GET USER FIRST
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      // 2. HARD BLOCK - ONBOARDING CHECK (RUN FIRST)
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .single()

      if (error || !profile || profile.onboarding_complete === false) {
        router.replace("/onboarding")
        return
      }

      // 3. ONLY CONTINUE IF ONBOARDING COMPLETE
      const plan = await getUserPlan()

      if (!plan) {
        router.replace("/onboarding")
        return
      }

      const program = getProgramById("genesis")

      if (!program) {
        if (active) setLoading(false)
        return
      }

      const progress = await getProgramProgress(program.id)
      const resumeIndex = getResumeSegmentIndex(
        progress,
        program.segments.length
      )

      const currentSegment =
        program.segments[resumeIndex] || program.segments[0]

      const highlightedEndIndex = Math.min(
        resumeIndex + Math.max(plan.segmentsPerDay - 1, 0),
        program.segments.length - 1
      )

      const highlightedEndSegment =
        program.segments[highlightedEndIndex] || currentSegment

      const { data: masteryRows } = await supabase
        .from("user_segment_mastery")
        .select("segment, mastered")
        .eq("user_id", user.id)

      const masteredSegments = new Set(
        ((masteryRows || []) as MasteryRow[])
          .filter((row) => row.mastered)
          .map((row) => row.segment.replaceAll("_", "-"))
      )

      const masteryCount = program.segments.filter((segment) =>
        masteredSegments.has(segment.segment)
      ).length
      const masteryPercent = Math.round(
        (masteryCount / Math.max(program.segments.length, 1)) * 100
      )
      const completedMissionCount = progress.completed
        ? program.segments.length
        : Math.min(resumeIndex, program.segments.length)
      const missionId = currentSegment.segment.replaceAll("-", "_")
      const missionMeta = getGenesisMissionMeta(missionId)

      const completedToday =
        plan.segmentsPerDay <= 1
          ? 0
          : resumeIndex % plan.segmentsPerDay

      const progressPercent = Math.min(
        Math.round(
          (completedToday / Math.max(plan.segmentsPerDay, 1)) * 100
        ),
        100
      )

      if (!active) return

      setTrainingEnabled(plan.trainingEnabled)

      setHomeState({
        currentSegmentLabel: currentSegment.label,
        currentSegmentSlug: currentSegment.segment,
        currentSegmentIndex: resumeIndex,
        segmentNumber: Math.min(
          resumeIndex + 1,
          program.segments.length
        ),
        totalSegments: program.segments.length,
        highlightedRangeLabel: `${currentSegment.label} -> ${highlightedEndSegment.label}`,
        completedToday,
        progressPercent,
        segmentsPerDay: plan.segmentsPerDay,
        completedMissionCount,
        masteryCount,
        masteryPercent,
        missionTitle: missionMeta.title,
        missionSubtitle: missionMeta.subtitle,
        missionAtmosphere: missionMeta.atmosphere,
        missionArt: getGenesisMissionArt(currentSegment.segment),
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
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#1f2b47_0%,_#0d1321_34%,_#070a12_100%)] px-4 py-6 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-36 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-[24rem] h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col gap-5">
        <div className="mb-1 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-200/82">
            Daily Re-Entry
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
            Continue your campaign
          </h1>
        </div>

        <section className="relative overflow-hidden rounded-[2.2rem] shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
          <div className="absolute inset-0">
            <Image
              src={homeState?.missionArt || "/explorer/pentateuch/region.png"}
              alt=""
              fill
              priority
              className="object-cover object-center brightness-[1.06] saturate-[1.08]"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,226,153,0.22),transparent_28%),linear-gradient(180deg,rgba(13,10,6,0.02),rgba(13,10,6,0.12)_40%,rgba(7,6,4,0.56))]" />

          <div className="relative z-10 flex min-h-[31rem] flex-col justify-between px-5 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/74">
                Continue Genesis
              </div>
              <div className="text-right text-[11px] font-medium uppercase tracking-[0.24em] text-amber-50/72">
                Pentateuch Campaign
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/74 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                {homeState?.missionAtmosphere || "The Foundations of Creation"}
              </p>
              <h2 className="mt-4 text-4xl font-black leading-[0.94] tracking-[-0.04em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
                {homeState?.missionTitle || "In the Beginning"}
              </h2>
              <p className="mt-3 text-lg font-semibold text-amber-100/80">
                Mission {homeState?.segmentNumber || 1} — {homeState?.currentSegmentLabel || "Genesis 1–3"}
              </p>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-100/84 drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)]">
                {homeState?.missionSubtitle || "Step back into Genesis and continue the next sacred mission in your campaign path."}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                    Cleared
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {homeState?.completedMissionCount || 0}/{homeState?.totalSegments || 16}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                    Mastery
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {homeState?.masteryPercent || 0}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                    Today
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {homeState?.progressPercent || 0}%
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm text-white/84">
                  <span>{homeState?.completedToday || 0} missions completed today</span>
                  <span>{homeState?.highlightedRangeLabel || "Genesis 1–3 -> Genesis 1–3"}</span>
                </div>
                <div className="h-[6px] overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-100 via-yellow-200 to-orange-300 shadow-[0_0_28px_rgba(251,191,36,0.18)] transition-all duration-300"
                    style={{ width: `${homeState?.progressPercent || 0}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  onClick={() => router.push(continueHref)}
                  className="w-full rounded-full bg-amber-200 px-5 py-4 text-lg font-black text-[#2c1600] shadow-[0_0_36px_rgba(251,191,36,0.22)] transition hover:scale-[1.01]"
                >
                  Continue Mission
                </button>
                <button
                  onClick={() => router.push("/explore/book/genesis")}
                  className="w-full rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/14"
                >
                  Open Genesis Campaign
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(12,16,27,0.98))] p-5 shadow-[0_0_40px_rgba(34,197,94,0.06)]">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#7ee69c]">
            Keep Momentum
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">
            1-2 minutes
          </h2>
          <p className="mt-2 text-base text-white">
            Step into a fast training burst when you want to protect the streak and stay sharp.
          </p>
          <button
            onClick={() => router.push("/quiz?mode=quick")}
            className="mt-5 w-full rounded-full border border-[#22c55e]/40 bg-[#162033] px-5 py-4 text-lg font-bold text-white transition hover:border-[#22c55e] hover:bg-[#1a2740]"
          >
            Start Training
          </button>
        </section>

        <button
          onClick={() => router.push("/quiz?mode=quick")}
          className="rounded-full border border-white/10 bg-transparent px-5 py-4 text-base font-bold text-white transition hover:border-white/25"
        >
          I only have time for training today
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
