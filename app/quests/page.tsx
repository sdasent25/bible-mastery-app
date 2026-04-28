"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

function QuestCard({
  title,
  href,
  accentClass,
  imageLabel,
  locked = false,
  progress = 0,
  total = 0,
}: {
  title: string
  href: string
  accentClass: string
  imageLabel: string
  locked?: boolean
  progress?: number
  total?: number
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
      className={`block w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-lg transition active:scale-[0.99] ${locked ? "opacity-50 pointer-events-none relative" : ""}`}
    >
      {locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center text-white">
            🔒 Complete Genesis in Journey to unlock
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
          {!locked && (
            <>
              <div className="mt-3 h-2 w-44 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-green-400 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-zinc-300">
                {progress} / {total} completed
              </div>
            </>
          )}
        </div>
        <div className="rounded-full border border-white/15 px-3 py-1 text-sm text-zinc-200">
          {locked ? "Locked" : "Open"}
        </div>
      </div>
    </Link>
  )
}

export default function QuestsPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [genesisComplete, setGenesisComplete] = useState(false)
  const isDevUnlock = true

  useEffect(() => {
    const run = async () => {
      const plan = await getUserPlan()
      setPlan(plan)
      setLoading(false)
    }

    run()
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("user_segment_mastery")
        .select("segment, mastered")

      if (!data) return

      const genesisSegments = data.filter((d) =>
        d.segment.startsWith("genesis")
      )

      const allComplete =
        genesisSegments.length > 0 &&
        genesisSegments.every((s) => s.mastered)

      setGenesisComplete(allComplete)
    }

    void load()
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
          locked={false}
          progress={3}
          total={10}
        />

        <QuestCard
          title="Who Said It"
          href="/quests/who-said-it"
          accentClass="from-sky-700 via-blue-600 to-cyan-500"
          imageLabel="Voices"
          // const locked = !genesisComplete
          locked={!isDevUnlock}
          progress={0}
          total={10}
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
