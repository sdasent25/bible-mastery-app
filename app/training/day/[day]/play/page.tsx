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
  children,
}: {
  eyebrow: string
  title: string
  description: string
  actions: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#25375f_0%,_#101728_32%,_#070b14_100%)] px-3 py-4 text-white sm:px-5 sm:py-6">
      <div className="mx-auto max-w-2xl rounded-[1.9rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.08),transparent_34%),linear-gradient(180deg,rgba(18,24,38,0.98),rgba(8,12,20,0.98))] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] sm:p-7">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-200/78">
          {eyebrow}
        </div>
        <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-7 text-slate-300">{description}</p>
        {children ? <div className="mt-6">{children}</div> : null}
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
        description="You completed the free Training Arena preview."
        children={
          <div className="space-y-5">
            <div className="rounded-[1.35rem] border border-amber-200/16 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_38%),linear-gradient(180deg,rgba(31,22,11,0.94),rgba(11,11,15,0.96))] p-4 shadow-[0_0_36px_rgba(251,191,36,0.08)] sm:p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-amber-100/82">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-100/18 bg-black/20 text-xs">
                  🔒
                </span>
                Free Preview
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                Upgrade to continue the 365-day Scripture training path with deeper drills and full arena access.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">
                Unlock all available Training Days
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">
                Access deeper question sets
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">
                Train with image recognition
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/88">
                Prepare for mastery tracking
              </div>
            </div>
          </div>
        }
        actions={
          <>
            <Link
              href={access.signedIn ? "/pricing" : "/login"}
              className="rounded-full bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#2c1600] shadow-[0_14px_34px_rgba(251,191,36,0.18)] transition hover:scale-[1.01]"
            >
              {access.signedIn ? "Upgrade to Pro+" : "Sign In to Upgrade"}
            </Link>
            <Link
              href="/training"
              className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/14"
            >
              Back to Training
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
