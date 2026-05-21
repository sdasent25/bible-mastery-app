"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import {
  BooksQuestHero,
  BooksQuestPageShell,
  BooksQuestPanel,
  BooksQuestStatusBadge,
} from "@/components/BooksQuestShell"
import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"
import { isQuestPlan } from "@/lib/questAccess"
import { createClient } from "@/lib/supabase/client"

type HubCardProps = {
  title: string
  description: string
  href?: string
  disabled?: boolean
  status: "Practice" | "Daily XP" | "Locked"
  detail: string
  ctaLabel: string
  accentClass: string
  icon: "home" | "quests" | "upgrade" | "verse-memory"
}

function ModeCard({
  title,
  description,
  href,
  disabled = false,
  status,
  detail,
  ctaLabel,
  accentClass,
  icon,
}: HubCardProps) {
  const statusTone =
    status === "Daily XP"
      ? "ready"
      : status === "Practice"
        ? "practice"
        : "locked"

  const card = (
    <article
      className={`relative overflow-hidden rounded-[1.8rem] p-5 transition duration-200 sm:p-6 ${
        disabled
          ? "border border-white/8 bg-[linear-gradient(180deg,rgba(41,37,36,0.92),rgba(24,24,27,0.96))] opacity-85 shadow-[0_18px_46px_rgba(0,0,0,0.26)]"
          : "ba-card hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(0,0,0,0.34)] active:scale-[0.99]"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/6 text-white">
            {renderNavIcon(icon, "h-5 w-5")}
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300/76">
              Books Quest
            </div>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
          </div>
        </div>

        <BooksQuestStatusBadge tone={statusTone}>{status}</BooksQuestStatusBadge>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
        {description}
      </p>

      <div className="mt-5 rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Focus
        </div>
        <div className="mt-2 text-sm font-semibold text-white">{detail}</div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          {disabled ? "This mode is not currently available." : "Focused structure and recall training."}
        </div>
        <div className={disabled ? "ba-button-locked px-4 py-3 text-sm font-black" : "ba-button-primary px-4 py-3 text-sm font-black"}>
          {ctaLabel}
        </div>
      </div>
    </article>
  )

  if (disabled || !href) {
    return <div>{card}</div>
  }

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  )
}

export default function BooksQuestHubPage() {
  const [plan, setPlan] = useState("free")
  const [planLoading, setPlanLoading] = useState(true)
  const [speedStatus, setSpeedStatus] = useState<"xp" | "practice" | null>(null)
  const [testStatus, setTestStatus] = useState<"xp" | "practice" | null>(null)

  useEffect(() => {
    const resolvePlan = async () => {
      const resolvedPlan = await getUserPlan()
      setPlan(resolvedPlan)
      setPlanLoading(false)
    }

    void resolvePlan()
  }, [])

  useEffect(() => {
    if (planLoading || !isQuestPlan(plan)) {
      return
    }

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
  }, [plan, planLoading])

  if (planLoading) {
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
    <BooksQuestPageShell maxWidth="max-w-6xl">
      <BooksQuestHero
        eyebrow="Books Quest"
        title="Books of the Bible"
        subtitle="Master Bible order, structure, categories, and speed recall through focused challenge modes built for long-term mastery."
        actions={
          <Link
            href="/quests/books/order"
            className="ba-button-primary w-full px-5 py-4 text-base font-black lg:w-auto"
          >
            Start Order Builder
          </Link>
        }
        stats={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="ba-card-soft rounded-[1.2rem] px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Modes
              </div>
              <div className="mt-2 text-2xl font-black text-white">4</div>
            </div>
            <div className="ba-card-soft rounded-[1.2rem] px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Skills
              </div>
              <div className="mt-2 text-lg font-black text-white">Order and structure</div>
            </div>
            <div className="ba-card-soft rounded-[1.2rem] px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Daily XP
              </div>
              <div className="mt-2 text-lg font-black text-white">Speed and test modes</div>
            </div>
            <div className="ba-card-soft rounded-[1.2rem] px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Focus
              </div>
              <div className="mt-2 text-lg font-black text-white">Recall under pressure</div>
            </div>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <ModeCard
          title="Order Builder"
          description="Practice the canonical flow of Scripture by placing books in the correct order."
          href="/quests/books/order"
          status="Practice"
          detail="Canonical order practice with no XP awarded"
          ctaLabel="Start Practice"
          accentClass="from-cyan-300 via-sky-400 to-blue-500"
          icon="home"
        />

        <ModeCard
          title="Category Sort"
          description="Practice Bible structure by grouping books into the right categories."
          href="/quests/books/sort"
          status="Practice"
          detail="Category drills with no XP awarded"
          ctaLabel="Start Practice"
          accentClass="from-emerald-300 via-teal-400 to-cyan-500"
          icon="verse-memory"
        />

        <ModeCard
          title="Speed Round"
          description="Race the clock and sharpen recall."
          href="/quests/books/speed"
          status={speedStatus === "xp" ? "Daily XP" : "Practice"}
          detail={
            speedStatus === "xp"
              ? "One rewarded run per day, then practice mode"
              : "Practice mode after today's rewarded run"
          }
          ctaLabel={speedStatus === "xp" ? "Start Daily Run" : "Practice"}
          accentClass="from-amber-300 via-yellow-400 to-orange-500"
          icon="quests"
        />

        <ModeCard
          title="Test Mode"
          description="Prove your mastery with a focused challenge."
          href="/quests/books/test"
          status={testStatus === "xp" ? "Daily XP" : "Practice"}
          detail={
            testStatus === "xp"
              ? "One rewarded run per day, then practice mode"
              : "Practice mode after today's rewarded run"
          }
          ctaLabel={testStatus === "xp" ? "Start Daily Test" : "Practice"}
          accentClass="from-violet-300 via-fuchsia-400 to-pink-500"
          icon="upgrade"
        />
      </div>

      <BooksQuestPanel className="rounded-[1.7rem]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="ba-badge">Quest Structure</div>
            <h2 className="mt-3 text-2xl font-black text-white">
              Train the full map of the Bible
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Build confidence in canonical order, categories, and rapid recall without changing your daily arena flow.
            </p>
          </div>
          <Link
            href="/quests"
            className="ba-button-secondary w-full px-5 py-4 text-base font-semibold lg:w-auto"
          >
            Back to Quests
          </Link>
        </div>
      </BooksQuestPanel>
    </BooksQuestPageShell>
  )
}
