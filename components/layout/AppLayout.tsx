"use client"

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
          className={`flex-1 overflow-y-auto p-2 md:p-6 transition ${
            open ? "pointer-events-none blur-sm" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
