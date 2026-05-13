"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"

type QuestStatus = "Ready" | "Practice" | "Locked" | "Coming Soon"

function QuestCard({
  title,
  href,
  accentClass,
  icon,
  description,
  status,
  sessionType,
  detail,
  ctaLabel,
  locked = false,
}: {
  title: string
  href: string
  accentClass: string
  icon: "quests" | "verse-memory" | "upgrade" | "home"
  description: string
  status: QuestStatus
  sessionType: string
  detail: string
  ctaLabel: string
  locked?: boolean
}) {
  const statusClass =
    status === "Ready"
      ? "ba-badge-success"
      : status === "Practice"
        ? "ba-badge-gold"
        : "ba-badge-locked"

  const card = (
    <article
      className={`relative overflow-hidden rounded-[1.9rem] p-5 transition duration-200 sm:p-6 ${
        locked
          ? "border border-white/8 bg-[linear-gradient(180deg,rgba(41,37,36,0.92),rgba(24,24,27,0.96))] opacity-88 shadow-[0_18px_46px_rgba(0,0,0,0.26)]"
          : "ba-card hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(0,0,0,0.34)] active:scale-[0.99]"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border ${
              locked
                ? "border-white/10 bg-white/5 text-zinc-200"
                : "border-white/10 bg-white/6 text-white"
            }`}
          >
            {renderNavIcon(icon, "h-5 w-5")}
          </div>

          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300/76">
              Quest Challenge
            </div>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
          </div>
        </div>

        <div className={statusClass}>{status}</div>
      </div>

      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
        {description}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="ba-card-soft rounded-[1.1rem] px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Session Type
          </div>
          <div className="mt-2 text-sm font-semibold text-white">{sessionType}</div>
        </div>

        <div className="ba-card-soft rounded-[1.1rem] px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Focus
          </div>
          <div className="mt-2 text-sm font-semibold text-white">{detail}</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          {locked ? "This challenge will open later." : "Focused skill training outside the daily arena."}
        </div>

        <div
          className={
            locked
              ? "ba-button-locked shrink-0 px-4 py-3 text-sm font-black"
              : "ba-button-primary shrink-0 px-4 py-3 text-sm font-black"
          }
        >
          {ctaLabel}
        </div>
      </div>
    </article>
  )

  if (locked) {
    return <div>{card}</div>
  }

  return (
    <Link href={href} className="block">
      {card}
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

    void run()
  }, [])

  const allowedPlans = ["pro_plus", "family_pro_plus"]

  if (loading) {
    return <div className="px-4 py-6 text-white">Loading...</div>
  }

  if (!allowedPlans.includes(plan)) {
    return (
      <Paywall
        title="Quests Locked"
        message="Upgrade to Pro+ to unlock premium Bible skill challenges, focused practice modes, and deeper mastery paths."
      />
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_24%),radial-gradient(circle_at_top,rgba(250,204,21,0.14),transparent_48%),linear-gradient(180deg,#07101a_0%,#090d16_42%,#04070f_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute left-[-4rem] top-20 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-36 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="ba-card rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="ba-badge-gold">Quests</div>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Sharpen specialized Bible skills.
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-lg sm:leading-8">
                Practice focused challenge modes like speaker recognition, book order, and Scripture recall patterns.
              </p>
            </div>

            <Link
              href="/quests/who-said-it"
              className="ba-button-primary w-full px-5 py-4 text-base font-black sm:w-auto"
            >
              Start a Quest
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="ba-card-soft rounded-[1.35rem] px-4 py-4">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Available Quests
            </div>
            <div className="mt-2 text-2xl font-black text-white">2</div>
          </div>

          <div className="ba-card-soft rounded-[1.35rem] px-4 py-4">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Practice Modes
            </div>
            <div className="mt-2 text-2xl font-black text-white">2</div>
          </div>

          <div className="ba-card-soft rounded-[1.35rem] px-4 py-4">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              XP Rules
            </div>
            <div className="mt-2 text-lg font-black text-white">Mode-based rewards</div>
          </div>

          <div className="ba-card-soft rounded-[1.35rem] px-4 py-4">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Current Focus
            </div>
            <div className="mt-2 text-lg font-black text-white">Recognition and structure</div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <QuestCard
            title="Who Said It?"
            href="/quests/who-said-it"
            accentClass="from-cyan-300 via-sky-400 to-blue-500"
            icon="quests"
            description="Train speaker recognition through key moments in Scripture."
            status="Practice"
            sessionType="Practice drill"
            detail="Voice recognition and context recall"
            ctaLabel="Enter Quest"
          />

          <QuestCard
            title="Books of the Bible"
            href="/quests/books"
            accentClass="from-amber-300 via-yellow-400 to-orange-500"
            icon="verse-memory"
            description="Master Bible order, categories, and structure."
            status="Ready"
            sessionType="Challenge hub"
            detail="Order, categories, speed, and structure"
            ctaLabel="Start Challenge"
          />

          <QuestCard
            title="Characters"
            href="/quests/characters"
            accentClass="from-stone-400 via-amber-500 to-orange-600"
            icon="upgrade"
            description="Recognize people, roles, and key story connections across Scripture."
            status="Coming Soon"
            sessionType="Locked challenge"
            detail="Character recognition and narrative recall"
            ctaLabel="Coming Soon"
            locked
          />
        </section>
      </div>
    </div>
  )
}
