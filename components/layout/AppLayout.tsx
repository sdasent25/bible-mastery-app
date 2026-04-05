"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  function navItem(label: string, href: string) {
    const active = pathname === href

    return (
      <Link
        href={href}
        className={`block px-4 py-2 rounded-lg transition ${
          active
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-neutral-800"
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <div className="hidden md:flex flex-col w-64 border-r border-neutral-800 p-4 space-y-4">
        <h1 className="text-xl font-bold">Bible Athlete</h1>

        <div className="space-y-1">
          {navItem("Journey", "/journey")}
          {navItem("Training", "/flashcards")}
          {navItem("Review", "/review")}
          {navItem("Programs", "/programs")}
          {navItem("Dashboard", "/dashboard")}
        </div>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
