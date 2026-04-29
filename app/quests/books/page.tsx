"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type HubCardProps = {
  title: string
  description: string
  rewardNote?: React.ReactNode
  badge: string
  href?: string
  disabled?: boolean
  statusBadge?: React.ReactNode
  highlightClassName?: string
  buttonClassName?: string
}

function HubCard({
  title,
  description,
  rewardNote,
  badge,
  href,
  disabled = false,
  statusBadge,
  highlightClassName,
  buttonClassName,
}: HubCardProps) {
  const content = (
    <div className={`relative rounded-3xl bg-slate-800 p-5 shadow-xl border border-white/5 transition-all duration-200 ease-out hover:scale-[1.02] ${
      disabled
        ? "opacity-60 cursor-not-allowed"
        : `${highlightClassName || ""} cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-400/20 active:scale-[0.98]`
    }`}>
      {statusBadge}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {title}
            </h2>
            {!disabled && title === "Order Builder" && (
              <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                Recommended
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-300">
            {description}
          </p>
          {rewardNote ? (
            <div className="mt-2">
              {rewardNote}
            </div>
          ) : null}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
          disabled
            ? "bg-gray-700 text-gray-200"
            : "bg-blue-600 text-white"
        }`}>
          {badge}
        </span>
      </div>

      <div className="mt-4">
        <div className={`inline-flex w-full justify-center rounded-2xl px-4 py-2 text-sm font-semibold ${
          disabled
            ? "bg-gray-800 text-gray-300"
            : buttonClassName || "bg-orange-500 hover:bg-orange-400 text-black font-semibold"
        }`}>
          {disabled ? "Coming Soon" : "Play Now"}
        </div>
      </div>
    </div>
  )

  if (disabled || !href) {
    return <div>{content}</div>
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  )
}

export default function BooksQuestHubPage() {
  const [speedStatus, setSpeedStatus] = useState<"xp" | "practice" | null>(null)
  const [testStatus, setTestStatus] = useState<"xp" | "practice" | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const checkStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split("T")[0]

      const { data: speedData } = await supabase
        .from("user_daily_activity")
        .select("id")
        .eq("user_id", user.id)
        .eq("mode", "speed_round")
        .eq("activity_date", today)

      setSpeedStatus(speedData && speedData.length > 0 ? "practice" : "xp")

      const { data: testData } = await supabase
        .from("user_daily_activity")
        .select("id")
        .eq("user_id", user.id)
        .eq("mode", "test_mode")
        .eq("activity_date", today)

      setTestStatus(testData && testData.length > 0 ? "practice" : "xp")
    }

    void checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-gray-950/90 p-6 shadow-2xl">
          <div className="text-sm uppercase tracking-[0.28em] text-amber-400">
            Quest Hub
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white">
            Books of the Bible
          </h1>
          <p className="mt-3 text-base text-gray-300">
            Train your mastery in multiple ways
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <HubCard
            title="Order Builder"
            description="Tap through the books in their correct canonical order and build recall fast."
            badge="Play"
            href="/quests/books/order"
          />

          <HubCard
            title="Category Sort"
            description="Group books by section and sharpen your understanding of the Bible's structure."
            badge="Play"
            href="/quests/books/sort"
          />

          <HubCard
            title="Speed Round"
            description="Race the clock and lock in faster recognition under pressure."
            rewardNote={
              speedStatus === "xp" ? (
                <div className="text-sm text-green-300 font-semibold">
                  🔥 Daily XP Ready
                </div>
              ) : speedStatus === "practice" ? (
                <div className="text-sm text-yellow-300">
                  Practice Mode — XP earned today
                </div>
              ) : undefined
            }
            statusBadge={
              <div className="absolute top-3 right-3">
                {speedStatus === "xp" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
                    🔥 XP Ready
                  </span>
                )}
                {speedStatus === "practice" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                    Practice
                  </span>
                )}
              </div>
            }
            highlightClassName={
              speedStatus === "xp"
                ? "ring-1 ring-green-400/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                : speedStatus === "practice"
                  ? "opacity-80"
                  : ""
            }
            buttonClassName={
              speedStatus === "practice"
                ? "bg-orange-500/70 hover:bg-orange-400 text-black"
                : "bg-orange-500 hover:bg-orange-400 text-black font-semibold"
            }
            badge="Play"
            href="/quests/books/speed"
          />

          <HubCard
            title="Test Mode"
            description="Challenge yourself with a more demanding mastery check across all books."
            rewardNote={
              testStatus === "xp" ? (
                <div className="text-sm text-green-300 font-semibold">
                  🔥 Daily XP Ready
                </div>
              ) : testStatus === "practice" ? (
                <div className="text-sm text-yellow-300">
                  Practice Mode — XP earned today
                </div>
              ) : undefined
            }
            statusBadge={
              <div className="absolute top-3 right-3">
                {testStatus === "xp" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
                    🔥 XP Ready
                  </span>
                )}
                {testStatus === "practice" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                    Practice
                  </span>
                )}
              </div>
            }
            highlightClassName={
              testStatus === "xp"
                ? "ring-1 ring-green-400/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                : testStatus === "practice"
                  ? "opacity-80"
                  : ""
            }
            buttonClassName={
              testStatus === "practice"
                ? "bg-orange-500/70 hover:bg-orange-400 text-black"
                : "bg-orange-500 hover:bg-orange-400 text-black font-semibold"
            }
            badge="Play"
            href="/quests/books/test"
          />
        </div>
      </div>
    </div>
  )
}
