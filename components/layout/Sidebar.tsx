"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUserPlan } from "@/lib/getUserPlan"

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

  function navItem(label: string, href: string) {
    const active = pathname.startsWith(href)

    return (
      <Link
        href={href}
        onClick={() => closeMobile?.()}
        className={`block px-4 py-3 rounded-xl transition font-medium ${
          active
            ? "bg-blue-600 text-white shadow-md"
            : "text-white hover:bg-neutral-800 hover:text-white"
        }`}
      >
        {label}
      </Link>
    )
  }

  function bookItem(label: string, locked = false) {
    return (
      <div className="flex items-center justify-between px-4 py-1.5 text-sm text-white hover:text-white transition">
        <span>{label}</span>
        {locked && <span className="text-xs">🔒</span>}
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
          className="cursor-pointer text-sm text-white"
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
  const planLabel =
    planType === "family_pro_plus"
      ? "Pro+"
      : planType === "family_pro"
        ? "Pro"
        : planType === "pro_plus"
          ? "Pro+"
          : planType === "pro"
            ? "Pro"
            : "Free"
  const fullPlanLabel = isFamily
    ? `${planLabel} (Family)`
    : `${planLabel} (Individual)`
  const questsActive = pathname.startsWith("/quests")

  if (!isPlanLoaded) {
    return null
  }

  return (
    <div className="flex flex-col h-full w-64 border-r border-neutral-800 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700">
      <div className="flex-1 space-y-4">
        <h1 className="text-xl font-bold">Bible Athlete</h1>
        <div className="text-xs mt-2 text-white">
          Plan:{" "}
          <span className="font-semibold text-green-400">
            {fullPlanLabel}
          </span>
        </div>

        <div className="space-y-2">
          {navItem("🏠 Dashboard", "/dashboard")}
          {navItem("📖 Journey", "/journey")}
          {navItem("🧠 Flashcards", "/flashcards")}
          <Link
            href="/quests"
            onClick={() => closeMobile?.()}
            className={`flex items-center px-4 py-3 rounded-xl transition font-medium ${
              questsActive
                ? "bg-blue-600 text-white shadow-md"
                : "text-white hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <span>🗺️ Quests</span>
            {hasAvailableQuests && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                1
              </span>
            )}
          </Link>
          {hasLeaderboardAccess ? (
            navItem("🏆 Leaderboard", "/leaderboard")
          ) : (
            <div
              onClick={() => router.push("/pricing?source=leaderboard_locked")}
              className="block px-4 py-3 rounded-xl text-gray-200 cursor-pointer"
            >
              🏆 Leaderboard 🔒
            </div>
          )}
        </div>

        {showUpgradeCta && (
          <Link
            href="/pricing"
            onClick={() => closeMobile?.()}
            className="block rounded-xl bg-yellow-400 px-4 py-3 text-center font-bold text-black transition hover:bg-yellow-300"
          >
            Upgrade to Pro+
          </Link>
        )}

        <div className="pt-4 space-y-2">
          <p className="text-xs text-white uppercase tracking-wide">Sections</p>

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

      <div className="pt-4 border-t border-neutral-800 space-y-2">
        <button
          onClick={() => {
            closeMobile?.()
            router.push("/settings")
          }}
          className="w-full text-left px-4 py-3 rounded-xl text-white hover:bg-neutral-800 hover:text-white transition"
        >
          ⚙️ Settings
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  )
}
