"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { getUserPlan } from "@/lib/getUserPlan"
import {
  desktopNavItems,
  isNavItemActive,
  renderNavIcon,
  type NavIconKey,
} from "@/lib/navigation"
import { createClient } from "@/lib/supabase/client"
import { supabase } from "@/lib/supabase"
import { useXPStore } from "@/lib/xpStore"

type SidebarProps = {
  closeMobile?: () => void
  variant?: "desktop" | "mobile"
}

export default function Sidebar({
  closeMobile,
  variant = "desktop",
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [planType, setPlanType] = useState<string>("free")
  const [isFamily, setIsFamily] = useState(false)
  const [isPlanLoaded, setIsPlanLoaded] = useState(false)
  const [streak, setStreak] = useState(0)
  const xp = useXPStore((s) => s.xp)
  const setXP = useXPStore((s) => s.setXP)
  const hasAvailableQuests = true

  const isMobile = variant === "mobile"

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
  }, [setXP])

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
    }

    void loadPlan()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    closeMobile?.()
    router.push("/")
  }

  function navItem(label: string, href: string, icon: NavIconKey, isFlagship = false) {
    const active = isNavItemActive(pathname, href)

    return (
      <Link
        href={href}
        onClick={() => closeMobile?.()}
        className={`group block rounded-[1rem] border px-4 py-3 transition duration-200 ${
          active
            ? "border-amber-200/22 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_42%),linear-gradient(180deg,rgba(33,23,10,0.96),rgba(12,14,22,0.98))] text-amber-50 shadow-[0_0_34px_rgba(251,191,36,0.12)]"
            : "border-white/0 bg-white/[0.02] text-white/84 hover:border-cyan-200/12 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] hover:text-white hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
              active
                ? "border-amber-200/20 bg-amber-200/10 text-amber-50 shadow-[0_0_22px_rgba(251,191,36,0.14)]"
                : "border-white/10 bg-white/[0.04] text-white/62 group-hover:border-cyan-200/18 group-hover:bg-cyan-200/10 group-hover:text-cyan-50"
            }`}
          >
            {renderNavIcon(icon, "h-[1.05rem] w-[1.05rem]")}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{label}</div>
            {isFlagship ? (
              <div className={`text-[11px] uppercase tracking-[0.18em] ${active ? "text-amber-100/78" : "text-white/44"}`}>
                Flagship lane
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    )
  }

  const hasLeaderboardAccess =
    planType === "pro_plus" || planType === "family_pro_plus"
  const isProPlusMember = hasLeaderboardAccess
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
    return (
      <div
        className={`flex h-full flex-col ${isMobile ? "w-full" : "w-64"} overflow-y-auto border-r border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.06),transparent_32%),linear-gradient(180deg,rgba(11,16,26,0.98),rgba(7,10,18,0.98))] p-4 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)]`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-[1.4rem] border border-white/10 bg-white/[0.04]" />
          <div className="h-20 rounded-[1.3rem] border border-white/10 bg-white/[0.04]" />
          <div className="h-10 rounded-[1rem] border border-white/10 bg-white/[0.04]" />
          <div className="space-y-2">
            <div className="h-14 rounded-[1rem] bg-white/[0.04]" />
            <div className="h-14 rounded-[1rem] bg-white/[0.04]" />
            <div className="h-14 rounded-[1rem] bg-white/[0.04]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex h-full flex-col ${isMobile ? "w-full" : "w-64"} overflow-y-auto border-r border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,216,125,0.06),transparent_32%),linear-gradient(180deg,rgba(11,16,26,0.98),rgba(7,10,18,0.98))] p-4 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)] scrollbar-thin scrollbar-thumb-white/10`}
    >
      <div className="flex-1 space-y-4">
        <div className="rounded-[1.45rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_46px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/18 bg-amber-200/10 text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
              {renderNavIcon("brand", "h-5 w-5")}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-[-0.03em] text-white">
                Bible Athlete
              </h1>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/48">
                Training Command
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/64">
            Train your mind. Strengthen your faith.
          </p>
        </div>

        <div className="rounded-[1.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/44">
                Total XP
              </div>
              <div className="mt-2 text-lg font-black text-white">{xp}</div>
            </div>
            <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/44">
                Streak
              </div>
              <div className="mt-2 text-lg font-black text-white">{streak} days</div>
            </div>
          </div>
          <div className="mt-3 rounded-[1rem] border border-emerald-300/14 bg-emerald-300/8 px-3 py-2 text-xs text-white/84">
            Plan: <span className="font-semibold text-emerald-300">{fullPlanLabel}</span>
          </div>
        </div>

        <div className="space-y-2">
          {desktopNavItems
            .filter((item) => item.href !== "/quests" && item.href !== "/leaderboard")
            .map((item) => (
              <div key={item.href}>
                {navItem(item.label, item.href, item.icon, item.href === "/training")}
              </div>
            ))}

          <Link
            href="/quests"
            onClick={() => closeMobile?.()}
            className={`group block rounded-[1rem] border px-4 py-3 transition duration-200 ${
              questsActive
                ? "border-amber-200/22 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_42%),linear-gradient(180deg,rgba(33,23,10,0.96),rgba(12,14,22,0.98))] text-amber-50 shadow-[0_0_34px_rgba(251,191,36,0.12)]"
                : "border-white/0 bg-white/[0.02] text-white/84 hover:border-cyan-200/12 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] hover:text-white hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    questsActive
                      ? "border-amber-200/20 bg-amber-200/10 text-amber-50 shadow-[0_0_22px_rgba(251,191,36,0.14)]"
                      : "border-white/10 bg-white/[0.04] text-white/62 group-hover:border-cyan-200/18 group-hover:bg-cyan-200/10 group-hover:text-cyan-50"
                  }`}
                >
                  {renderNavIcon("quests", "h-[1.05rem] w-[1.05rem]")}
                </span>
                <div className="text-sm font-semibold">Quests</div>
              </div>
              {hasAvailableQuests ? (
                <span className="rounded-full border border-amber-300/28 bg-amber-300/14 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-50 shadow-[0_0_16px_rgba(251,191,36,0.12)]">
                  1
                </span>
              ) : null}
            </div>
          </Link>

          {hasLeaderboardAccess ? (
            navItem("Leaderboard", "/leaderboard", "leaderboard")
          ) : (
            <button
              type="button"
              onClick={() => {
                closeMobile?.()
                router.push("/pricing?source=leaderboard_locked")
              }}
              className="block w-full cursor-pointer rounded-[1rem] border border-white/0 bg-white/[0.02] px-4 py-3 text-left text-white/84 transition hover:border-cyan-200/12 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] hover:text-white hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/62">
                  {renderNavIcon("leaderboard", "h-[1.05rem] w-[1.05rem]")}
                </span>
                <div>
                  <div className="text-sm font-semibold">Leaderboard</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">
                    Locked
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>

        <div className="rounded-[1.4rem] border border-cyan-200/14 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.10),transparent_28%),radial-gradient(circle_at_top_left,rgba(247,227,161,0.12),transparent_28%),linear-gradient(180deg,rgba(17,22,34,0.98),rgba(8,11,20,0.98))] p-4 shadow-[0_18px_46px_rgba(0,0,0,0.2)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100/82">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-100/20 bg-amber-100/10 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.12)]">
              {renderNavIcon("upgrade", "h-3.5 w-3.5")}
            </span>
            <span>{isProPlusMember ? "Pro+ Member" : "Pro+ Arena"}</span>
          </div>
          <h2 className="mt-4 text-xl font-black tracking-[-0.03em] text-white">
            {isProPlusMember
              ? "Full arena access is live."
              : "Unlock the full training experience."}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/64">
            {isProPlusMember
              ? "You have access to the elite training lane, deeper drills, and the full arena rollout."
              : "Hard drills, richer book tracks, premium arena access, and the strongest daily training path."}
          </p>
          {showUpgradeCta ? (
            <Link
              href="/pricing"
              onClick={() => closeMobile?.()}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-4 py-3 text-sm font-black text-[#2d1700] shadow-[0_16px_32px_rgba(250,204,21,0.14)] transition hover:bg-amber-100"
            >
              Go Pro+
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-white/8 pt-4">
        <button
          onClick={() => {
            closeMobile?.()
            router.push("/settings")
          }}
          className="flex w-full items-center gap-3 rounded-[1rem] border border-white/0 bg-white/[0.02] px-4 py-3 text-left text-white/84 transition hover:border-cyan-200/12 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] hover:text-white"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/62">
            {renderNavIcon("settings", "h-[1.05rem] w-[1.05rem]")}
          </span>
          <span className="text-sm font-semibold">Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[1rem] border border-red-400/0 bg-red-500/[0.04] px-4 py-3 text-left text-red-300 transition hover:border-red-400/12 hover:bg-red-500/10"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-400/10 bg-red-500/[0.06] text-red-200">
            {renderNavIcon("close", "h-[1.05rem] w-[1.05rem]")}
          </span>
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </div>
  )
}
