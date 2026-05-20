"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import Paywall from "@/components/Paywall"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"

type QuestStatusTone = "gold" | "cyan" | "violet" | "orange" | "blue" | "locked"

type QuestFamilyCardProps = {
  title: string
  href?: string
  description: string
  badge: string
  status: string
  imageSrc?: string
  tone: QuestStatusTone
  icon: "quests" | "verse-memory" | "upgrade"
  locked?: boolean
}

type QuestModeCardProps = {
  title: string
  href: string
  description: string
  badge: string
  supporting: string
  imageSrc?: string
  tone: QuestStatusTone
}

function QuestFamilyCard({
  title,
  href,
  description,
  badge,
  status,
  imageSrc,
  tone,
  icon,
  locked = false,
}: QuestFamilyCardProps) {
  const cardBody = (
    <article className={`ba-quest-family-card ba-quest-family-card--${tone} ${locked ? "is-locked" : ""}`}>
      <div className="ba-quest-card-image-wrap">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 360px"
          />
        ) : null}
        <div className="ba-quest-card-image-overlay" />
      </div>

      <div className="ba-quest-card-content">
        <div className="flex items-start justify-between gap-3">
          <span className="ba-quest-card-icon">
            {renderNavIcon(icon, "h-4 w-4")}
          </span>
          <span className={`ba-quest-status-pill ba-quest-status-pill--${tone}`}>
            {badge}
          </span>
        </div>

        <div className="mt-auto">
          <h2 className="ba-font-display text-[1.32rem] font-bold tracking-[-0.03em] text-[#f8f1e6]">
            {title}
          </h2>
          <p className="mt-2 max-w-[15rem] text-[0.76rem] leading-[1.5] text-white/76">
            {description}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="ba-quest-card-meta">{status}</span>
            <span className="ba-quest-card-arrow">
              {locked ? renderNavIcon("upgrade", "h-3.5 w-3.5") : renderNavIcon("chevron-right", "h-3.5 w-3.5")}
            </span>
          </div>
        </div>
      </div>
    </article>
  )

  if (!href || locked) {
    return <div>{cardBody}</div>
  }

  return (
    <Link href={href} className="block">
      {cardBody}
    </Link>
  )
}

function QuestModeCard({
  title,
  href,
  description,
  badge,
  supporting,
  imageSrc,
  tone,
}: QuestModeCardProps) {
  return (
    <Link href={href} className="block">
      <article className={`ba-quest-mode-card ba-quest-mode-card--${tone}`}>
        <div className="ba-quest-card-image-wrap ba-quest-mode-image-wrap">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 280px"
            />
          ) : null}
          <div className="ba-quest-card-image-overlay ba-quest-mode-overlay" />
        </div>

        <div className="ba-quest-mode-content">
          <div className="flex items-start justify-between gap-3">
            <span className={`ba-quest-status-pill ba-quest-status-pill--${tone}`}>
              {badge}
            </span>
            <span className="ba-quest-card-arrow">
              {renderNavIcon("chevron-right", "h-3.5 w-3.5")}
            </span>
          </div>

          <div className="mt-auto">
            <h3 className="ba-font-display text-[1.24rem] font-bold tracking-[-0.03em] text-[#f8f1e6]">
              {title}
            </h3>
            <p className="mt-2 max-w-[15rem] text-[0.72rem] leading-[1.5] text-white/72">
              {description}
            </p>
            <div className="ba-quest-card-meta mt-3">{supporting}</div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function QuestPanel({
  title,
  icon,
  children,
  tone = "default",
}: {
  title: string
  icon: "quests" | "verse-memory" | "upgrade" | "home"
  children: React.ReactNode
  tone?: "default" | "violet"
}) {
  return (
    <section className={`ba-quest-side-panel ${tone === "violet" ? "ba-quest-side-panel--violet" : ""}`}>
      <div className="flex items-center gap-2.5">
        <span className="ba-quest-side-icon">
          {renderNavIcon(icon, "h-4 w-4")}
        </span>
        <div className="ba-rail-kicker text-[0.62rem] text-[#f3e4bc]">{title}</div>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function QuestsPage() {
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const resolvedPlan = await getUserPlan()
      setPlan(resolvedPlan)
      setLoading(false)
    }

    void run()
  }, [])

  const allowedPlans = ["pro_plus", "family_pro_plus"]
  const planLabel = plan === "family_pro_plus" ? "Family Pro+" : "Pro+"

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
    <main className="ba-quests-page">
      <div className="pointer-events-none absolute left-[-5rem] top-12 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-5rem] top-28 h-64 w-64 rounded-full bg-cyan-300/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(247,181,57,0.14),transparent_56%)]" />

      <div className="relative mx-auto flex w-full max-w-[96rem] flex-col gap-5">
        <section className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_16.5rem]">
          <div className="ba-card ba-quests-hero overflow-hidden rounded-[2rem]">
            <div className="ba-quests-hero-bg">
              <Image
                src="/training/sections/historical-books.png"
                alt=""
                fill
                priority
                className="object-cover object-[64%_45%]"
                sizes="(max-width: 1280px) 100vw, 980px"
              />
            </div>
            <div className="ba-quests-hero-overlay" />
            <div className="ba-quests-hero-vignette" />

            <div className="relative z-10 flex min-h-[24rem] flex-col p-5 sm:p-6 lg:min-h-[23.5rem] lg:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="ba-text-title text-[2.3rem] sm:text-[3rem]">Quests</div>
                  <p className="mt-1.5 max-w-xl text-[0.9rem] leading-[1.55] text-[#ede2d1]/82 sm:text-[1rem]">
                    Special challenges for Scripture mastery.
                  </p>
                </div>

                <div className="ba-quest-top-pill">
                  <span className="ba-quest-top-pill-icon">
                    {renderNavIcon("quests", "h-4 w-4")}
                  </span>
                  <div>
                    <div className="ba-text-section-label text-[0.52rem] text-[#f5cb76]">
                      Active Access
                    </div>
                    <div className="ba-font-ui mt-1 text-[0.86rem] font-semibold text-[#f7efe2]">
                      {planLabel}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 max-w-[24rem] sm:mt-6 lg:mt-7">
                <div className="ba-quest-hero-kicker">
                  <span className="text-[#ffd97d]">{renderNavIcon("upgrade", "h-4 w-4")}</span>
                  TODAY&apos;S CHALLENGE
                </div>
                <h1 className="ba-text-title mt-3 text-[2.2rem] sm:text-[3rem] lg:text-[3.35rem]">
                  Who Said It?
                </h1>
                <p className="mt-3 text-[0.92rem] leading-[1.62] text-[#f5eadc]/82 sm:text-[1rem]">
                  Identify who spoke key lines in Scripture and sharpen speaker recognition through a focused daily practice set.
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <span className="ba-quest-status-pill ba-quest-status-pill--gold">
                    10-Question Daily Practice
                  </span>
                  <span className="ba-quest-status-pill ba-quest-status-pill--locked">
                    Practice Only
                  </span>
                  <span className="ba-quest-status-pill ba-quest-status-pill--locked">
                    No XP Yet
                  </span>
                  <span className="ba-quest-status-pill ba-quest-status-pill--violet">
                    Pro+ Challenge
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <Link
                  href="/quests/who-said-it"
                  className="ba-quest-hero-cta"
                >
                  <span className="ba-hero-cta-medallion">
                    {renderNavIcon("quests", "h-[1rem] w-[1rem]")}
                  </span>
                  <span className="ba-hero-cta-label">Start Today&apos;s Challenge</span>
                  <span className="ba-quest-hero-cta-arrow">
                    {renderNavIcon("chevron-right", "h-4 w-4")}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuestPanel title="Daily Challenge" icon="quests">
              <div className="text-[1rem] font-semibold text-white">Who Said It?</div>
              <div className="mt-1 text-[0.78rem] text-white/66">10 Questions</div>
              <div className="mt-3 inline-flex rounded-full border border-amber-300/16 bg-amber-300/10 px-2.5 py-1 text-[0.62rem] font-semibold text-amber-100">
                Practice Only
              </div>
            </QuestPanel>

            <QuestPanel title="Today&apos;s Reward" icon="home">
              <div className="text-[0.88rem] font-semibold text-white">Rewards available in select Books modes.</div>
              <p className="mt-2 text-[0.73rem] leading-[1.55] text-white/62">
                Speed Round and Test Mode support daily XP. Who Said It remains practice-only for now.
              </p>
            </QuestPanel>

            <QuestPanel title="Pro+ Access" icon="upgrade" tone="violet">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[0.98rem] font-semibold text-white">{planLabel}</div>
                  <div className="mt-1 text-[0.72rem] text-white/64">Special challenge access is active.</div>
                </div>
                <span className="ba-quest-status-pill ba-quest-status-pill--violet">Active</span>
              </div>
            </QuestPanel>

            <QuestPanel title="Your Progress" icon="verse-memory">
              <div className="text-[0.88rem] font-semibold text-white">Quest progress tracking coming soon.</div>
              <p className="mt-2 text-[0.73rem] leading-[1.55] text-white/62">
                Start a challenge to begin building quest history across special modes.
              </p>
            </QuestPanel>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="ba-quest-stat-card ba-quest-stat-card--gold">
            <div className="ba-quest-stat-label">Available Quest Families</div>
            <div className="ba-quest-stat-value">3</div>
          </div>
          <div className="ba-quest-stat-card ba-quest-stat-card--cyan">
            <div className="ba-quest-stat-label">Books Modes</div>
            <div className="ba-quest-stat-value">4</div>
          </div>
          <div className="ba-quest-stat-card ba-quest-stat-card--orange">
            <div className="ba-quest-stat-label">Daily XP Modes</div>
            <div className="ba-quest-stat-value">2</div>
          </div>
          <div className="ba-quest-stat-card ba-quest-stat-card--violet">
            <div className="ba-quest-stat-label">Who Said It Set</div>
            <div className="ba-quest-stat-value text-[1.45rem] sm:text-[1.56rem]">10 Questions</div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="ba-quest-section-head">
            <h2 className="ba-font-display text-[1.42rem] font-semibold tracking-[-0.03em] text-[#f6ecde]">
              Quest Families
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <QuestFamilyCard
              title="Who Said It?"
              href="/quests/who-said-it"
              description="Identify who spoke key lines in Scripture."
              badge="Daily Practice"
              status="10 Questions"
              imageSrc="/training/sections/historical-books.png"
              tone="gold"
              icon="quests"
            />

            <QuestFamilyCard
              title="Books of the Bible"
              href="/quests/books"
              description="Train order, categories, speed, and recall."
              badge="Structure Mastery"
              status="4 Modes"
              imageSrc="/training/sections/pentateuch.png"
              tone="cyan"
              icon="verse-memory"
            />

            <QuestFamilyCard
              title="Characters"
              description="Learn the lives of key biblical figures."
              badge="Coming Soon"
              status="Placeholder"
              imageSrc="/training/sections/major-prophets.png"
              tone="violet"
              icon="upgrade"
              locked
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="ba-quest-section-head">
            <h2 className="ba-font-display text-[1.42rem] font-semibold tracking-[-0.03em] text-[#f6ecde]">
              Books of the Bible Modes
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <QuestModeCard
              title="Order Builder"
              href="/quests/books/order"
              description="Build canonical sequence recall one tap at a time."
              badge="Practice"
              supporting="No XP claim"
              imageSrc="/training/books/genesis.png"
              tone="cyan"
            />

            <QuestModeCard
              title="Category Sort"
              href="/quests/books/sort"
              description="Match books to their proper section and genre."
              badge="Practice"
              supporting="No XP claim"
              imageSrc="/training/sections/wisdom.png"
              tone="gold"
            />

            <QuestModeCard
              title="Speed Round"
              href="/quests/books/speed"
              description="Race the clock through fast recall prompts."
              badge="Daily XP"
              supporting="Rewarded once per day"
              imageSrc="/training/sections/exodus.png"
              tone="orange"
            />

            <QuestModeCard
              title="Test Mode"
              href="/quests/books/test"
              description="Enter a focused Books challenge with daily rewards."
              badge="Daily XP"
              supporting="Rewarded once per day"
              imageSrc="/training/sections/apocalyptic.png"
              tone="blue"
            />
          </div>
        </section>
      </div>
    </main>
  )
}
