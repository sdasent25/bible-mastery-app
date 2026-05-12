import Link from "next/link"

import {
  getTrainingAccessState,
  listTrainingDays,
} from "@/lib/training/loadTrainingDay"

export default async function TrainingPage() {
  const [days, access] = await Promise.all([
    listTrainingDays(),
    getTrainingAccessState(),
  ])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#25375f_0%,_#101728_32%,_#070b14_100%)] px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-3rem] top-40 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-[20rem] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.08),transparent_34%),linear-gradient(180deg,rgba(18,24,38,0.98),rgba(8,12,20,0.98))] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] sm:p-6 lg:p-7">
          <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-100/84">
            Training Arena
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Training Arena
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Step into structured Bible drills built from the new Training Arena day packs. Each play route now filters the pack server-side based on your current access level before anything reaches the browser.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Available Days
              </div>
              <div className="mt-2 text-2xl font-black text-white">{days.length}</div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Current Access
              </div>
              <div className="mt-2 text-2xl font-black text-white">
                {access.tier === "pro_plus" ? "Pro+" : access.tier === "pro" ? "Pro" : "Free"}
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Free Preview
              </div>
              <div className="mt-2 text-2xl font-black text-white">Days 1-3</div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">Play A Training Day</h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-300">
                Choose a day pack and launch the first playable Training Arena flow.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {days.map((day) => {
              const lockedForFree = access.tier === "free" && day.day > 3

              return (
                <article
                  key={day.day}
                  className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,22,36,0.98),rgba(8,11,20,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-200">
                      Day {day.day}
                    </div>
                    {lockedForFree ? (
                      <div className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-100">
                        Locked
                      </div>
                    ) : (
                      <div className="rounded-full border border-cyan-300/28 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100">
                        Ready
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-white">{day.reference}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {day.itemCount} items · {day.segmentKey}
                  </p>

                  <div className="mt-4">
                    <Link
                      href={`/training/day/${day.day}/play`}
                      className={`inline-flex rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        lockedForFree
                          ? "border border-white/12 bg-white/10 text-white hover:bg-white/14"
                          : "bg-amber-200 text-[#2c1600] shadow-[0_12px_30px_rgba(251,191,36,0.16)] hover:scale-[1.01]"
                      }`}
                    >
                      {lockedForFree ? "View Access" : "Play Day"}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
