'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { setPro } from "../../lib/user"

export default function UpgradePage() {
  const [activatedPlan, setActivatedPlan] = useState<'pro' | 'pro_plus' | null>(null)
  const proCheckoutUrl = "https://buy.stripe.com/9B614nf729SEg681w15c400"
  const proPlusCheckoutUrl = "https://buy.stripe.com/9B614nf729SEg681w15c400?plan=pro_plus"

  useEffect(() => {
    const activatePro = async () => {
      const params = new URLSearchParams(window.location.search)
      if (params.get("success") === "true") {
        try {
          const planParam = params.get("plan")
          const plan = planParam === "pro_plus" ? "pro_plus" : "pro"
          await setPro(plan)
          setActivatedPlan(plan)
        } catch (error) {
          console.error('Error activating pro:', error)
        }
      }
    }

    activatePro()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-5xl space-y-8">

        {activatedPlan === 'pro' && (
          <div className="rounded-lg border border-green-400 bg-green-100 px-4 py-3 text-green-700">
            🎉 You&apos;re now a Pro member!
          </div>
        )}

        {activatedPlan === 'pro_plus' && (
          <div className="rounded-lg border border-green-400 bg-green-100 px-4 py-3 text-green-700">
            🚀 You&apos;re now a Pro+ member!
          </div>
        )}

        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Become a Bible Athlete
          </h1>
          <p className="text-base text-gray-700 md:text-lg">
            Start your journey. Or train without limits.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Pro — Learn the Bible</h2>

            <ul className="mt-4 space-y-2 text-gray-800">
              <li>• Follow the Bible journey</li>
              <li>• Daily training quizzes</li>
              <li>• Build streaks & earn XP</li>
              <li>• Easy, Medium, Hard levels</li>
            </ul>

            <div className="mt-5 space-y-1 border-t border-gray-200 pt-4">
              <p className="text-gray-900 font-semibold">$4.99/month or $39/year</p>
              <p className="text-gray-700">Family: $9.99/month or $79/year</p>
            </div>

            <a
              href={proCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              Start Pro
            </a>
          </article>

          <article className="relative rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-md">
            <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Best Value
            </span>

            <h2 className="text-xl font-bold text-gray-900">Pro+ — Master the Bible</h2>

            <ul className="mt-4 space-y-2 text-gray-800">
              <li>• Unlimited training (no limits)</li>
              <li>• Train anywhere (Scholar Mode)</li>
              <li>• Focus on weak areas</li>
              <li>• Verse memory + flashcards</li>
              <li>• Advanced stats & progress tracking</li>
            </ul>

            <div className="mt-5 space-y-1 border-t border-gray-200 pt-4">
              <p className="text-gray-900 font-semibold">$9.99/month or $79/year</p>
              <p className="text-gray-700">Family: $19.99/month or $149/year</p>
            </div>

            <a
              href={proPlusCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full rounded-lg bg-gray-900 py-3 text-center font-semibold text-white transition hover:bg-black"
            >
              Go Pro+ (Best Value)
            </a>
          </article>
        </section>

        <div>
          <Link href="/dashboard">
            <button className="w-full rounded-lg bg-gray-300 py-3 font-semibold text-gray-900 transition hover:bg-gray-400 md:w-auto md:px-6">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}