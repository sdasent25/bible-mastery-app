"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

const containerClass = "max-w-5xl mx-auto px-4"
const sectionClass = "transition-opacity duration-300 py-10 md:py-16"
const cardClass = "bg-[#121826] border border-gray-800 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
const primaryButtonClass = "w-full md:w-auto bg-green-500 text-black font-bold rounded-xl px-6 py-3 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 transition transform hover:scale-[1.02] active:scale-[0.98]"
const secondaryButtonClass = "w-full md:w-auto bg-[#1A2233] border border-gray-700 text-white rounded-xl px-6 py-3 transition-all duration-200 hover:bg-[#222C40] transition transform hover:scale-[1.02] active:scale-[0.98]"

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

const testimonials = [
  {
    text: "This is the first time I’ve actually been consistent with learning the Bible.",
    name: "Sarah M.",
  },
  {
    text: "The streak system keeps me coming back every day. It actually works.",
    name: "James R.",
  },
  {
    text: "I’ve memorized more scripture in a week than I have in years.",
    name: "David K.",
  },
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0F1A] text-white">
      <div className="absolute left-1/2 top-[-100px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-green-500 opacity-10 blur-[120px]" />
      <main className="relative space-y-16">
      <section className="relative isolate min-h-screen transition-opacity duration-300">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#081120_0%,#040816_48%,#03050E_100%)]" />
        <div className="absolute left-1/2 top-[-10rem] -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#1ED760]/12 blur-[140px]" />
        <div className="absolute right-[-8rem] top-[10rem] -z-10 h-[26rem] w-[26rem] rounded-full bg-[#2F7BFF]/12 blur-[120px]" />
        <div className="absolute bottom-[-10rem] left-[-8rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-[#14B8A6]/10 blur-[120px]" />

        <div className={`${containerClass} flex min-h-screen flex-col pb-16 pt-24`}>
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] text-[#9BFFB6]">
              Bible Athlete
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="transition transform rounded-full border border-gray-700 bg-[#1A2233] px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#222C40] active:scale-[0.98]"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="transition transform rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-black shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-14 py-12 md:gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-gray-800 bg-[#121826] px-4 py-2 text-sm font-bold text-white shadow-lg transition-all duration-300">
                Premium Bible training for real growth
              </div>

              <h1 className="mb-6 mt-6 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
                The Bible Study App That Actually Works
              </h1>

              <p className="mb-8 max-w-xl text-lg leading-8 text-gray-200 md:text-xl">
                Learn, memorize, and master scripture with a powerful training system.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/signup")}
                  className={`mt-4 sm:mt-0 ${primaryButtonClass}`}
                >
                  Start Your Journey
                </button>
                <button
                  onClick={() => router.push("/journey")}
                  className={`mt-4 sm:mt-0 ${secondaryButtonClass}`}
                >
                  Explore the Journey
                </button>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className={`${cardClass} p-4`}>
                  <p className="text-2xl font-black text-white">Daily</p>
                  <p className="mt-2 text-sm leading-6 text-white">Stay consistent with streak-driven sessions that feel purposeful.</p>
                </div>
                <div className={`${cardClass} p-4`}>
                  <p className="text-2xl font-black text-white">Focused</p>
                  <p className="mt-2 text-sm leading-6 text-white">Train the exact memory skills that help scripture stick.</p>
                </div>
                <div className={`${cardClass} p-4`}>
                  <p className="text-2xl font-black text-white">Measurable</p>
                  <p className="mt-2 text-sm leading-6 text-white">Track visible progress with XP, streaks, and momentum.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 top-8 -z-10 h-48 rounded-full bg-[#52E0FF]/14 blur-[110px]" />
              <div className={`${cardClass} p-4 sm:p-5`}>
                <div className="rounded-[1.7rem] border border-gray-800 bg-[#0F1522] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9BFFB6]">Today&apos;s Training</p>
                      <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Genesis Mastery</h2>
                    </div>
                    <div className={`${cardClass} px-4 py-3 text-right hover:translate-y-0`}>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D9FFE6]">Current Streak</p>
                      <p className="mt-1 text-2xl font-black text-white">14 days</p>
                    </div>
                  </div>

                  <div className={`${cardClass} mt-6 p-4 hover:translate-y-0`}>
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
                    <div className={`${cardClass} p-4`}>
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

                    <div className={`${cardClass} p-4`}>
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

                    <div className={`${cardClass} p-4`}>
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

      <section className={`${sectionClass} px-4`}>
        <div className={`${containerClass} flex justify-center`}>
          <div className="relative w-full max-w-sm">
          <div className="absolute inset-0 rounded-3xl bg-green-500 opacity-10 blur-3xl" />

            <div className={`${cardClass} relative rounded-3xl p-3`}>
              <video
                src="/preview.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`${sectionClass} px-4`}>
        <div className={containerClass}>
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#9BFFB6]">Core Training</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
              A premium system built to turn study into momentum.
            </h2>
            <p className="mt-4 text-base leading-8 text-white sm:text-lg">
              Every section is designed to move people from curiosity to commitment with clear value, polished visuals, and a strong next step.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((item) => (
              <div
                key={item.title}
                className={`${cardClass} p-6`}
              >
                <p className="text-sm font-black uppercase tracking-[0.24em] text-[#9BFFB6]">{item.eyebrow}</p>
                <h3 className="mt-4 text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-white">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionClass} px-4`}>
        <div className={`${containerClass} ${cardClass} rounded-[2.2rem] p-6 sm:p-8 md:p-10`}>
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#52E0FF]">How It Works</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
              A simple system that feels smooth from the first session.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`${cardClass} p-6`}
              >
                <p className="text-3xl font-black text-[#9BFFB6]">{step.number}</p>
                <h3 className="mt-4 text-xl font-black text-white">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-white">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionClass} px-4`}>
        <div className={`${containerClass} ${cardClass} rounded-[2.2rem] p-8 text-center sm:p-10`}>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#9BFFB6]">Built For Real Growth</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
            Everything you need to build a stronger Bible habit.
          </h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {valuePoints.map((item) => (
              <div
                key={item}
                className={`${cardClass} px-4 py-4 text-base font-bold text-white`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionClass} px-4`}>
        <div className={containerClass}>
          <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
            What People Are Saying
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`${cardClass} p-6`}
              >
                <p className="mb-4 text-white">“{t.text}”</p>
                <p className="text-sm text-gray-200">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionClass} px-4 text-center`}>
        <div className={`${containerClass} ${cardClass} rounded-[2.4rem] px-6 py-12 sm:px-10`}>
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
              className={`mt-4 sm:mt-0 ${primaryButtonClass}`}
            >
              Begin Training
            </button>
            <button
              onClick={() => router.push("/login")}
              className={`mt-4 sm:mt-0 ${secondaryButtonClass}`}
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
    </div>
  )
}
