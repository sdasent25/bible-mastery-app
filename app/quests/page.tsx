"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import Paywall from "@/components/Paywall"
import QuestHorizontalRail from "@/components/quests/QuestHorizontalRail"
import { getUserPlan } from "@/lib/getUserPlan"
import { renderNavIcon } from "@/lib/navigation"
import { isQuestPlan } from "@/lib/questAccess"

type QuestTone = "gold" | "cyan" | "violet" | "orange" | "blue"

type QuestStat = {
  label: string
  value: string
  supporting: string
  tone: QuestTone
  icon: "home" | "quests" | "upgrade" | "verse-memory"
}

type QuestPanelData = {
  title: string
  eyebrow: string
  copy: string
  tone?: "default" | "violet"
  icon: "home" | "quests" | "upgrade" | "verse-memory"
  badge?: string
}

type QuestCardData = {
  title: string
  href: string
  imageSrc: string
  copy: string
  badge: string
  detail: string
  tone: QuestTone
}

type QuestAboutData = {
  title: string
  copy: string
  tone: QuestTone
  icon: "home" | "quests" | "upgrade" | "verse-memory"
}

const questStats: QuestStat[] = [
  {
    label: "Daily Set",
    value: "10 Questions",
    supporting: "Who Said It practice",
    tone: "orange",
    icon: "quests",
  },
  {
    label: "Quest Families",
    value: "3",
    supporting: "Who Said It, Books, Characters",
    tone: "gold",
    icon: "home",
  },
  {
    label: "Books Modes",
    value: "4",
    supporting: "Inside Books of the Bible",
    tone: "violet",
    icon: "upgrade",
  },
  {
    label: "Daily XP Modes",
    value: "2",
    supporting: "Speed Round and Test Mode",
    tone: "cyan",
    icon: "verse-memory",
  },
]

const questPanels = (planLabel: string): QuestPanelData[] => [
  {
    title: "Quest Access",
    eyebrow: `${planLabel} Active`,
    copy: "Quests access is active for this account.",
    icon: "quests",
  },
  {
    title: "Daily Challenge",
    eyebrow: "Who Said It?",
    copy: "10-question practice set. Practice Only. No XP Yet.",
    icon: "quests",
    badge: "Practice Only",
  },
  {
    title: "Daily XP",
    eyebrow: "Speed + Test",
    copy: "Daily XP lives in Speed Round and Test Mode. Practice modes do not award XP.",
    icon: "home",
  },
  {
    title: "Pro+ Access",
    eyebrow: "All Quest Families",
    copy: "All quest families and modes are unlocked for this account.",
    tone: "violet",
    icon: "upgrade",
    badge: `${planLabel} Active`,
  },
  {
    title: "Your Progress",
    eyebrow: "Coming Soon",
    copy: "Quest progress tracking is being prepared.",
    icon: "verse-memory",
  },
]

const questFamilies: QuestCardData[] = [
  {
    title: "Who Said It?",
    href: "/quests/who-said-it",
    imageSrc: "/quests/cards/who-said-it.png",
    copy: "Identify the speaker behind the scripture.",
    badge: "Active",
    detail: "10 Questions",
    tone: "gold",
  },
  {
    title: "Books of the Bible",
    href: "/quests/books",
    imageSrc: "/quests/cards/books-of-the-bible.png",
    copy: "Explore, order, and master every book.",
    badge: "Daily Modes",
    detail: "4 Modes",
    tone: "cyan",
  },
  {
    title: "Characters",
    href: "/quests/characters",
    imageSrc: "/quests/cards/characters-coming-soon.png",
    copy: "Learn the lives of key biblical figures.",
    badge: "Coming Soon",
    detail: "Safe preview",
    tone: "violet",
  },
]

const questAbout: QuestAboutData[] = [
  {
    title: "Train Your Mind",
    copy: "Strengthen your recall and understanding of God’s Word.",
    tone: "violet",
    icon: "quests",
  },
  {
    title: "Multiple Challenge Types",
    copy: "Practice, race the clock, or test your mastery in different ways.",
    tone: "gold",
    icon: "verse-memory",
  },
  {
    title: "Practice + Daily XP",
    copy: "Practice builds wisdom. Daily XP rewards faithful effort.",
    tone: "orange",
    icon: "home",
  },
  {
    title: "Pro+ Feature",
    copy: "Quests are available exclusively for Pro+ members.",
    tone: "cyan",
    icon: "upgrade",
  },
]

function QuestStatCard({ stat }: { stat: QuestStat }) {
  return (
    <article className={`ba-quests-stat-card ba-quests-stat-card--${stat.tone}`}>
      <div className="ba-quests-stat-icon">
        {renderNavIcon(stat.icon, "h-4 w-4")}
      </div>
      <div className="min-w-0">
        <div className="ba-quests-stat-label">{stat.label}</div>
        <div className="ba-quests-stat-value">{stat.value}</div>
        <div className="ba-quests-stat-supporting">{stat.supporting}</div>
      </div>
    </article>
  )
}

function QuestRailPanel({ panel }: { panel: QuestPanelData }) {
  return (
    <section className={`ba-quests-side-panel ${panel.tone === "violet" ? "ba-quests-side-panel--violet" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="ba-quests-side-icon">
          {renderNavIcon(panel.icon, "h-4 w-4")}
        </span>
        <div className="min-w-0">
          <div className="ba-quests-side-title">{panel.title}</div>
          <div className="ba-quests-side-eyebrow">{panel.eyebrow}</div>
          <p className="ba-quests-side-copy">{panel.copy}</p>
        </div>
      </div>
      {panel.badge ? (
        <div className="mt-3 xl:mt-2.5">
          <span className={`ba-quest-status-pill ${panel.tone === "violet" ? "ba-quest-status-pill--violet" : "ba-quest-status-pill--gold"}`}>
            {panel.badge}
          </span>
        </div>
      ) : null}
    </section>
  )
}

function QuestFamilyCard({ card }: { card: QuestCardData }) {
  return (
    <Link href={card.href} className="block min-w-[16.35rem] md:min-w-0">
      <article className={`ba-quests-family-card ba-quests-family-card--${card.tone}`}>
        <div className="ba-quests-card-art">
          <Image
            src={card.imageSrc}
            alt={card.title}
            fill
            className="object-cover"
            sizes="(max-width: 767px) 262px, (max-width: 1279px) 33vw, 23vw"
          />
          <div className="ba-quests-card-overlay" />
        </div>
        <div className="ba-quests-card-shell">
          <div className="flex items-start justify-between gap-3">
            <span className={`ba-quest-status-pill ba-quest-status-pill--${card.tone}`}>
              {card.badge}
            </span>
            <span className="ba-quest-card-arrow">
              {renderNavIcon("chevron-right", "h-3.5 w-3.5")}
            </span>
          </div>
          <div className="mt-auto">
            <h3 className="ba-font-display text-[1.42rem] font-semibold tracking-[-0.03em] text-[#f8f1e6]">
              {card.title}
            </h3>
            <p className="ba-quests-card-copy mt-2 text-[0.82rem] leading-[1.55] text-white/76">
              {card.copy}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 xl:mt-2.5">
              <span className="ba-quest-card-meta">{card.detail}</span>
              <span className="ba-quest-card-meta text-right text-[#f6e0a8]">{card.badge}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function QuestAboutCard({ card }: { card: QuestAboutData }) {
  return (
    <article className={`ba-quests-about-card ba-quests-about-card--${card.tone}`}>
      <span className={`ba-quests-about-icon ba-quests-about-icon--${card.tone}`}>
        {renderNavIcon(card.icon, "h-4 w-4")}
      </span>
      <div className="min-w-0">
        <h3 className="ba-font-display text-[1.12rem] font-semibold tracking-[-0.03em] text-[#f8f1e6]">
          {card.title}
        </h3>
        <p className="mt-2 text-[0.82rem] leading-[1.6] text-white/74">
          {card.copy}
        </p>
      </div>
    </article>
  )
}

function QuestStatusList({ planLabel }: { planLabel: string }) {
  return (
    <section className="ba-quests-status-stack xl:hidden">
      <div className="ba-quests-status-stack-head">
        <span className="ba-quest-status-pill ba-quest-status-pill--gold">
          Quest Access
        </span>
        <span className="ba-quests-status-stack-plan">{planLabel} Active</span>
      </div>

      <div className="ba-quests-status-list">
        {questPanels(planLabel).map((panel) => (
          <section key={panel.title} className="ba-quests-status-row">
            <div className="flex min-w-0 items-start gap-3">
              <span className="ba-quests-status-row-icon">
                {renderNavIcon(panel.icon, "h-4 w-4")}
              </span>
              <div className="min-w-0">
                <div className="ba-quests-status-row-title">{panel.title}</div>
                <div className="ba-quests-status-row-copy">
                  <span className="font-semibold text-[#f6ecde]">{panel.eyebrow}</span>{" "}
                  {panel.copy}
                </div>
              </div>
            </div>
            {panel.badge ? (
              <span
                className={`ba-quest-status-pill ${panel.tone === "violet" ? "ba-quest-status-pill--violet" : "ba-quest-status-pill--gold"}`}
              >
                {panel.badge}
              </span>
            ) : (
              <span className="ba-quests-status-row-arrow">
                {renderNavIcon("chevron-right", "h-3.5 w-3.5")}
              </span>
            )}
          </section>
        ))}
      </div>
    </section>
  )
}

function QuestAboutSection() {
  return (
    <section className="ba-quests-about">
      <div className="ba-quest-section-head">
        <h2 className="ba-font-display text-[1.28rem] font-semibold tracking-[-0.03em] text-[#f6ecde] sm:text-[1.4rem]">
          About Quests
        </h2>
      </div>

      <div className="ba-quests-about-grid">
        {questAbout.map((card) => (
          <QuestAboutCard key={card.title} card={card} />
        ))}
      </div>
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

  const planLabel = plan === "family_pro_plus" ? "Family Pro+" : "Pro+"

  if (loading) {
    return <div className="px-4 py-6 text-white">Loading...</div>
  }

  if (!isQuestPlan(plan)) {
    return (
      <Paywall
        title="Quests Locked"
        message="Upgrade to Pro+ to unlock premium Bible skill challenges, focused practice modes, and deeper mastery paths."
      />
    )
  }

  return (
    <main className="ba-quests-page">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,rgba(245,180,54,0.16),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-3rem] top-16 h-44 w-44 rounded-full bg-amber-300/8 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-24 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[95rem]">
        <section className="ba-quests-header">
          <div className="min-w-0">
            <div className="ba-text-title text-[2.1rem] sm:text-[2.9rem]">Quests</div>
            <p className="mt-1.5 max-w-xl text-[0.9rem] leading-[1.5] text-[#eadfcd]/78 sm:text-[1rem]">
              Complete challenges. Grow in wisdom.
            </p>
          </div>

          <div className="ba-quests-header-card">
            <div className="ba-quests-header-card-art">
              <Image
                src="/quests/hero/quests-main.png"
                alt=""
                fill
                className="object-cover object-center"
                sizes="220px"
              />
            </div>
            <div className="ba-quests-header-card-overlay" />
            <div className="relative z-10 flex items-center gap-3">
              <span className="ba-quests-header-medallion">
                {renderNavIcon("quests", "h-4 w-4")}
              </span>
              <div>
                <div className="ba-text-section-label text-[0.5rem] text-[#f2d391]">Quest Access</div>
                <div className="mt-1 text-[0.88rem] font-semibold text-[#f6eddf]">{planLabel} Active</div>
              </div>
            </div>
          </div>
        </section>

        <section className="ba-quests-main-grid">
          <div className="min-w-0">
            <div className="ba-quests-hero">
              <div className="ba-quests-hero-art">
                <Image
                  src="/quests/hero/who-said-it-hero.png"
                  alt="Who Said It? hero art"
                  fill
                  priority
                  className="object-cover object-[66%_40%]"
                  sizes="(max-width: 1279px) 100vw, 860px"
                />
              </div>
              <div className="ba-quests-hero-overlay" />
              <div className="ba-quests-hero-vignette" />

              <div className="relative z-10 flex min-h-[17.4rem] flex-col p-4 sm:min-h-[19rem] sm:p-5 xl:min-h-[16rem] xl:p-4">
                <div className="ba-quest-hero-kicker">
                  <span className="text-[#ffd97d]">{renderNavIcon("quests", "h-4 w-4")}</span>
                  TODAY&apos;S CHALLENGE
                </div>

                <div className="mt-3 max-w-[22rem] xl:mt-2.5">
                  <h1 className="ba-text-title text-[2.15rem] sm:text-[3rem] xl:text-[2.78rem]">
                    Who Said It?
                  </h1>
                  <p className="mt-3 text-[0.92rem] leading-[1.56] text-[#f5eadc]/84 sm:text-[1rem] xl:mt-2.5 xl:text-[0.93rem] xl:leading-[1.48]">
                    Identify who spoke the scripture.
                    <br />
                    Sharpen your knowledge.
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 xl:mt-3 xl:gap-1.5">
                  <span className="ba-quest-status-pill ba-quest-status-pill--gold">Practice Only</span>
                  <span className="ba-quest-status-pill ba-quest-status-pill--orange">10 Questions</span>
                  <span className="ba-quest-status-pill ba-quest-status-pill--locked">No XP Yet</span>
                </div>

                <div className="mt-auto pt-5 xl:pt-2.5">
                  <Link href="/quests/who-said-it" className="ba-quest-hero-cta">
                    <span className="ba-hero-cta-medallion">
                      {renderNavIcon("quests", "h-[1rem] w-[1rem]")}
                    </span>
                    <span className="ba-hero-cta-label">Enter Challenge</span>
                    <span className="ba-quest-hero-cta-arrow">
                      {renderNavIcon("chevron-right", "h-4 w-4")}
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <section className="ba-quests-stat-strip">
              {questStats.map((stat) => (
                <QuestStatCard key={stat.label} stat={stat} />
              ))}
            </section>

            <QuestStatusList planLabel={planLabel} />

            <div className="space-y-5 xl:space-y-3">
              <QuestHorizontalRail
                title="Quest Families"
                ariaLabelBase="Quest Families"
                desktopClassName="md:grid-cols-3"
              >
                {questFamilies.map((card) => (
                  <QuestFamilyCard key={card.title} card={card} />
                ))}
              </QuestHorizontalRail>

              <QuestAboutSection />
            </div>
          </div>

          <aside className="ba-quests-right-rail">
            {questPanels(planLabel).map((panel) => (
              <QuestRailPanel key={panel.title} panel={panel} />
            ))}
          </aside>
        </section>
      </div>
    </main>
  )
}
