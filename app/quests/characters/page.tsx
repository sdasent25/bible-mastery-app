"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { BooksQuestPageShell, BooksQuestPanel } from "@/components/BooksQuestShell"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"
import { isQuestPlan } from "@/lib/questAccess"

export default function CharactersPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resolvePlan = async () => {
      const resolvedPlan = await getUserPlan()
      setPlan(resolvedPlan)
      setLoading(false)
    }

    void resolvePlan()
  }, [])

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  if (!isQuestPlan(plan)) {
    return (
      <Paywall
        title="Quests Locked"
        message="Upgrade to Pro+ to unlock challenge modes, focused Bible structure drills, and deeper quest training paths."
      />
    )
  }

  return (
    <BooksQuestPageShell maxWidth="max-w-3xl">
      <BooksQuestPanel className="overflow-hidden rounded-[2rem]">
        <div className="relative overflow-hidden rounded-[1.6rem] border border-violet-300/16 bg-[linear-gradient(180deg,rgba(34,20,58,0.84),rgba(10,9,23,0.96))] p-5 sm:p-6">
          <div className="pointer-events-none absolute left-[-2rem] top-[-2rem] h-32 w-32 rounded-full bg-violet-400/14 blur-3xl" />
          <div className="pointer-events-none absolute right-[-2rem] bottom-[-2rem] h-36 w-36 rounded-full bg-fuchsia-400/12 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/16 bg-violet-300/10 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-violet-100">
              {renderNavIcon("upgrade", "h-3.5 w-3.5")}
              Coming Soon
            </div>

            <h1 className="ba-font-display mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
              Characters Quest
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Train character recognition across Scripture through future challenge modes focused on people, roles, and story connections.
            </p>

            <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                Current Status
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                This quest family is still being prepared.
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                No character gameplay is live yet. Check back later for the full challenge rollout.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quests"
                className="ba-button-primary px-5 py-4 text-center text-base font-black"
              >
                Back to Quests
              </Link>
              <Link
                href="/quests/books"
                className="ba-button-secondary px-5 py-4 text-center font-semibold"
              >
                Explore Books Quest
              </Link>
            </div>
          </div>
        </div>
      </BooksQuestPanel>
    </BooksQuestPageShell>
  )
}
