"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { isNavItemActive, mobileNavItems } from "@/lib/navigation"
import Sidebar from "@/components/layout/Sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isGameMode =
    pathname === "/quiz" ||
    pathname === "/flashcards/review" ||
    pathname.startsWith("/games/")

  const showMobileNav = !isGameMode

  return (
    <div className={`flex min-h-screen bg-[#020617] text-white ${open && !isGameMode ? "overflow-hidden" : ""}`}>
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
          className={`flex-1 transition ${
            open ? "pointer-events-none blur-sm" : ""
          }`}
        >
          <div className="md:hidden bg-[#0B1220]">
            <div className={showMobileNav ? "pb-[92px]" : ""}>
              {children}
            </div>

            {showMobileNav && (
              <div className="fixed inset-x-0 bottom-0 z-40 h-[80px] border-t border-white/10 bg-black/95">
                <div className="grid h-full grid-cols-5">
                  {mobileNavItems.map((item) => {
                    const active = isNavItemActive(pathname, item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition ${
                          active
                            ? "text-white"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        <span className={`text-base ${active ? "scale-105" : ""}`}>
                          {item.icon}
                        </span>
                        <span className="leading-none">
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block md:p-6 md:overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
