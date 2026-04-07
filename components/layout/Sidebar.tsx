"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

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
  const [planType, setPlanType] = useState<string | null>(null)

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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("user_access")
        .select("final_plan")
        .eq("user_id", user.id)
        .single()

      const plan = data?.final_plan ?? "free"
      setPlanType(plan)

      console.log("SIDEBAR PLAN:", plan)
    }

    void loadPlan()
  }, [router])

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
    planType === "pro" || planType === "pro_plus"

  if (planType === null) {
    return null
  }

  return (
    <div className="flex flex-col h-full w-64 border-r border-neutral-800 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700">
      <div className="flex-1 space-y-4">
        <h1 className="text-xl font-bold">Bible Athlete</h1>
        <div className="text-xs mt-2 text-white">
          Plan:{" "}
          <span className="font-semibold text-green-400">
            {planType === "pro_plus"
              ? "Pro+"
              : planType === "pro"
                ? "Pro"
                : "Free"}
          </span>
        </div>

        <div className="space-y-2">
          {navItem("🏠 Dashboard", "/dashboard")}
          {navItem("📖 Journey", "/journey")}
          {planType === "pro" || planType === "pro_plus" ? (
            navItem("🧠 Flashcards", "/flashcards")
          ) : (
            <div
              onClick={() => router.push("/pricing?source=flashcards_locked")}
              className="block px-4 py-3 rounded-xl text-white opacity-50 cursor-pointer"
            >
              🧠 Flashcards 🔒
            </div>
          )}
          {hasLeaderboardAccess ? (
            navItem("🏆 Leaderboard", "/leaderboard")
          ) : (
            <div
              onClick={() => router.push("/pricing?source=leaderboard_locked")}
              className="block px-4 py-3 rounded-xl text-white opacity-50 cursor-pointer"
            >
              🏆 Leaderboard 🔒
            </div>
          )}
        </div>

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
