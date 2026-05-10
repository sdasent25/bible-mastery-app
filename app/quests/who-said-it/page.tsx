"use client"

import { useRouter } from "next/navigation"

export default function WhoSaidItPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-gray-950/90 p-6 shadow-2xl">
          <div className="text-sm uppercase tracking-[0.28em] text-amber-400">
            Skill Drill
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white">
            Who Said It
          </h1>
          <p className="mt-3 text-base text-gray-300">
            This speaker-recognition drill is being rebuilt from the ground up for launch.
          </p>
        </div>

        <div className="rounded-3xl border border-sky-400/20 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_52%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-6 shadow-2xl">
          <div className="inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
            Coming Soon
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white">
            Speaker recognition is returning in a cleaner format
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-300">
            We retired the legacy version so this drill can relaunch with better data,
            stronger progression, and a more trustworthy reward flow.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Status
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                Rebuilding
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Focus
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                Data quality
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Return
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                Future release
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/quests")}
              className="flex-1 rounded-2xl bg-amber-400 px-5 py-4 text-base font-black text-slate-950 transition hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98]"
            >
              Back to Quests
            </button>
            <button
              onClick={() => router.push("/quests/books")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              Open Books Drills
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
