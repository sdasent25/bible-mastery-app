"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"

function QuestCard({
  title,
  href,
  accentClass,
  imageLabel,
  description,
  locked = false,
  progress = 0,
  total = 0,
  statusLabel,
  overlayMessage,
  hideProgress = false,
}: {
  title: string
  href: string
  accentClass: string
  imageLabel: string
  description?: string
  locked?: boolean
  progress?: number
  total?: number
  statusLabel?: string
  overlayMessage?: string
  hideProgress?: boolean
}) {
  const progressPercent = total > 0 ? Math.min((progress / total) * 100, 100) : 0

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (locked) {
          event.preventDefault()
        }
      }}
      className={`ba-card block w-full overflow-hidden rounded-3xl transition active:scale-[0.99] ${locked ? "pointer-events-none relative opacity-50" : ""}`}
    >
      {locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center text-white">
            {overlayMessage || "Locked"}
          </div>
        </div>
      )}

      <div
        className={`flex h-52 w-full items-center justify-center bg-gradient-to-br ${accentClass} px-6 text-center`}
      >
        <div className="rounded-2xl border border-white/20 bg-black/20 px-6 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Image
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {imageLabel}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <div className="text-lg font-bold text-white">{title}</div>
          {description ? (
            <div className="mt-2 max-w-xs text-sm text-zinc-400">
              {description}
            </div>
          ) : null}
          {!hideProgress && !locked && (
            <>
              <div className="mt-3 h-2 w-44 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-zinc-300">
                {progress} / {total} completed
              </div>
            </>
          )}
        </div>
        <div className={locked ? "ba-badge-locked" : "ba-badge"}>
          {statusLabel || (locked ? "Locked" : "Open")}
        </div>
      </div>
    </Link>
  )
}

export default function QuestsPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const plan = await getUserPlan()
      setPlan(plan)
      setLoading(false)
    }

    run()
  }, [])

  const allowedPlans = ["pro_plus", "family_pro_plus"]

  if (loading) {
    return <div>Loading...</div>
  }

  if (!allowedPlans.includes(plan)) {
    return (
      <Paywall
        title="🔒 Quests Locked"
        message="Upgrade to Pro+ to unlock advanced quests and deep learning systems."
      />
    )
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-white">Quests</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Choose a quest and start training.
          </p>
        </div>

        <QuestCard
          title="Characters"
          href="/quests/characters"
          accentClass="from-emerald-700 via-emerald-600 to-teal-500"
          imageLabel="Heroes"
          locked
          progress={0}
          total={0}
          statusLabel="Coming Soon"
          overlayMessage="Coming Soon"
          hideProgress
        />

        <QuestCard
          title="Who Said It"
          href="/quests/who-said-it"
          accentClass="from-sky-700 via-blue-600 to-cyan-500"
          imageLabel="Voices"
          description="Practice Mode • No XP yet"
          locked={false}
          progress={0}
          total={0}
          statusLabel="16 Books Available"
          hideProgress
        />

        <QuestCard
          title="Books of the Bible"
          href="/quests/books"
          accentClass="from-amber-700 via-orange-600 to-yellow-500"
          imageLabel="Scrolls"
          locked={false}
          progress={0}
          total={10}
        />
      </div>
    </div>
  )
}
