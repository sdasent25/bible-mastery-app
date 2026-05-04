"use client"

import Link from "next/link"
import { useState } from "react"
import Sidebar from "@/components/layout/Sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`flex min-h-screen bg-[#020617] text-white ${open ? "overflow-hidden" : ""}`}>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-[900] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
          hidden md:block md:relative z-[999] h-full w-64 bg-[#020617]
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar closeMobile={() => setOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col md:min-w-0">
        <div className="hidden md:hidden items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#020617] sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="text-white text-xl"
          >
            ☰
          </button>

          <span className="font-semibold">Bible Athlete</span>

          <div />
        </div>

        <div
          className={`flex-1 md:overflow-y-auto md:p-6 transition ${
            open ? "pointer-events-none blur-sm" : ""
          }`}
        >
          <div className="md:hidden fixed inset-0 bg-[#0B1220] flex flex-col">
            <div className="flex-1 overflow-hidden">
              {children}
            </div>

            <div className="h-[80px] bg-black/95 border-t border-white/10 flex items-center justify-around">
              <Link href="/dashboard" className="flex flex-col items-center text-xs">
                <span>🏠</span>
                <span>Home</span>
              </Link>

              <Link href="/journey" className="flex flex-col items-center text-xs">
                <span>📖</span>
                <span>Journey</span>
              </Link>

              <Link href="/flashcards" className="flex flex-col items-center text-xs">
                <span>🧠</span>
                <span>Cards</span>
              </Link>

              <Link href="/quests" className="flex flex-col items-center text-xs">
                <span>⚔️</span>
                <span>Quests</span>
              </Link>

              <Link href="/leaderboard" className="flex flex-col items-center text-xs">
                <span>🏆</span>
                <span>Rank</span>
              </Link>

              <Link href="/settings" className="flex flex-col items-center text-xs">
                <span>⚙️</span>
                <span>Settings</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
