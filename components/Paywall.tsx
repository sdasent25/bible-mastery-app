"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { renderNavIcon } from "@/lib/navigation"

export default function Paywall({
  title,
  message,
}: {
  title: string
  message: string
}) {
  const router = useRouter()
  const benefits = [
    "Full access to eligible training modes",
    "Deeper practice and review",
    "Progress built for daily consistency",
  ]

  return (
    <div className="relative min-h-[calc(100vh-7rem)] overflow-hidden px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-3rem] top-24 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-32 h-48 w-48 rounded-full bg-cyan-300/8 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-3xl items-center justify-center">
        <div className="ba-card w-full max-w-xl overflow-hidden rounded-[2rem]">
          <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] border border-amber-200/16 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.2),rgba(255,255,255,0.04)_62%)] text-amber-100 shadow-[0_0_32px_rgba(250,204,21,0.12)]">
                {renderNavIcon("upgrade", "h-7 w-7")}
              </div>

              <div className="min-w-0 flex-1">
                <div className="ba-badge-gold">Member Access</div>
                <h1 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                  {title || "Unlock this training path"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  {message || "Upgrade to continue building Bible mastery with deeper drills, full access, and guided progression."}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-7 sm:py-6">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 sm:p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/82">
                What Opens Up
              </div>

              <div className="mt-4 space-y-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="ba-card-soft flex items-center gap-3 rounded-[1.1rem] px-3.5 py-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/16 bg-cyan-300/10 text-cyan-100">
                      {renderNavIcon("brand", "h-4 w-4")}
                    </div>
                    <div className="text-sm font-medium text-slate-100">
                      {benefit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/pricing"
                className="ba-button-primary w-full px-5 py-4 text-base font-black"
              >
                Upgrade
              </Link>

              <button
                type="button"
                onClick={() => router.back()}
                className="ba-button-secondary w-full px-5 py-4 text-base font-semibold"
              >
                Back
              </button>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400 sm:text-sm">
              Continue when you are ready. Your progress stays intact, and deeper access unlocks the full training path.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
