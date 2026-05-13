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
    <div className={`ba-card relative rounded-3xl p-5 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30 ${
      disabled
        ? "opacity-60 cursor-not-allowed"
        : `${highlightClassName || ""} cursor-pointer hover:border-cyan-300/18 hover:shadow-[0_24px_48px_rgba(0,0,0,0.34)] active:scale-[0.98]`
    }`}>
      {statusBadge}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {title}
            </h2>
            {!disabled && title === "Order Builder" && (
              <span className="ba-badge-cyan ml-2">
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
      </div>

      <div className="mt-4">
        <div className={`inline-flex w-full justify-center px-4 py-2.5 text-sm font-semibold ${
          disabled
            ? "ba-button-locked"
            : buttonClassName || "ba-button-primary"
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

      const today = new Date().toISOString().slice(0, 10)

      const { data: speedData } = await supabase
        .from("user_daily_activity")
        .select("id")
        .eq("user_id", user.id)
        .eq("mode", "speed_round")
        .eq("activity_date", today)

      if (speedData && speedData.length > 0) {
        setSpeedStatus("practice")
      } else {
        setSpeedStatus("xp")
      }

      const { data: testData } = await supabase
        .from("user_daily_activity")
        .select("id")
        .eq("user_id", user.id)
        .eq("mode", "test_mode")
        .eq("activity_date", today)

      if (testData && testData.length > 0) {
        setTestStatus("practice")
      } else {
        setTestStatus("xp")
      }
    }

    void checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black px-4 py-6 text-white">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <div className="ba-card rounded-3xl p-6">
          <div className="text-sm uppercase tracking-[0.28em] text-amber-300">
            Quest Hub
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white">
            Books of the Bible
          </h1>
          <p className="mt-3 text-base text-gray-300">
            Train your mastery in multiple ways
          </p>
        </div>

        <div className="flex flex-col gap-4 animate-[fadeIn_0.4s_ease-out]">
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
                <p className="text-green-400 text-sm font-semibold mt-2">
                  🔥 Daily XP Ready
                </p>
              ) : speedStatus === "practice" ? (
                <p className="text-yellow-400 text-sm mt-2">
                  🧪 Practice Mode — XP already earned
                </p>
              ) : undefined
            }
            statusBadge={
              <div className="absolute top-3 right-3">
                {speedStatus === "xp" && (
                  <span className="ba-badge-success animate-pulse">
                    🔥 XP Ready
                  </span>
                )}
                {speedStatus === "practice" && (
                  <span className="ba-badge-gold">
                    Practice
                  </span>
                )}
              </div>
            }
            highlightClassName={
              speedStatus === "xp"
                ? "ring-1 ring-emerald-300/34 shadow-[0_0_30px_rgba(52,211,153,0.18)]"
                : speedStatus === "practice"
                  ? "opacity-80"
                  : ""
            }
            buttonClassName={
              speedStatus === "practice"
                ? "ba-button-secondary"
                : "ba-button-primary"
            }
            badge="Play"
            href="/quests/books/speed"
          />

          <HubCard
            title="Test Mode"
            description="Challenge yourself with a more demanding mastery check across all books."
            rewardNote={
              testStatus === "xp" ? (
                <p className="text-green-400 text-sm font-semibold mt-2">
                  🔥 Daily XP Ready
                </p>
              ) : testStatus === "practice" ? (
                <p className="text-yellow-400 text-sm mt-2">
                  🧪 Practice Mode — XP already earned
                </p>
              ) : undefined
            }
            statusBadge={
              <div className="absolute top-3 right-3">
                {testStatus === "xp" && (
                  <span className="ba-badge-success animate-pulse">
                    🔥 XP Ready
                  </span>
                )}
                {testStatus === "practice" && (
                  <span className="ba-badge-gold">
                    Practice
                  </span>
                )}
              </div>
            }
            highlightClassName={
              testStatus === "xp"
                ? "ring-1 ring-emerald-300/34 shadow-[0_0_30px_rgba(52,211,153,0.18)]"
                : testStatus === "practice"
                  ? "opacity-80"
                  : ""
            }
            buttonClassName={
              testStatus === "practice"
                ? "ba-button-secondary"
                : "ba-button-primary"
            }
            badge="Play"
            href="/quests/books/test"
          />
        </div>
      </div>
    </div>
  )
}
