"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

const features = [
  {
    title: "Scripture recall that sticks",
    description: "Train with active recall, fill-in-the-blank drills, and review loops designed to improve retention.",
  },
  {
    title: "Progress you can feel",
    description: "Build streaks, earn XP, and keep moving with a system that makes consistency rewarding.",
  },
  {
    title: "A full Bible journey",
    description: "Move through structured paths, flashcards, and game modes without guessing what to study next.",
  },
]

const pillars = [
  "Daily training that feels like a challenge, not homework",
  "Memory drills, flashcards, and quiz modes in one place",
  "Structured programs for steady, visible growth",
  "Built to help you stay consistent for the long term",
]

const audience = [
  "Christians who want stronger scripture memory",
  "Parents building a Bible habit with their family",
  "Students and leaders who want sharper recall",
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="overflow-hidden bg-[#050816] text-white">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.28),_transparent_28%),radial-gradient(circle_at_85%_18%,_rgba(59,130,246,0.2),_transparent_24%),linear-gradient(180deg,_#09101f_0%,_#050816_45%,_#04070f_100%)]" />
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-16 pt-24 sm:px-6 md:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-[#93F5B0]">
              Bible Athlete
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#07111F] transition hover:bg-[#D9FFE5]"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-[#93F5B0]/25 bg-[#93F5B0]/10 px-4 py-2 text-sm font-semibold text-[#C7FFD7]">
                Bible training for people who want real retention
              </div>

              <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                Train your Bible knowledge like an athlete trains to win.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/92 sm:text-lg">
                Bible Athlete turns scripture memory into a focused training system with streaks, XP, active recall, and guided progress through the Bible.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/signup")}
                  className="rounded-2xl bg-[#7CFF9B] px-6 py-4 text-base font-black text-[#07111F] shadow-[0_12px_40px_rgba(124,255,155,0.28)] transition hover:scale-[1.01] hover:bg-[#98FFAF] active:scale-[0.99]"
                >
                  Start Free Training
                </button>
                <button
                  onClick={() => router.push("/journey")}
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-bold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  Preview the Journey
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 text-sm text-white/90 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-2xl font-black text-white">Streaks</p>
                  <p className="mt-1 leading-6 text-white/85">Stay consistent with daily momentum that keeps you coming back.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-2xl font-black text-white">XP</p>
                  <p className="mt-1 leading-6 text-white/85">Feel progress every session instead of wondering if it is working.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-2xl font-black text-white">Recall</p>
                  <p className="mt-1 leading-6 text-white/85">Train your memory with drills built for long-term retention.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 top-8 -z-10 h-44 rounded-full bg-[#7CFF9B]/20 blur-3xl" />
              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,34,0.96),rgba(6,10,20,0.94))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:p-5">
                <div className="rounded-[1.6rem] border border-white/10 bg-[#07101E] p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#93F5B0]">Today&apos;s Session</p>
                      <p className="mt-2 text-2xl font-black text-white">Genesis Training</p>
                    </div>
                    <div className="rounded-2xl border border-[#7CFF9B]/20 bg-[#7CFF9B]/10 px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B8FFC9]">Current Streak</p>
                      <p className="mt-1 text-2xl font-black text-white">14 days</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-[#0B162A] p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-white/85">
                      <span>Weekly XP Goal</span>
                      <span>420 / 600 XP</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[70%] rounded-full bg-[linear-gradient(90deg,#7CFF9B,#4DD7FF)]" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/88">
                      You&apos;re building a real habit. One more session keeps your streak alive and unlocks the next segment.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-white">Scripture Recall</p>
                          <p className="mt-1 text-sm leading-6 text-white/85">Answer fast. Strengthen recall. See what needs review.</p>
                        </div>
                        <span className="rounded-full bg-[#4DD7FF]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#93EAFF]">
                          Ready
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-white">Memory Training</p>
                          <p className="mt-1 text-sm leading-6 text-white/85">Fill in missing words and lock in verse accuracy.</p>
                        </div>
                        <span className="rounded-full bg-[#7CFF9B]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#C6FFD5]">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-white">Precision Review</p>
                          <p className="mt-1 text-sm leading-6 text-white/85">Return to weak spots until they become second nature.</p>
                        </div>
                        <span className="rounded-full bg-[#FACC15]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FFE58A]">
                          Smart Review
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#93F5B0]">Why It Converts Study Into Growth</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
              A better system than reading, forgetting, and starting over.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/90 sm:text-lg">
              Bible Athlete helps you move from passive exposure to active mastery with training loops that reward consistency and expose weak spots.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6"
              >
                <p className="text-xl font-black text-white">{feature.title}</p>
                <p className="mt-3 text-base leading-7 text-white/88">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#081121] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#93F5B0]">Built For Real Growth</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
              Everything you need to build a lasting Bible habit.
            </h2>
            <div className="mt-6 grid gap-4">
              {pillars.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-base leading-7 text-white/90">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0D1830_0%,#081121_100%)] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#4DD7FF]">Who It&apos;s For</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white">
              Designed for believers who want more than inspiration.
            </h2>
            <div className="mt-6 space-y-4">
              {audience.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-base leading-7 text-white/90">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.6rem] border border-[#7CFF9B]/20 bg-[#7CFF9B]/10 p-5">
              <p className="text-lg font-black text-white">No more drifting in your Bible study.</p>
              <p className="mt-2 text-base leading-7 text-white/90">
                Open the app, start a session, and know exactly what to train next.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(124,255,155,0.16),transparent_40%),linear-gradient(180deg,#0B1326_0%,#060A15_100%)] px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#93F5B0]">Start Strong</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white sm:text-5xl">
            Start your journey today and train with purpose.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
            If you want a Bible habit that lasts, Bible Athlete gives you a system you can actually stick with.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/signup")}
              className="rounded-2xl bg-[#7CFF9B] px-6 py-4 text-base font-black text-[#07111F] transition hover:bg-[#98FFAF]"
            >
              Create Your Account
            </button>
            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-bold text-white transition hover:border-white/30 hover:bg-white/10"
            >
              I Already Have an Account
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
