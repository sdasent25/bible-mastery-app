import Link from "next/link"

import TrainingPlayer from "@/components/training/TrainingPlayer"
import {
  filterTrainingItemsForAccess,
  getTrainingAccessState,
  loadTrainingDay,
} from "@/lib/training/loadTrainingDay"

type TrainingPlayPageProps = {
  params: Promise<{
    day: string
  }>
}

function Shell({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  actions: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#25375f_0%,_#101728_32%,_#070b14_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(8,12,20,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-200/78">
          {eyebrow}
        </div>
        <h1 className="mt-4 text-3xl font-black text-white">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
      </div>
    </main>
  )
}

export default async function TrainingDayPlayPage({
  params,
}: TrainingPlayPageProps) {
  const resolvedParams = await params
  const dayNumber = Number(resolvedParams.day)

  if (!Number.isInteger(dayNumber) || dayNumber < 1) {
    return (
      <Shell
        eyebrow="Training Arena"
        title="Training Day Not Found"
        description="That Training Arena day could not be found. Return to the hub and choose an available day."
        actions={
          <Link
            href="/training"
            className="rounded-full bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#2c1600] transition hover:scale-[1.01]"
          >
            Back to Training
          </Link>
        }
      />
    )
  }

  const [day, access] = await Promise.all([
    loadTrainingDay(dayNumber),
    getTrainingAccessState(),
  ])

  if (!day) {
    return (
      <Shell
        eyebrow="Training Arena"
        title="Training Day Not Found"
        description="That Training Arena day could not be found. Return to the hub and choose an available day."
        actions={
          <Link
            href="/training"
            className="rounded-full bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#2c1600] transition hover:scale-[1.01]"
          >
            Back to Training
          </Link>
        }
      />
    )
  }

  if (access.tier === "free" && dayNumber > 3) {
    return (
      <Shell
        eyebrow="Training Locked"
        title="Training Locked"
        description="Free preview includes the first 3 Training Days. Upgrade to Pro or Pro+ to continue the journey."
        actions={
          <>
            <Link
              href="/training"
              className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/14"
            >
              Back to Training
            </Link>
            <Link
              href={access.signedIn ? "/pricing" : "/login"}
              className="rounded-full bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#2c1600] transition hover:scale-[1.01]"
            >
              {access.signedIn ? "Upgrade" : "Sign In"}
            </Link>
          </>
        }
      />
    )
  }

  const filteredItems = filterTrainingItemsForAccess(day.items, access.tier)

  return (
    <TrainingPlayer
      day={day}
      items={filteredItems}
      accessTier={access.tier}
      signedIn={access.signedIn}
    />
  )
}
