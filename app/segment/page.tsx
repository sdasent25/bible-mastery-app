"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import {
  getGenesisMissionArt,
  getGenesisMissionMeta,
  normalizeSegmentId,
} from "@/lib/genesisCampaign"
import { nodes } from "@/lib/nodes"
import { createClient } from "@/lib/supabase/client"
import { getUserPlan } from "@/lib/getUserPlan"
import { getXpConfig } from "@/lib/xpEngine"

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

function formatSegment(segment: string) {
  const parts = segment.split("-")

  if (parts.length < 3) return segment

  const book = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  const start = parts[1]
  const end = parts[2]

  return `${book} ${start}–${end}`
}

export default function SegmentIntro() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [planType, setPlanType] = useState("free")
  const [questionCount, setQuestionCount] = useState<number | null>(null)
  const [availableCount, setAvailableCount] = useState<number | null>(null)

  const rawSegment = searchParams.get("segment") || ""
  const segment = rawSegment.toLowerCase().replaceAll("_", "-")
  const normalizedSegment = segment
  const program = searchParams.get("program") || "genesis"
  const isFree = planType === "free"

  const match = segment.match(/^([a-z]+)-(\d+)-(\d+)$/)

  let book: string | null = null

  if (match) {
    book = match[1].charAt(0).toUpperCase() + match[1].slice(1)
  }

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const plan = await getUserPlan()

      if (isMounted) {
        setPlanType(plan)
        setProfileLoaded(true)
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  useEffect(() => {
    if (!profileLoaded) return

    const isFirstFreeSegment =
      planType === "free" && normalizedSegment === "genesis-1-3"

    const hasFullAccess =
      planType === "pro" ||
      planType === "pro_plus" ||
      planType === "family_pro" ||
      planType === "family_pro_plus"

    if (!hasFullAccess && !isFirstFreeSegment) {
      if (
        planType === "free" &&
        normalizedSegment &&
        normalizedSegment.toLowerCase().replaceAll("_", "-") === "genesis-1-3"
      ) {
        return
      }

      router.push("/pricing?source=journey_locked")
      return
    }
  }, [book, planType, profileLoaded, router, segment, normalizedSegment])

  useEffect(() => {
    if (!segment) return

    fetch(`/api/quiz/question-count?segment=${segment}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableCount(data.count || 0)
      })
  }, [segment])

  const currentNode = useMemo(
    () => nodes.find((node) => normalizeSegmentId(node.id) === segment) || null,
    [segment]
  )

  const missionMeta = useMemo(() => {
    if (currentNode?.book === "Genesis") {
      return getGenesisMissionMeta(currentNode.id)
    }

    return {
      title: formatSegment(segment),
      subtitle:
        "Read the passage, steady your focus, and prepare to enter the next sacred mission.",
      atmosphere: "Mission briefing",
    }
  }, [currentNode, segment])

  const currentBookNodes = useMemo(() => {
    if (!currentNode) return []
    return nodes.filter((node) => node.book === currentNode.book)
  }, [currentNode])

  const currentMissionIndex = useMemo(() => {
    if (!currentNode) return -1
    return currentBookNodes.findIndex((node) => node.id === currentNode.id)
  }, [currentBookNodes, currentNode])

  const nearbyMissions = useMemo(() => {
    if (currentMissionIndex === -1) return []

    return currentBookNodes
      .slice(Math.max(0, currentMissionIndex - 1), Math.min(currentBookNodes.length, currentMissionIndex + 3))
      .map((node) => {
        const missionIndex = currentBookNodes.findIndex((entry) => entry.id === node.id)
        const meta =
          node.book === "Genesis"
            ? getGenesisMissionMeta(node.id)
            : {
                title: node.label,
                subtitle: "A sacred mission in the campaign path ahead.",
                atmosphere: "Campaign path",
              }

        return {
          id: node.id,
          label: node.label,
          title: meta.title,
          missionNumber: missionIndex + 1,
          current: node.id === currentNode?.id,
          completed: missionIndex < currentMissionIndex,
          futureLocked: missionIndex > currentMissionIndex,
        }
      })
  }, [currentBookNodes, currentMissionIndex, currentNode])

  const missionArt = currentNode?.book === "Genesis"
    ? getGenesisMissionArt(currentNode.id)
    : "/explorer/pentateuch/region.png"

  const baseQuizHref = isFree
    ? `/quiz?segment=${segment}&depth=5`
    : `/quiz?program=${program}&segment=${segment}`
  const quizHref = isFree
    ? baseQuizHref
    : `${baseQuizHref}${questionCount ? `&depth=${questionCount}` : ""}`

  const scoutReward = `+${getXpConfig(5).completionBonus} XP`
  const journeyReward = `+${getXpConfig(10).completionBonus} XP`
  const masteryReward = `+${getXpConfig(15).completionBonus} XP`

  const missionOptions: MissionOption[] = [
    {
      id: "scout",
      label: "Scout Mission",
      enabled: true,
      value: 5,
      unavailable: availableCount !== null && availableCount < 5,
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
      unavailable: availableCount !== null && availableCount < 10,
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
      unavailable: availableCount !== null && availableCount < 5,
      icon: "⬣",
      estTime: "7-10 min",
      flavor: "A deeper challenge for sharper understanding, memory, and mission discipline.",
      reward: masteryReward,
      accentClass:
        "border-emerald-200/14 bg-[linear-gradient(180deg,rgba(10,34,24,0.94),rgba(8,16,12,0.98))]",
      ringClass: "from-emerald-100 via-lime-200 to-teal-300",
    },
  ]

  const selectedOption =
    missionOptions.find((option) => option.value === questionCount) || null

  const backHref =
    program === "genesis" ? "/explore/book/genesis" : "/journey"
  const actionLabel =
    currentMissionIndex <= 0 ? "Begin Mission" : "Continue Mission"

  if (!profileLoaded) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#4a3410_0%,_#14100b_34%,_#060507_100%)] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,218,123,0.26),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-44 h-48 w-48 rounded-full bg-amber-300/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[-2rem] top-[30rem] h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        <Link
          href={backHref}
          className="inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-100 backdrop-blur-sm"
        >
          ← Back
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[2.2rem] shadow-[0_30px_100px_rgba(0,0,0,0.38)]">
          <div className="absolute inset-0">
            {segment === "genesis-1-3" ? (
              <video
                autoPlay
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/animations/genesis/creation.mp4" type="video/mp4" />
              </video>
            ) : (
              <Image
                src={missionArt}
                alt=""
                fill
                priority
                className="object-cover object-center brightness-[1.08] saturate-[1.08]"
                sizes="100vw"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,228,163,0.24),transparent_26%),linear-gradient(180deg,rgba(12,10,6,0.02),rgba(12,10,6,0.12)_42%,rgba(6,5,4,0.58))]" />

          <div className="relative z-10 flex min-h-[31rem] flex-col justify-between px-5 py-6 sm:min-h-[35rem] sm:px-7 sm:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/74">
                Campaign Mission Briefing
              </div>
              <div className="text-right text-[11px] font-medium uppercase tracking-[0.24em] text-amber-50/72">
                {book || "Genesis"} Campaign
              </div>
            </div>

            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/74 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                {missionMeta.atmosphere}
              </p>
              <h1 className="mt-4 text-4xl font-black leading-[0.94] tracking-[-0.04em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-6xl">
                Mission {currentMissionIndex + 1} — {missionMeta.title}
              </h1>
              <p className="mt-3 text-lg font-semibold text-amber-100/82">
                {formatSegment(segment)}
              </p>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-100/84 drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:text-lg">
                {missionMeta.subtitle}
              </p>
            </div>

            <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-black/18 p-4 backdrop-blur-sm sm:grid-cols-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Current Path
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  Mission {currentMissionIndex + 1}
                </div>
                <div className="mt-1 text-xs text-amber-50/74">
                  of {Math.max(currentBookNodes.length, 1)} in {book || "Genesis"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Scripture
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {match ? `${match[2]}-${match[3]}` : "1-3"}
                </div>
                <div className="mt-1 text-xs text-amber-50/74">
                  chapters in this mission
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">
                  Campaign Flow
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  Ready
                </div>
                <div className="mt-1 text-xs text-amber-50/74">
                  prepare, read, and enter
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 sm:mt-16">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
              Mission Reading
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Read the passage before you enter
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Anchor yourself in the text, then choose how you want to move through the mission.
            </p>
          </div>

          <a
            href={`https://www.biblegateway.com/passage/?search=${segment.replace("-", "%20")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/14"
          >
            Open Scripture →
          </a>
        </section>

        <section className="mt-14 sm:mt-16">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
              Choose Your Mission
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Select the way you want to enter this passage
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Each mission path launches the same gameplay system, but with a different level of intensity and reward.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {missionOptions.map((option) => {
              const isLockedOption = !option.enabled
              const isUnavailable = option.unavailable
              const isSelected = questionCount === option.value

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (isLockedOption) {
                      router.push("/pricing")
                      return
                    }

                    if (isUnavailable) return

                    setQuestionCount(option.value)
                  }}
                  disabled={isUnavailable}
                  className={`relative overflow-hidden rounded-[1.8rem] border p-5 text-left transition ${
                    option.accentClass
                  } ${
                    isSelected ? "scale-[1.01] shadow-[0_24px_60px_rgba(0,0,0,0.26)]" : "shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
                  } ${
                    isLockedOption ? "opacity-70" : ""
                  } ${
                    isUnavailable ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_top_left,white,transparent_42%)]" />

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
                        {isLockedOption ? "Locked" : isSelected ? "Selected" : "Ready"}
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
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-14 sm:mt-16">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-amber-200/70">
              Campaign Continuity
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              The nearby missions in your Genesis path
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              The current mission stays centered while the path behind and ahead remains visible.
            </p>
          </div>

          <div className="relative pl-8 sm:pl-10">
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-amber-200/40 via-white/10 to-transparent sm:left-[15px]" />
            <div className="space-y-4">
              {nearbyMissions.map((mission) => {
                const markerClass = mission.current
                  ? "bg-white shadow-[0_0_24px_rgba(255,255,255,0.28)]"
                  : mission.completed
                    ? "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.22)]"
                    : mission.futureLocked
                      ? "bg-amber-100/35 shadow-[0_0_18px_rgba(251,191,36,0.08)]"
                      : "bg-amber-100/70"

                return (
                  <div key={mission.id} className="relative">
                    <div className={`absolute left-[-29px] top-7 h-5 w-5 rounded-full border border-white/14 ${markerClass} sm:left-[-35px]`} />
                    <article
                      className={`rounded-[1.65rem] border p-4 ${
                        mission.current
                          ? "border-amber-100/22 bg-[linear-gradient(180deg,rgba(34,22,8,0.9),rgba(13,10,7,0.94))] shadow-[0_0_32px_rgba(251,191,36,0.12),0_20px_50px_rgba(0,0,0,0.22)]"
                          : mission.completed
                            ? "border-emerald-200/12 bg-[linear-gradient(180deg,rgba(18,20,14,0.84),rgba(9,8,8,0.9))] shadow-[0_14px_32px_rgba(0,0,0,0.16)]"
                            : "border-white/10 bg-[linear-gradient(180deg,rgba(17,13,10,0.78),rgba(9,8,8,0.86))] shadow-[0_0_18px_rgba(251,191,36,0.05),0_14px_32px_rgba(0,0,0,0.16)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
                            Mission {mission.missionNumber}
                          </div>
                          <h3 className="mt-2 text-xl font-black text-white">
                            {mission.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-200/76">
                            {mission.label}
                          </p>
                        </div>

                        <div className="text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-white/58">
                          {mission.current
                            ? "Active Mission"
                            : mission.completed
                              ? "Replay Ready"
                              : mission.futureLocked
                                ? "Mission Incoming"
                                : "Open"}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/62">
                        <span>
                          {mission.current
                            ? "Daily Mission Available"
                            : mission.completed
                              ? "Mastered path remains open"
                              : "There is more ahead"}
                        </span>
                        <span>
                          {mission.futureLocked ? "Unlocks Tomorrow" : "Continue Campaign"}
                        </span>
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mt-14 sm:mt-16">
          <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(19,14,10,0.94),rgba(10,9,8,0.98))] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.2)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/72">
              Mission Launch
            </div>
            <h2 className="mt-3 text-3xl font-black text-white">
              {selectedOption ? `${actionLabel} — ${selectedOption.label}` : "Choose a mission path to begin"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {selectedOption
                ? `${selectedOption.label} is ready. Enter the mission and move directly into the existing gameplay flow.`
                : "Your mission path determines the intensity of the upcoming encounter. Select one above to continue."}
            </p>

            <div className="mt-6">
              {selectedOption ? (
                <Link
                  href={quizHref}
                  className="block w-full rounded-full bg-amber-200 px-5 py-4 text-center text-lg font-black text-[#2c1600] shadow-[0_0_36px_rgba(251,191,36,0.22)] transition hover:scale-[1.01]"
                >
                  {actionLabel} →
                </Link>
              ) : (
                <div className="w-full rounded-full border border-white/12 bg-white/8 px-5 py-4 text-center text-base font-semibold text-white/64">
                  Select a mission path first
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
