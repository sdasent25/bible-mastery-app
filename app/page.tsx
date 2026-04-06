"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

const featureCards = [
  {
    eyebrow: "Recall",
    title: "Scripture Recall",
    description: "Train with focused recall sessions that sharpen memory and expose what still needs work.",
  },
  {
    eyebrow: "Retention",
    title: "Memory Training",
    description: "Reinforce verses with guided repetition built for long-term retention, not quick review.",
  },
  {
    eyebrow: "Mastery",
    title: "Precision Training",
    description: "Target weak spots, tighten accuracy, and build real confidence as you progress.",
  },
]

const steps = [
  {
    number: "01",
    title: "Start",
    description: "Begin a guided journey through scripture with a clear path and no guesswork.",
  },
  {
    number: "02",
    title: "Train",
    description: "Use active recall, memory drills, and repeatable sessions that keep growth measurable.",
  },
  {
    number: "03",
    title: "Master",
    description: "Build lasting retention with streaks, progress tracking, and focused review.",
  },
]

const valuePoints = [
  "Full Bible journey",
  "Daily streak and XP momentum",
  "Memory-first training system",
  "Unlimited practice sessions",
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="overflow-hidden bg-[#040816] text-white">
      <section className="relative isolate min-h-screen">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#081120_0%,#040816_48%,#03050E_100%)]" />
        <div className="absolute left-1/2 top-[-10rem] -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#1ED760]/12 blur-[140px]" />
        <div className="absolute right-[-8rem] top-[10rem] -z-10 h-[26rem] w-[26rem] rounded-full bg-[#2F7BFF]/12 blur-[120px]" />
        <div className="absolute bottom-[-10rem] left-[-8rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-[#14B8A6]/10 blur-[120px]" />

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-16 pt-24 sm:px-6 md:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] text-[#9BFFB6]">
              Bible Athlete
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-white/14 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:border-white/28 hover:bg-white/[0.06]"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[linear-gradient(135deg,#9BFFB6_0%,#52E0FF_100%)] px-4 py-2 text-sm font-black text-[#07111D] shadow-[0_14px_40px_rgba(82,224,255,0.22)] transition hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-18">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-[#9BFFB6]/20 bg-[#9BFFB6]/10 px-4 py-2 text-sm font-bold text-[#D9FFE6] shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                Premium Bible training for real growth
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Train your Bible knowledge
                <span className="mt-2 block bg-[linear-gradient(135deg,#9BFFB6_0%,#52E0FF_100%)] bg-clip-text text-transparent">
                  like an athlete trains to win.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white sm:text-lg">
                Build streaks, master scripture, and move through the Bible with a training system designed to make retention feel rewarding.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/signup")}
                  className="rounded-2xl bg-[linear-gradient(135deg,#9BFFB6_0%,#52E0FF_100%)] px-7 py-4 text-base font-black text-[#06101B] shadow-[0_20px_60px_rgba(82,224,255,0.24)] transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  Start Your Journey
                </button>
                <button
                  onClick={() => router.push("/journey")}
                  className="rounded-2xl border border-white/14 bg-white/[0.04] px-7 py-4 text-base font-bold text-white shadow-[0_16px_40px_rgba(0,0,0,0.2)] transition hover:border-white/28 hover:bg-white/[0.07]"
                >
                  Explore the Journey
                </button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                  <p className="text-2xl font-black text-white">Daily</p>
                  <p className="mt-2 text-sm leading-6 text-white">Stay consistent with streak-driven sessions that feel purposeful.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                  <p className="text-2xl font-black text-white">Focused</p>
                  <p className="mt-2 text-sm leading-6 text-white">Train the exact memory skills that help scripture stick.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                  <p className="text-2xl font-black text-white">Measurable</p>
                  <p className="mt-2 text-sm leading-6 text-white">Track visible progress with XP, streaks, and momentum.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 top-8 -z-10 h-48 rounded-full bg-[#52E0FF]/14 blur-[110px]" />
              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,24,44,0.96),rgba(8,12,24,0.96))] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-5">
                <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,#0A1325_0%,#07101C_100%)] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9BFFB6]">Today&apos;s Training</p>
                      <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Genesis Mastery</h2>
                    </div>
                    <div className="rounded-2xl border border-[#9BFFB6]/18 bg-[#9BFFB6]/10 px-4 py-3 text-right shadow-[0_14px_35px_rgba(0,0,0,0.18)]">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D9FFE6]">Current Streak</p>
                      <p className="mt-1 text-2xl font-black text-white">14 days</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center justify-between gap-3 text-sm font-bold text-white">
                      <span>Weekly XP Goal</span>
                      <span>420 / 600 XP</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[70%] rounded-full bg-[linear-gradient(90deg,#9BFFB6_0%,#52E0FF_100%)]" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white">
                      Keep your streak alive, unlock the next segment, and keep building long-term recall.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-black text-white">Scripture Recall</p>
                          <p className="mt-1 text-sm leading-6 text-white">Answer from memory and reinforce fast, accurate recall.</p>
                        </div>
                        <span className="rounded-full bg-[#52E0FF]/14 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#C9F7FF]">
                          Ready
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-black text-white">Memory Training</p>
                          <p className="mt-1 text-sm leading-6 text-white">Fill in missing words and lock in verse accuracy with repetition.</p>
                        </div>
                        <span className="rounded-full bg-[#9BFFB6]/14 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#E5FFEC]">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-black text-white">Precision Review</p>
                          <p className="mt-1 text-sm leading-6 text-white">Revisit weak areas until they become clear, quick, and reliable.</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white">
                          Focused
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

      <section className="px-5 py-18 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#9BFFB6]">Core Training</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
              A premium system built to turn study into momentum.
            </h2>
            <p className="mt-4 text-base leading-8 text-white sm:text-lg">
              Every section is designed to move people from curiosity to commitment with clear value, polished visuals, and a strong next step.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featureCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)]"
              >
                <p className="text-sm font-black uppercase tracking-[0.24em] text-[#9BFFB6]">{item.eyebrow}</p>
                <h3 className="mt-4 text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-white">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-18 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#091223_0%,#060A16_100%)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:p-8 md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#52E0FF]">How It Works</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
              A simple system that feels smooth from the first session.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              >
                <p className="text-3xl font-black text-[#9BFFB6]">{step.number}</p>
                <h3 className="mt-4 text-xl font-black text-white">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-white">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-18 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(155,255,182,0.12),transparent_36%),linear-gradient(180deg,#0A1325_0%,#060A16_100%)] p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#9BFFB6]">Built For Real Growth</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
            Everything you need to build a stronger Bible habit.
          </h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {valuePoints.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base font-bold text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-18 text-center sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,21,39,0.98),rgba(7,10,19,0.98))] px-6 py-12 shadow-[0_32px_90px_rgba(0,0,0,0.34)] sm:px-10">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#52E0FF]">Start Now</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Your journey starts here.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white sm:text-lg">
            Begin training today and experience a more focused, rewarding way to learn the Bible.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/signup")}
              className="rounded-2xl bg-[linear-gradient(135deg,#9BFFB6_0%,#52E0FF_100%)] px-8 py-4 text-base font-black text-[#06101B] shadow-[0_20px_60px_rgba(82,224,255,0.22)] transition hover:scale-[1.01] active:scale-[0.99]"
            >
              Begin Training
            </button>
            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl border border-white/14 bg-white/[0.04] px-8 py-4 text-base font-bold text-white shadow-[0_18px_40px_rgba(0,0,0,0.2)] transition hover:border-white/28 hover:bg-white/[0.07]"
            >
              Log In
            </button>
          </div>

          <p className="mt-5 text-sm font-semibold text-white">
            Cancel anytime • No commitment
          </p>
        </div>
      </section>
    </main>
  )
}
