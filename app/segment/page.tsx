"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getUserPlan } from "@/lib/getUserPlan"

export default function SegmentIntro() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [planType, setPlanType] = useState("free")
  const [questionCount, setQuestionCount] = useState<number | null>(null)
  const [availableCount, setAvailableCount] = useState<number | null>(null)

  const segment = searchParams.get("segment") || ""
  const program = searchParams.get("program") || "genesis"
  const isFree = planType === "free"

  console.log("SEGMENT ACCESS CHECK", {
    planType,
    segment,
    program
  });

  const match = segment.match(/^([a-z]+)-(\d+)-(\d+)$/)

  let book: string | null = null
  let chapter: number | null = null

  if (match) {
    book = match[1].charAt(0).toUpperCase() + match[1].slice(1)
    chapter = Number(match[3])
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
        console.log("FINAL PLAN:", plan)
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

    const isFirstFreeSegment = planType === "free" && segment === "genesis-1-3"

    const hasFullAccess =
      planType === "pro" ||
      planType === "pro_plus" ||
      planType === "family_pro" ||
      planType === "family_pro_plus"

    if (!hasFullAccess && !isFirstFreeSegment) {
      console.error("REDIRECT TRIGGERED HERE", {
        location: "app/segment/page.tsx",
        planType,
        isPro: planType === "pro" || planType === "family_pro",
        isProPlus: planType === "pro_plus" || planType === "family_pro_plus",
        activeProgramId: null,
        segmentParam: segment,
        safeDepth: questionCount
      });
      router.push("/pricing?source=journey_locked")
      return
    }
  }, [book, chapter, planType, profileLoaded, router, segment])

  useEffect(() => {
    if (!segment) return

    fetch(`/api/quiz/question-count?segment=${segment}`)
      .then(res => res.json())
      .then(data => {
        setAvailableCount(data.count || 0)
      })
  }, [segment])

  if (!profileLoaded) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center">
        Loading...
      </div>
    )
  }

  function formatSegment(segment: string) {
    const parts = segment.split("-")
    const book = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    return `${book} ${parts[1]}-${parts[2]}`
  }

  function getImage(currentSegment: string) {
    if (currentSegment.includes("1-3")) return "creation.png"
    if (currentSegment.includes("4-6")) return "people.png"
    if (currentSegment.includes("7-9")) return "flood.png"
    if (currentSegment.includes("10-12")) return "tower.png"
    if (currentSegment.includes("13-15")) return "promise.png"
    if (currentSegment.includes("16-18")) return "covenant.png"
    if (currentSegment.includes("19-21")) return "fire.png"
    if (currentSegment.includes("22-24")) return "sacrifice.png"
    if (currentSegment.includes("25-27")) return "twins.png"
    if (currentSegment.includes("28-30")) return "ladder.png"
    if (currentSegment.includes("31-33")) return "reunion.png"
    if (currentSegment.includes("34-36")) return "conflict.png"
    if (currentSegment.includes("37-39")) return "coat.png"
    if (currentSegment.includes("40-42")) return "prison.png"
    if (currentSegment.includes("43-46")) return "provision.png"
    if (currentSegment.includes("47-50")) return "egypt.png"

    return "creation.png"
  }

  const imageName = getImage(segment)
  const quizHref = isFree
    ? `/quiz?segment=${segment}&depth=5`
    : `/quiz?program=${program}&segment=${segment}${questionCount ? `&depth=${questionCount}` : ""}`
  const depthOptions = [
    {
      id: "quick",
      label: "⚡ Quick Review",
      enabled: true,
      value: 5,
      unavailable: availableCount !== null && availableCount < 5,
      accentClass: "bg-neutral-800 text-white",
    },
    {
      id: "standard",
      label: "🎯 Standard Study",
      enabled: !isFree,
      value: 10,
      unavailable: availableCount !== null && availableCount < 10,
      accentClass: "bg-neutral-800 text-white",
    },
    {
      id: "deep",
      label: "🔥 Deep Study",
      enabled: !isFree,
      value: 15,
      unavailable: availableCount !== null && availableCount < 5,
      accentClass: "bg-green-500 text-black font-bold",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col">
      <Link
        href="/journey"
        className="absolute top-4 left-4 z-50 text-white text-2xl bg-black/40 px-3 py-1 rounded-lg"
      >
        ✕
      </Link>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-6">
        <div className="relative w-full max-w-md h-[55vh] rounded-2xl overflow-hidden shadow-2xl">
          {segment === "genesis-1-3" ? (
            <video
              autoPlay
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/animations/genesis/creation.mp4" type="video/mp4" />
            </video>
          ) : (
            <Image
              src={`/icons/genesis/${imageName}`}
              alt="segment"
              fill
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-4 right-4 text-center">
            <h1 className="text-2xl font-bold mb-2">
              {formatSegment(segment)}
            </h1>
            <p className="text-sm text-slate-300">
              Read and understand this passage before testing your knowledge
            </p>
          </div>
        </div>

        <div className="w-full max-w-md mt-2 space-y-2">
          <a
            href={`https://www.biblegateway.com/passage/?search=${segment.replace("-", "%20")}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold"
          >
            Read Scripture
          </a>

          {questionCount === null && (
            <div className="bg-[#0B1220] p-6 rounded-2xl text-center space-y-4 border border-white/10">
              <h2 className="text-xl font-bold text-white">
                Choose Your Depth
              </h2>

              <div className="space-y-3">
                {depthOptions.map((option) => {
                  const isLockedOption = !option.enabled
                  const isUnavailable = option.unavailable

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (isLockedOption) {
                          console.error("REDIRECT TRIGGERED HERE", {
                            location: "app/segment/page.tsx",
                            planType,
                            isPro: planType === "pro" || planType === "family_pro",
                            isProPlus: planType === "pro_plus" || planType === "family_pro_plus",
                            activeProgramId: null,
                            segmentParam: segment,
                            safeDepth: questionCount
                          });
                          router.push("/pricing")
                          return
                        }

                        if (isUnavailable) return

                        setQuestionCount(option.value)
                      }}
                      disabled={isUnavailable}
                      className={`w-full py-3 rounded-xl ${option.accentClass} ${isLockedOption ? "opacity-50" : ""} ${isUnavailable ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {option.label} {isLockedOption ? "🔒" : ""}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {questionCount !== null && (
            <Link
              href={quizHref}
              className="block w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-lg text-center"
            >
              Continue →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
