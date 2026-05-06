"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

import { nodes } from "@/lib/nodes"
import { getProgramProgress, getResumeSegmentIndex, type ProgramProgress } from "@/lib/programProgress"
import { createClient } from "@/lib/supabase/client"
import { getUserPlan } from "@/lib/getUserPlan"

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

type MissionMeta = {
  title: string
  subtitle: string
  atmosphere: string
}

const GENESIS_MISSION_META: Record<string, MissionMeta> = {
  genesis_1_3: {
    title: "In the Beginning",
    subtitle: "Creation light breaks over the void as the first mission opens.",
    atmosphere: "The Foundations of Creation",
  },
  genesis_4_6: {
    title: "The First Family",
    subtitle: "The beauty of Eden gives way to exile, labor, and the first bloodshed.",
    atmosphere: "The fracture of humanity",
  },
  genesis_7_9: {
    title: "Waters Above",
    subtitle: "Judgment and mercy meet as the flood remakes the world.",
    atmosphere: "Storm and covenant",
  },
  genesis_10_12: {
    title: "The Scattered Nations",
    subtitle: "Pride rises in Babel before the call of Abram begins a new line.",
    atmosphere: "Cities, tongues, and calling",
  },
  genesis_13_15: {
    title: "Promise Under the Stars",
    subtitle: "Abram walks by faith beneath a covenant sky.",
    atmosphere: "The promise widens",
  },
  genesis_16_18: {
    title: "Covenant Fire",
    subtitle: "Names are changed and promise grows clearer in the wilderness.",
    atmosphere: "Sacred visitation",
  },
  genesis_19_21: {
    title: "Ashes and Laughter",
    subtitle: "Judgment falls, yet the child of promise is born.",
    atmosphere: "Fire over the plain",
  },
  genesis_22_24: {
    title: "Upon the Mountain",
    subtitle: "A test of devotion leads to provision and lasting memory.",
    atmosphere: "Sacrifice and provision",
  },
  genesis_25_27: {
    title: "The Rival Sons",
    subtitle: "Inheritance, hunger, and blessing shape the next generation.",
    atmosphere: "Conflict in the house",
  },
  genesis_28_30: {
    title: "The Ladder and the Long Road",
    subtitle: "Jacob flees, dreams, and begins the slow work of becoming Israel.",
    atmosphere: "Exile and encounter",
  },
  genesis_31_33: {
    title: "The Night of Wrestling",
    subtitle: "Fear, return, and surrender mark the road home.",
    atmosphere: "Reunion at dawn",
  },
  genesis_34_36: {
    title: "Bloodlines and Brokenness",
    subtitle: "The family grows in number even while wounds deepen.",
    atmosphere: "The cost of inheritance",
  },
  genesis_37_39: {
    title: "The Dreamer Sold",
    subtitle: "Joseph descends into betrayal, slavery, and hidden favor.",
    atmosphere: "The coat and the pit",
  },
  genesis_40_42: {
    title: "The Prison of Waiting",
    subtitle: "Dreams return as God prepares a rise through confinement.",
    atmosphere: "Silence before ascent",
  },
  genesis_43_46: {
    title: "Bread in Egypt",
    subtitle: "Provision, testing, and revelation gather the family again.",
    atmosphere: "Reckoning and mercy",
  },
  genesis_47_50: {
    title: "The End of Beginnings",
    subtitle: "Blessing, burial, and promise close the first great book.",
    atmosphere: "Inheritance remembered",
  },
}

const DEFAULT_PROGRESS: ProgramProgress = {
  programId: "genesis",
  currentSegmentIndex: 0,
  completed: false,
  bonusAwarded: false,
}

function normalizeSegmentId(id: string) {
  return id.replaceAll("_", "-")
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function getMissionArt(segmentId: string) {
  if (segmentId.includes("1_3")) return "/icons/genesis/creation.png"
  if (segmentId.includes("4_6")) return "/icons/genesis/people.png"
  if (segmentId.includes("7_9")) return "/icons/genesis/flood.png"
  if (segmentId.includes("10_12")) return "/icons/genesis/tower.png"
  if (segmentId.includes("13_15")) return "/icons/genesis/promise.png"
  if (segmentId.includes("16_18")) return "/icons/genesis/covenant.png"
  if (segmentId.includes("19_21")) return "/icons/genesis/fire.png"
  if (segmentId.includes("22_24")) return "/icons/genesis/sacrifice.png"
  if (segmentId.includes("25_27")) return "/icons/genesis/twins.png"
  if (segmentId.includes("28_30")) return "/icons/genesis/ladder.png"
  if (segmentId.includes("31_33")) return "/icons/genesis/reunion.png"
  if (segmentId.includes("34_36")) return "/icons/genesis/conflict.png"
  if (segmentId.includes("37_39")) return "/icons/genesis/coat.png"
  if (segmentId.includes("40_42")) return "/icons/genesis/prison.png"
  if (segmentId.includes("43_46")) return "/icons/genesis/provision.png"
  if (segmentId.includes("47_50")) return "/icons/genesis/egypt.png"

  return "/explorer/pentateuch/region.png"
}

export default function ExploreBookPage() {
  const params = useParams<{ book: string }>()
  const book = params?.book ?? ""
  const supabase = createClient()
  const [mastery, setMastery] = useState<MasteryRow[]>([])
  const [progress, setProgress] = useState<ProgramProgress>(DEFAULT_PROGRESS)
  const [planType, setPlanType] = useState<PlanType>("free")
  const [loading, setLoading] = useState(book === "genesis")

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
    const hasPaidAccess =
      planType === "pro" ||
      planType === "pro_plus" ||
      planType === "family_pro" ||
      planType === "family_pro_plus"
    const completedMissionCount = progress.completed
      ? genesisNodes.length
      : Math.min(safeIndex, genesisNodes.length)
    const masteryCount = genesisNodes.filter((node) =>
      masteredSet.has(normalizeSegmentId(node.id))
    ).length

    const missions = genesisNodes.map((node, index) => {
      const meta = GENESIS_MISSION_META[node.id] || {
        title: node.label,
        subtitle: "Continue through the campaign and deepen your mastery of this passage.",
        atmosphere: "Sacred mission",
      }
      const mastered = masteredSet.has(normalizeSegmentId(node.id))
      const completed = progress.completed || index < safeIndex
      const current = !progress.completed && index === safeIndex
      const unlocked = hasPaidAccess ? index <= safeIndex : index === 0
      const locked = !unlocked

      return {
        ...node,
        ...meta,
        missionNumber: index + 1,
        mastered,
        completed,
        current,
        locked,
        href: `/segment?program=genesis&segment=${normalizeSegmentId(node.id)}`,
        artSrc: getMissionArt(node.id),
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

  const currentMission = genesisCampaign.currentMission

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
              The campaign always brings the next mission forward, then hands off into
              the existing Scripture and quiz flow when you enter it.
            </p>
          </div>

          {currentMission && (
            <div className="relative overflow-hidden rounded-[2.2rem] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
              <div className="absolute inset-0">
                <Image
                  src={currentMission.artSrc}
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
                      Mission {currentMission.missionNumber}
                    </div>
                    <h3 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white drop-shadow-[0_5px_20px_rgba(0,0,0,0.45)] sm:text-5xl">
                      {currentMission.title}
                    </h3>
                    <p className="mt-3 text-lg font-semibold text-amber-100/80">
                      {currentMission.atmosphere}
                    </p>
                    <p className="mt-4 max-w-xl text-base leading-7 text-slate-100/84 sm:text-lg">
                      {currentMission.subtitle}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-amber-50/78">
                    <div>{currentMission.label}</div>
                    <div>{currentMission.mastered ? "Mastered" : currentMission.completed ? "Cleared" : "Ready now"}</div>
                    <div>{currentMission.locked ? "Locked" : "Open path"}</div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-black/24 p-5 backdrop-blur-sm">
                  <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/62">
                    Mission Focus
                  </div>
                  <div className="mt-4 text-5xl font-black text-white">
                    {currentMission.missionNumber}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {currentMission.completed
                      ? "Return to this mission or continue deeper into the campaign."
                      : "Read the passage, choose your depth, and enter the current Genesis mission."}
                  </div>
                  <div className="mt-6 h-[6px] overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-100 via-yellow-200 to-orange-300 shadow-[0_0_36px_rgba(251,191,36,0.22)]"
                      style={{ width: `${((currentMission.missionNumber - 1) / Math.max(genesisCampaign.totalMissions - 1, 1)) * 100}%` }}
                    />
                  </div>
                  <div className="mt-6">
                    {currentMission.locked ? (
                      <div className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/70">
                        Complete earlier missions to unlock
                      </div>
                    ) : (
                      <Link
                        href={currentMission.href}
                        className="inline-flex rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-[#2c1600] shadow-[0_0_36px_rgba(251,191,36,0.22)] transition hover:scale-[1.01]"
                      >
                        {currentMission.completed ? "Revisit Mission" : "Start Mission"} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

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
                    ? "bg-white shadow-[0_0_20px_rgba(255,255,255,0.24)]"
                    : mission.completed
                      ? "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.22)]"
                      : mission.locked
                        ? "bg-white/20"
                        : "bg-amber-100/70"

                const shellClass = mission.current
                  ? "border-amber-100/22 bg-[linear-gradient(180deg,rgba(34,22,8,0.92),rgba(13,10,7,0.94))] shadow-[0_24px_54px_rgba(0,0,0,0.28)]"
                  : mission.mastered
                    ? "border-amber-100/18 bg-[linear-gradient(180deg,rgba(28,20,8,0.88),rgba(11,9,7,0.92))] shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
                    : "border-white/10 bg-[linear-gradient(180deg,rgba(17,13,10,0.84),rgba(9,8,8,0.9))] shadow-[0_16px_36px_rgba(0,0,0,0.18)]"

                return (
                  <div key={mission.id} className="relative">
                    <div className={`absolute left-[-29px] top-8 h-5 w-5 rounded-full border border-white/14 ${markerClass} sm:left-[-35px]`} />

                    <article className={`overflow-hidden rounded-[1.8rem] border ${shellClass}`}>
                      <div className="relative">
                        <div className="absolute inset-0 opacity-24">
                          <Image
                            src={mission.artSrc}
                            alt=""
                            fill
                            className="object-cover object-center"
                            sizes="100vw"
                          />
                        </div>
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,7,5,0.18),rgba(9,7,5,0.50))]" />

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
                                  ? "Current"
                                  : mission.completed
                                    ? "Cleared"
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
                            <span>{mission.mastered ? "Mastery glow active" : "Mastery in progress"}</span>
                            <span>{mission.locked ? "Awaiting previous mission" : "Campaign path open"}</span>
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
                              <div className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white/60">
                                Locked until previous mission is complete
                              </div>
                            ) : (
                              <Link
                                href={mission.href}
                                className="inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/14"
                              >
                                {mission.current ? "Enter Mission" : mission.completed ? "Revisit" : "Open Mission"} →
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
