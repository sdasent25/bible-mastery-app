"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { supabase } from "@/lib/supabase"
import { getUserPlan } from "@/lib/getUserPlan"
import { desktopNavItems, isNavItemActive } from "@/lib/navigation"
import { useXPStore } from "@/lib/xpStore"

type SectionKey =
  | "pentateuch"
  | "history"
  | "wisdom"
  | "prophets"
  | "gospels"
  | "epistles"

type SidebarProps = {
  closeMobile?: () => void
}

export default function Sidebar({ closeMobile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [planType, setPlanType] = useState<string>("free")
  const [isFamily, setIsFamily] = useState(false)
  const [isPlanLoaded, setIsPlanLoaded] = useState(false)
  const [streak, setStreak] = useState(0)
  const xp = useXPStore((s) => s.xp)
  const setXP = useXPStore((s) => s.setXP)
  const hasAvailableQuests = true

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    pentateuch: true,
    history: false,
    wisdom: false,
    prophets: false,
    gospels: false,
    epistles: false,
  })

  useEffect(() => {
    const loadXP = async () => {
      const client = createClient()

      const {
        data: { user },
      } = await client.auth.getUser()

      if (!user) return

      const { data } = await client
        .from("profiles")
        .select("xp, streak")
        .eq("id", user.id)
        .single()

      if (data) {
        setXP(data.xp || 0)
        setStreak(data.streak || 0)
      }
    }

    void loadXP()
  }, [])

  useEffect(() => {
    const loadPlan = async () => {
      const currentPlan = await getUserPlan()
      setPlanType(currentPlan)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsFamily(false)
        setIsPlanLoaded(true)
        return
      }

      const { data } = await supabase
        .from("user_access")
        .select("in_family")
        .eq("user_id", user.id)
        .single()

      setIsFamily(data?.in_family === true)
      setIsPlanLoaded(true)

      console.log("SIDEBAR PLAN:", currentPlan)
    }

    void loadPlan()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    closeMobile?.()
    router.push("/")
  }

  function toggle(section: SectionKey) {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  function navItem(label: string, href: string, icon?: string) {
    const active = isNavItemActive(pathname, href)
    const isTraining = href === "/training"

    return (
      <Link
        href={href}
        onClick={() => closeMobile?.()}
        className={`block rounded-[1rem] px-4 py-3 transition font-medium ${
          active
            ? isTraining
              ? "border border-amber-200/18 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_42%),linear-gradient(180deg,rgba(33,23,10,0.96),rgba(13,12,14,0.98))] text-amber-50 shadow-[0_0_26px_rgba(251,191,36,0.12)]"
              : "border border-cyan-200/16 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_42%),linear-gradient(180deg,rgba(14,22,36,0.96),rgba(8,12,20,0.98))] text-white shadow-[0_0_22px_rgba(34,211,238,0.10)]"
            : "border border-transparent text-white/84 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
        }`}
      >
        {icon ? `${icon} ${label}` : label}
      </Link>
    )
  }

  function bookItem(label: string, locked = false) {
    return (
      <div className="flex items-center justify-between rounded-[0.85rem] px-4 py-2 text-sm text-white/78 transition hover:bg-white/[0.04] hover:text-white">
        <span>{label}</span>
        {locked && <span className="text-xs text-white/46">🔒</span>}
      </div>
    )
  }

  function sectionItem(
    key: SectionKey,
    label: string,
    items: React.ReactNode
  ) {
    return (
      <div>
        <div
          onClick={() => toggle(key)}
          className="cursor-pointer rounded-[0.85rem] px-3 py-2 text-sm font-semibold text-white/84 transition hover:bg-white/[0.04] hover:text-white"
        >
          {label}
        </div>

        {openSections[key] && (
          <div className="ml-2 mt-1 space-y-1">
            {items}
          </div>
        )}
      </div>
    )
  }

  const hasLeaderboardAccess =
    planType === "pro_plus" || planType === "family_pro_plus"
  const showUpgradeCta =
    planType === "free" || planType === "pro" || planType === "family_pro"
  const fullPlanLabel =
    planType === "family_pro_plus"
      ? "Pro+ (Family)"
      : planType === "family_pro"
        ? "Pro (Family)"
        : planType === "pro_plus"
          ? isFamily
            ? "Pro+ (Family)"
            : "Pro+ (Individual)"
          : planType === "pro"
            ? isFamily
              ? "Pro (Family)"
              : "Pro (Individual)"
            : isFamily
              ? "Free (Family)"
              : "Free (Individual)"
  const questsActive = pathname.startsWith("/quests")

  if (!isPlanLoaded) {
    return null
  }

  return (
    <div className="flex h-full w-64 flex-col overflow-y-auto border-r border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.06),transparent_32%),linear-gradient(180deg,rgba(11,16,26,0.98),rgba(7,10,18,0.98))] p-4 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)] scrollbar-thin scrollbar-thumb-white/10">
      <div className="flex-1 space-y-4">
        <div className="rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_46px_rgba(0,0,0,0.18)]">
          <h1 className="text-xl font-black tracking-[-0.03em] text-white">Bible Athlete</h1>
          <p className="mt-2 text-sm leading-6 text-white/64">
            Premium Scripture training with disciplined daily momentum.
          </p>
        </div>
        <div className="mt-2 rounded-[1.35rem] border border-yellow-400/20 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_70%),rgba(250,204,21,0.08)] px-3 py-3 shadow-[0_0_24px_rgba(250,204,21,0.12)]">
          <div className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Total XP
          </div>
          <div className="text-sm font-semibold text-yellow-400">
            🔥 {xp} XP
          </div>
          <div className="text-sm font-semibold text-yellow-400">
            🔥 {streak} Day Streak
          </div>
        </div>
        <div className="rounded-[1rem] border border-emerald-300/14 bg-emerald-300/8 px-3 py-2 text-xs text-white/84">
          Plan:{" "}
          <span className="font-semibold text-green-400">
            {fullPlanLabel}
          </span>
        </div>

        <div className="space-y-2">
          {desktopNavItems
            .filter((item) => item.href !== "/quests" && item.href !== "/leaderboard")
            .map((item) => (
              <div key={item.href}>
                {navItem(item.label, item.href, item.icon)}
              </div>
            ))}
          <Link
            href="/quests"
            onClick={() => closeMobile?.()}
            className={`flex items-center rounded-[1rem] px-4 py-3 transition font-medium ${
              questsActive
                ? "border border-cyan-200/16 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_42%),linear-gradient(180deg,rgba(14,22,36,0.96),rgba(8,12,20,0.98))] text-white shadow-[0_0_22px_rgba(34,211,238,0.10)]"
                : "border border-transparent text-white/84 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <span>⚔️ Quests</span>
            {hasAvailableQuests && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                1
              </span>
            )}
          </Link>
          {hasLeaderboardAccess ? (
            navItem("Leaderboard", "/leaderboard", "🏆")
          ) : (
            <div
              onClick={() => router.push("/pricing?source=leaderboard_locked")}
              className="block cursor-pointer rounded-[1rem] border border-transparent px-4 py-3 text-gray-200 transition hover:border-white/10 hover:bg-white/[0.05]"
            >
              🏆 Leaderboard 🔒
            </div>
          )}
        </div>

        {showUpgradeCta && (
          <Link
            href="/pricing"
            onClick={() => closeMobile?.()}
            className="block rounded-[1rem] bg-yellow-400 px-4 py-3 text-center font-bold text-black shadow-[0_16px_32px_rgba(250,204,21,0.14)] transition hover:bg-yellow-300"
          >
            Upgrade to Pro+
          </Link>
        )}

        <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-3 pt-4 space-y-2">
          <p className="px-3 text-xs text-white/48 uppercase tracking-[0.22em]">Sections</p>

          {sectionItem("pentateuch", "Pentateuch", (
            <>
              {bookItem("Genesis")}
              {bookItem("Exodus", true)}
              {bookItem("Leviticus", true)}
              {bookItem("Numbers", true)}
              {bookItem("Deuteronomy", true)}
            </>
          ))}

          {sectionItem("history", "History", (
            <>
              {bookItem("Joshua", true)}
              {bookItem("Judges", true)}
              {bookItem("Ruth", true)}
            </>
          ))}

          {sectionItem("wisdom", "Wisdom", (
            <>
              {bookItem("Job", true)}
              {bookItem("Psalms", true)}
              {bookItem("Proverbs", true)}
            </>
          ))}

          {sectionItem("prophets", "Prophets", (
            <>
              {bookItem("Isaiah", true)}
              {bookItem("Jeremiah", true)}
              {bookItem("Ezekiel", true)}
            </>
          ))}

          {sectionItem("gospels", "Gospels", (
            <>
              {bookItem("Matthew", true)}
              {bookItem("Mark", true)}
              {bookItem("Luke", true)}
              {bookItem("John", true)}
            </>
          ))}

          {sectionItem("epistles", "Epistles", (
            <>
              {bookItem("Romans", true)}
              {bookItem("1 Corinthians", true)}
              {bookItem("Hebrews", true)}
            </>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/8 space-y-2">
        <button
          onClick={() => {
            closeMobile?.()
            router.push("/settings")
          }}
          className="w-full rounded-[1rem] px-4 py-3 text-left text-white/84 transition hover:bg-white/[0.05] hover:text-white"
        >
          ⚙️ Settings
        </button>

        <button
          onClick={handleLogout}
          className="w-full rounded-[1rem] px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  )
}
