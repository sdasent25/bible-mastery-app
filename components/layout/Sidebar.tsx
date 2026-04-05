"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    pentateuch: true,
    history: false,
    wisdom: false,
    prophets: false,
    gospels: false,
    epistles: false,
  })

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
            : "text-white/80 hover:bg-neutral-800 hover:text-white"
        }`}
      >
        {label}
      </Link>
    )
  }

  function bookItem(label: string, locked = false) {
    return (
      <div className="flex items-center justify-between px-4 py-1.5 text-sm text-white/80 hover:text-white transition">
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
          className="cursor-pointer text-sm text-white/80"
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

  return (
    <div className="flex h-full flex-col border-r border-neutral-800 p-4 space-y-4">
      <h1 className="text-xl font-bold">Bible Athlete</h1>

      <div className="space-y-1">
        {navItem("Journey", "/journey")}
        {navItem("Training", "/flashcards")}
        {navItem("Review", "/review")}
        {navItem("Programs", "/programs")}
        {navItem("Dashboard", "/dashboard")}
      </div>

      <div className="pt-4 space-y-2">
        <p className="text-xs text-white/60 uppercase tracking-wide">Sections</p>

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
  )
}
