"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

import { nodes } from "@/lib/nodes"
import { getProgramProgress, getResumeSegmentIndex, type ProgramProgress } from "@/lib/programProgress"
import { createClient } from "@/lib/supabase/client"
import { getUserPlan } from "@/lib/getUserPlan"
import {
  getGenesisMissionArt,
  getGenesisMissionMeta,
  normalizeSegmentId,
} from "@/lib/genesisCampaign"
import { getXpConfig } from "@/lib/xpEngine"

type MasteryRow = {
  segment: string
  mastered: boolean
}

type PlanType =
  | "free"
  | "pro"
  | "pro_plus"
  | "family_pro"
  | "family_pro_plus"

type MissionOption = {
  id: string
  label: string
  enabled: boolean
  value: number
  unavailable: boolean
  icon: string
  estTime: string
  flavor: string
  reward: string
  accentClass: string
  ringClass: string
}

const DEFAULT_PROGRESS: ProgramProgress = {
  programId: "genesis",
  currentSegmentIndex: 0,
  completed: false,
  bonusAwarded: false,
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function hasPaidCampaignAccess(planType: PlanType) {
  return (
    planType === "pro" ||
    planType === "pro_plus" ||
    planType === "family_pro" ||
    planType === "family_pro_plus"
  )
}

function buildCampaignQuizHref(segment: string, isFree: boolean, depth: number) {
  if (isFree) {
    return `/quiz?segment=${segment}&depth=5`
  }

  return `/quiz?program=genesis&segment=${segment}&depth=${depth}`
}

export default function ExploreBookPage() {
  const params = useParams<{ book: string }>()
  const searchParams = useSearchParams()
  const book = params?.book ?? ""
  const supabase = createClient()
  const [mastery, setMastery] = useState<MasteryRow[]>([])
  const [progress, setProgress] = useState<ProgramProgress>(DEFAULT_PROGRESS)
  const [planType, setPlanType] = useState<PlanType>("free")
  const [loading, setLoading] = useState(book === "genesis")
  const [availableQuestionCount, setAvailableQuestionCount] = useState<number | null>(null)

  useEffect(() => {
    if (book !== "genesis") return

    let active = true

    async function loadCampaign() {
      try {
        const [nextProgress, nextPlan] = await Promise.all([
          getProgramProgress("genesis"),
          getUserPlan(),
        ])

        const {
          data: { user },
        } = await supabase.auth.getUser()

        let masteryRows: MasteryRow[] = []

        if (user) {
          const { data } = await supabase
            .from("user_segment_mastery")
            .select("segment, mastered")
            .eq("user_id", user.id)

          masteryRows = (data || []) as MasteryRow[]
        }

        if (!active) return

        setProgress(nextProgress)
        setPlanType((nextPlan || "free") as PlanType)
        setMastery(masteryRows)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCampaign()

    return () => {
      active = false
    }
  }, [book, supabase])

  const genesisCampaign = useMemo(() => {
    const genesisNodes = nodes.filter((node) => node.book === "Genesis")
    const masteredSet = new Set(
      mastery.filter((row) => row.mastered).map((row) => normalizeSegmentId(row.segment))
    )

    const safeIndex = getResumeSegmentIndex(progress, genesisNodes.length)
    const hasPaidAccess = hasPaidCampaignAccess(planType)
    const completedMissionCount = progress.completed
      ? genesisNodes.length
      : Math.min(safeIndex, genesisNodes.length)
    const masteryCount = genesisNodes.filter((node) =>
      masteredSet.has(normalizeSegmentId(node.id))
    ).length

    const missions = genesisNodes.map((node, index) => {
      const meta = getGenesisMissionMeta(node.id)
      const mastered = masteredSet.has(normalizeSegmentId(node.id))
      const completed = progress.completed || index < safeIndex
      const current = !progress.completed && index === safeIndex
      const unlocked = hasPaidAccess ? index <= safeIndex : index === 0
      const locked = !unlocked
      const nextUnlock = !progress.completed && locked && index === safeIndex + 1

      return {
        ...node,
        ...meta,
        missionNumber: index + 1,
        mastered,
        completed,
        current,
        locked,
        nextUnlock,
        segmentSlug: normalizeSegmentId(node.id),
        artSrc: getGenesisMissionArt(node.id),
      }
    })

    const currentMission =
      missions.find((mission) => mission.current) ||
      missions[missions.length - 1] ||
      null

    const masteryPercent =
      genesisNodes.length > 0 ? (masteryCount / genesisNodes.length) * 100 : 0
    const completionPercent =
      genesisNodes.length > 0
        ? (completedMissionCount / genesisNodes.length) * 100
        : 0

    return {
      missions,
      currentMission,
      masteryCount,
      masteryPercent,
      completedMissionCount,
      completionPercent,
      totalMissions: genesisNodes.length,
    }
  }, [mastery, planType, progress])

  const focusedMission =
    genesisCampaign.missions.find(
      (mission) =>
        mission.segmentSlug === searchParams.get("segment")?.toLowerCase().replaceAll("_", "-")
    ) || genesisCampaign.currentMission

  useEffect(() => {
    if (book !== "genesis" || !focusedMission) return

    let active = true

    fetch(`/api/quiz/question-count?segment=${focusedMission.segmentSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        setAvailableQuestionCount(data.count || 0)
      })
      .catch(() => {
        if (!active) return
        setAvailableQuestionCount(0)
      })

    return () => {
      active = false
    }
  }, [book, focusedMission])

  if (book !== "genesis") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#10203f_0%,_#080d1b_38%,_#04060d_100%)] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/explore/category/pentateuch"
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
          >
            ← Back to Pentateuch
          </Link>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,39,0.98),rgba(7,10,18,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200/80">
              Campaign
            </div>
            <h1 className="mt-3 text-4xl font-black text-white">
              {book.charAt(0).toUpperCase() + book.slice(1)}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Genesis is the first fully immersive campaign now live. The rest of the
              Pentateuch world will expand from here.
            </p>
          </section>
        </div>
      </main>
    )
  }

  const isFree = !hasPaidCampaignAccess(planType)
  const scoutReward = `+${getXpConfig(5).completionBonus} XP`
  const journeyReward = `+${getXpConfig(10).completionBonus} XP`
  const masteryReward = `+${getXpConfig(15).completionBonus} XP`
  const missionActionLabel =
    focusedMission && focusedMission.missionNumber <= 1 ? "Deploy Mission" : "Resume Mission"
  const launchCopy =
    focusedMission?.completed
      ? "Replay Mission"
      : focusedMission && focusedMission.missionNumber > 1
        ? "Continue Mission"
        : "Begin Mission"
  const missionOptions: MissionOption[] = [
    {
      id: "scout",
      label: "Scout Mission",
      enabled: true,
      value: 5,
      unavailable: availableQuestionCount !== null && availableQuestionCount < 5,
      icon: "✦",
      estTime: "2-3 min",
      flavor: "Fast reconnaissance through the passage with a light push of XP.",
      reward: scoutReward,
      accentClass:
        "border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(12,17,29,0.98))]",
      ringClass: "from-sky-200 via-cyan-200 to-blue-300",
    },
    {
      id: "journey",
      label: "Journey Mission",
      enabled: !isFree,
      value: 10,
      unavailable: availableQuestionCount !== null && availableQuestionCount < 10,
      icon: "⬢",
      estTime: "4-6 min",
      flavor: "The main campaign path with balanced progression and core story momentum.",
      reward: journeyReward,
      accentClass:
        "border-amber-100/14 bg-[linear-gradient(180deg,rgba(34,22,8,0.94),rgba(15,11,8,0.98))]",
      ringClass: "from-amber-100 via-yellow-200 to-orange-300",
    },
    {
      id: "mastery",
      label: "Mastery Mission",
      enabled: !isFree,
      value: 15,
      unavailable: availableQuestionCount !== null && availableQuestionCount < 5,
      icon: "⬣",
      estTime: "7-10 min",
      flavor: "A deeper challenge for sharper understanding, memory, and mission discipline.",
      reward: masteryReward,
      accentClass:
        "border-emerald-200/14 bg-[linear-gradient(180deg,rgba(10,34,24,0.94),rgba(8,16,12,0.98))]",
      ringClass: "from-emerald-100 via-lime-200 to-teal-300",
    },
  ]

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#5b4210_0%,_#1a1209_34%,_#060507_100%)] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,219,120,0.28),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-44 h-48 w-48 rounded-full bg-amber-300/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[-2rem] top-[34rem] h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/explore/category/pentateuch"
          className="inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-100 backdrop-blur-sm"
        >
          ← Back to Pentateuch
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[2.35rem] shadow-[0_30px_110px_rgba(0,0,0,0.38)]">
          <div className="absolute inset-0">
            <Image
              src="/explorer/pentateuch/region.png"
              alt=""
              fill
              priority
              className="object-cover object-[50%_42%] brightness-[1.07] saturate-[1.08]"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,230,160,0.30),transparent_28%),linear-gradient(180deg,rgba(20,12,4,0.00),rgba(20,12,4,0.08)_36%,rgba(8,6,4,0.50))]" />

          <div className="relative z-10 flex min-h-[32rem] flex-col justify-between px-5 py-6 sm:min-h-[38rem] sm:px-7 sm:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/72">
                Book Campaign
              </div>
              <div className="text-right text-[11px] font-medium uppercase tracking-[0.24em] text-amber-50/72">
                {genesisCampaign.totalMissions} Sacred Missions
              </div>
            </div>

            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/74 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                The Foundations of Creation
              </p>
              <h1 className="mt-4 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-7xl">
                Genesis
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-amber-50/84 drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:text-lg">
                Traverse the beginning of Scripture through creation light, fractured
                humanity, covenant promise, exile, testing, and providence.
              </p>
            </div>

            <div className="grid max-w-4xl grid-cols-3 gap-3 rounded-[1.85rem] border border-white/10 bg-black/18 p-4 backdrop-blur-sm">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Completion
                </div>
                <div className="mt-2 text-3xl font-black text-white">
                  {formatPercent(genesisCampaign.completionPercent)}
                </div>
                <div className="mt-1 text-xs text-amber-50/72">
                  {genesisCampaign.completedMissionCount} of {genesisCampaign.totalMissions} cleared
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Mastery
                </div>
                <div className="mt-2 text-3xl font-black text-white">
                  {formatPercent(genesisCampaign.masteryPercent)}
                </div>
                <div className="mt-1 text-xs text-amber-50/72">
                  {genesisCampaign.masteryCount} missions mastered
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Path
                </div>
                <div className="mt-2 text-3xl font-black text-white">
                  {genesisCampaign.totalMissions}
                </div>
                <div className="mt-1 text-xs text-amber-50/72">
                  from creation to blessing
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="mb-7">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
              Current Mission
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Continue the sacred path through Genesis
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              The campaign keeps the active mission centered, then lets you deploy straight from this page.
            </p>
          </div>

          {focusedMission && (
            <div className="relative overflow-hidden rounded-[2.2rem] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
              <div className="absolute inset-0">
                <Image
                  src={focusedMission.artSrc}
                  alt=""
                  fill
                  className="object-cover object-center brightness-[1.08] saturate-[1.08]"
                  sizes="100vw"
                />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,228,163,0.24),transparent_26%),linear-gradient(180deg,rgba(12,10,6,0.02),rgba(12,10,6,0.12)_40%,rgba(6,5,4,0.56))]" />

              <div className="relative z-10 grid gap-8 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-50/72">
                      Mission {focusedMission.missionNumber}
                    </div>
                    <h3 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white drop-shadow-[0_5px_20px_rgba(0,0,0,0.45)] sm:text-5xl">
                      {focusedMission.title}
                    </h3>
                    <p className="mt-3 text-lg font-semibold text-amber-100/80">
                      {focusedMission.atmosphere}
                    </p>
                    <p className="mt-4 max-w-xl text-base leading-7 text-slate-100/84 sm:text-lg">
                      {focusedMission.subtitle}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-amber-50/78">
                    <div>{focusedMission.label}</div>
                    <div>{focusedMission.mastered ? "Mastered" : focusedMission.completed ? "Replay ready" : "Daily Mission Available"}</div>
                    <div>{focusedMission.locked ? focusedMission.nextUnlock ? "Unlocks Tomorrow" : "Locked" : "Next mission unlocks tomorrow"}</div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-black/24 p-5 backdrop-blur-sm">
                  <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/62">
                    Mission Focus
                  </div>
                  <div className="mt-4 text-5xl font-black text-white">
                    {focusedMission.missionNumber}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {focusedMission.completed
                      ? "Mission complete. Select a mission type below to replay with focus and keep mastery moving."
                      : "Daily mission available. Choose how you want to enter, then move straight into gameplay."}
                  </div>
                  <div className="mt-6 h-[6px] overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-100 via-yellow-200 to-orange-300 shadow-[0_0_36px_rgba(251,191,36,0.22)]"
                      style={{ width: `${((focusedMission.missionNumber - 1) / Math.max(genesisCampaign.totalMissions - 1, 1)) * 100}%` }}
                    />
                  </div>
                  <div className="mt-4 text-xs uppercase tracking-[0.22em] text-amber-100/62">
                    {focusedMission.completed ? "Replay remains open" : "Deployment happens below"}
                  </div>
                  <div className="mt-6">
                    {focusedMission.locked ? (
                      <div className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/70">
                        {focusedMission.nextUnlock ? "Unlocks Tomorrow" : "Locked"}
                      </div>
                    ) : (
                      <div className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/82">
                        Select a mission type below to deploy immediately
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {focusedMission && !focusedMission.locked && (
          <section id="mission-types" className="mt-14 sm:mt-16">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
                Choose Your Mission
              </div>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Select the way you want to enter this passage
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Mission type sets the intensity of this run while the campaign, progression, and mastery systems remain the same beneath it.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {missionOptions.map((option) => {
                const isLockedOption = !option.enabled
                const isUnavailable = option.unavailable
                const optionQuizHref = buildCampaignQuizHref(focusedMission.segmentSlug, isFree, option.value)

                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (isLockedOption) {
                        window.location.assign("/pricing")
                        return
                      }

                      if (isUnavailable) return

                      window.location.assign(optionQuizHref)
                    }}
                    disabled={isUnavailable}
                    className={`group relative overflow-hidden rounded-[1.8rem] border p-5 text-left transition duration-200 active:scale-[0.985] ${
                      option.accentClass
                    } ${
                      isLockedOption
                        ? "opacity-70 shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
                        : isUnavailable
                          ? "opacity-50 cursor-not-allowed shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
                          : "cursor-pointer shadow-[0_18px_42px_rgba(0,0,0,0.20)] hover:scale-[1.01] hover:shadow-[0_26px_64px_rgba(0,0,0,0.28),0_0_28px_rgba(251,191,36,0.08)]"
                    }`}
                    aria-label={`${option.label}. ${missionActionLabel}. ${option.estTime}. ${option.reward}.`}
                  >
                    <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_top_left,white,transparent_42%)]" />
                    {!isLockedOption && !isUnavailable && (
                      <div className="absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,236,189,0.12),transparent_34%)]" />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${option.ringClass} text-xl text-[#1b1205] shadow-[0_0_24px_rgba(255,255,255,0.12)]`}>
                            {option.icon}
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
                              {isLockedOption ? "Premium Mission" : "Mission Mode"}
                            </div>
                            <h3 className="mt-1 text-2xl font-black text-white">
                              {option.label}
                            </h3>
                          </div>
                        </div>

                        <div className="text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-white/58">
                          {isLockedOption ? "Locked" : isUnavailable ? "Unavailable" : missionActionLabel}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-200/80">
                        {option.flavor}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/64">
                        <span>{option.estTime}</span>
                        <span>{option.reward}</span>
                        <span>{option.value} questions</span>
                        {isLockedOption && <span>Upgrade required</span>}
                        {isUnavailable && <span>Not enough questions available</span>}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
                        <span className="text-white/68">
                          {isLockedOption
                            ? "Unlock this mission type to deploy."
                            : isUnavailable
                              ? "This passage does not have enough prompts for this mission."
                              : `Deploy into Mission ${focusedMission.missionNumber} immediately.`}
                        </span>
                        <span className="font-semibold uppercase tracking-[0.2em] text-amber-100/78">
                          {isLockedOption ? "View Access" : isUnavailable ? "Stand By" : `${launchCopy} →`}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-18 sm:mt-24">
          <div className="mb-7">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
              Mission Ladder
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Sacred missions across the book of beginnings
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Each mission follows the existing Genesis progression. Completion, locks,
              and mastery are all pulled from the current system.
            </p>
          </div>

          <div className="relative pl-8 sm:pl-10">
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-amber-200/40 via-white/10 to-transparent sm:left-[15px]" />

            <div className="space-y-5">
              {genesisCampaign.missions.map((mission) => {
                const markerClass = mission.mastered
                  ? "bg-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.34)]"
                  : mission.current
                    ? "bg-white shadow-[0_0_24px_rgba(255,255,255,0.3)]"
                    : mission.completed
                      ? "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.22)]"
                      : mission.locked
                        ? "bg-amber-100/35 shadow-[0_0_18px_rgba(251,191,36,0.08)]"
                        : "bg-amber-100/70"

                const shellClass = mission.current
                  ? "border-amber-100/24 bg-[linear-gradient(180deg,rgba(34,22,8,0.88),rgba(13,10,7,0.92))] shadow-[0_0_45px_rgba(251,191,36,0.14),0_24px_54px_rgba(0,0,0,0.28)]"
                  : mission.mastered
                    ? "border-amber-100/18 bg-[linear-gradient(180deg,rgba(26,19,10,0.86),rgba(11,9,7,0.9))] shadow-[0_0_22px_rgba(251,191,36,0.08),0_18px_42px_rgba(0,0,0,0.22)]"
                    : mission.locked
                      ? "border-white/10 bg-[linear-gradient(180deg,rgba(17,13,10,0.78),rgba(9,8,8,0.86))] shadow-[0_0_18px_rgba(251,191,36,0.05),0_16px_36px_rgba(0,0,0,0.16)]"
                      : "border-white/10 bg-[linear-gradient(180deg,rgba(17,13,10,0.84),rgba(9,8,8,0.9))] shadow-[0_16px_36px_rgba(0,0,0,0.18)]"

                const imageClass = mission.current
                  ? "object-cover object-center brightness-[1.08] saturate-[1.08]"
                  : mission.mastered
                    ? "object-cover object-center brightness-[0.9] saturate-[0.96]"
                    : mission.locked
                      ? "object-cover object-center brightness-[0.72] saturate-[0.78] blur-[1px]"
                      : "object-cover object-center brightness-[0.86] saturate-[0.9]"

                return (
                  <div key={mission.id} className="relative">
                    <div className={`absolute left-[-29px] top-8 h-5 w-5 rounded-full border border-white/14 ${markerClass} sm:left-[-35px]`} />

                    <article className={`overflow-hidden rounded-[1.8rem] border ${shellClass}`}>
                      <div className="relative">
                        {mission.current && (
                          <div className="absolute inset-[-1px] rounded-[1.8rem] border border-amber-100/18 animate-pulse" />
                        )}

                        <div className={`absolute inset-0 ${mission.current ? "opacity-44" : mission.mastered ? "opacity-24" : mission.locked ? "opacity-42" : "opacity-22"}`}>
                          <Image
                            src={mission.artSrc}
                            alt=""
                            fill
                            className={imageClass}
                            sizes="100vw"
                          />
                        </div>
                        <div
                          className={`absolute inset-0 ${
                            mission.current
                              ? "bg-[linear-gradient(180deg,rgba(9,7,5,0.10),rgba(9,7,5,0.34))]"
                              : mission.mastered
                                ? "bg-[linear-gradient(180deg,rgba(9,7,5,0.16),rgba(9,7,5,0.44))]"
                                : mission.locked
                                  ? "bg-[linear-gradient(180deg,rgba(9,7,5,0.20),rgba(9,7,5,0.56))]"
                                  : "bg-[linear-gradient(180deg,rgba(9,7,5,0.18),rgba(9,7,5,0.50))]"
                          }`}
                        />

                        <div className="relative z-10 px-5 py-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
                                Mission {mission.missionNumber}
                              </div>
                              <h3 className="mt-2 text-2xl font-black text-white">
                                {mission.title}
                              </h3>
                              <p className="mt-1 text-sm font-semibold text-amber-100/72">
                                {mission.atmosphere}
                              </p>
                            </div>

                            <div className="text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                              {mission.mastered
                                ? "Mastered"
                                : mission.current
                                  ? "Active Mission"
                                  : mission.completed
                                    ? "Replay Ready"
                                    : mission.nextUnlock
                                      ? "Unlocks Tomorrow"
                                      : mission.locked
                                        ? "Locked"
                                        : "Open"}
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-6 text-slate-200/76">
                            {mission.subtitle}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/62">
                            <span>{mission.label}</span>
                            <span>
                              {mission.mastered
                                ? "Mastery glow active"
                                : mission.completed
                                  ? "Return anytime for training"
                                  : mission.current
                                    ? "Daily Mission Available"
                                    : mission.nextUnlock
                                      ? "Mission Incoming"
                                      : "More ahead in the campaign"}
                            </span>
                            <span>
                              {mission.locked
                                ? mission.nextUnlock
                                  ? "Unlocks Tomorrow"
                                  : "Locked"
                                : mission.current
                                  ? "Next mission unlocks tomorrow"
                                  : "Continue Campaign"}
                            </span>
                          </div>

                          <div className="mt-5">
                            <div className="h-[4px] overflow-hidden rounded-full bg-white/10">
                              <div
                                className={`h-full rounded-full ${
                                  mission.mastered
                                    ? "bg-gradient-to-r from-amber-100 via-yellow-200 to-orange-300"
                                    : mission.completed || mission.current
                                      ? "bg-gradient-to-r from-white/90 via-amber-100 to-yellow-200"
                                      : "bg-white/24"
                                }`}
                                style={{
                                  width: mission.mastered
                                    ? "100%"
                                    : mission.completed
                                      ? "100%"
                                      : mission.current
                                        ? "62%"
                                        : mission.locked
                                          ? "20%"
                                          : "35%",
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-5">
                            {mission.locked ? (
                              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white/68">
                                <span>🔒</span>
                                <span>{mission.nextUnlock ? "Unlocks Tomorrow" : "Locked"}</span>
                              </div>
                            ) : (
                              <Link
                                href={`/explore/book/genesis?segment=${mission.segmentSlug}#mission-types`}
                                className={`inline-flex rounded-full ${
                                  mission.current
                                    ? "border border-amber-100/18 bg-amber-100/10 px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.12)] backdrop-blur-sm transition hover:bg-amber-100/14"
                                    : "border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/14"
                                }`}
                              >
                                {mission.current ? "Choose Mission Type" : mission.completed ? "Replay This Mission" : "Focus This Mission"} →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {loading && (
          <div className="mt-8 text-sm text-slate-300">
            Loading Genesis campaign...
          </div>
        )}
      </div>
    </main>
  )
}
