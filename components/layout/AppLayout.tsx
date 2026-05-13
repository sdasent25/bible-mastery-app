"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import Sidebar from "@/components/layout/Sidebar"
import { isNavItemActive, mobileNavItems, renderNavIcon } from "@/lib/navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isGameMode =
    pathname === "/quiz" ||
    pathname === "/flashcards/review" ||
    pathname.startsWith("/games/")

  const showMobileNav = !isGameMode

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [open])

  return (
    <div
      className={`flex min-h-screen bg-[#020617] text-white ${open && !isGameMode ? "overflow-hidden" : ""}`}
    >
      {open && !isGameMode ? (
        <div
          className="fixed inset-0 z-[900] bg-black/65 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside className="hidden md:block md:relative md:z-[999] md:h-screen md:w-64 md:shrink-0">
        <Sidebar variant="desktop" />
      </aside>

      {showMobileNav ? (
        <div
          className={`fixed inset-y-0 left-0 z-[950] w-[88vw] max-w-[23rem] transform transition-transform duration-300 md:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex h-full flex-col bg-[#070b14] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <div className="text-sm font-black tracking-[-0.02em] text-white">
                  Bible Athlete
                </div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">
                  Training Arena
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/84"
              >
                {renderNavIcon("close", "h-[1.05rem] w-[1.05rem]")}
              </button>
            </div>
            <Sidebar variant="mobile" closeMobile={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {showMobileNav ? (
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,rgba(7,11,20,0.98),rgba(7,11,20,0.94))] px-4 py-3 backdrop-blur md:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white shadow-[0_0_18px_rgba(0,0,0,0.2)]"
            >
              {renderNavIcon("menu", "h-[1.05rem] w-[1.05rem]")}
            </button>

            <div className="text-center">
              <div className="text-sm font-black tracking-[-0.02em] text-white">
                Bible Athlete
              </div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/48">
                Training Command
              </div>
            </div>

            <Link
              href="/training"
              className="inline-flex h-10 items-center justify-center rounded-full border border-amber-200/14 bg-amber-200/10 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.08)]"
            >
              Arena
            </Link>
          </div>
        ) : null}

        <div className={`flex-1 transition ${open ? "md:blur-0" : ""}`}>
          <div className="md:hidden bg-[#0B1220]">
            <div className={showMobileNav ? "pb-[104px]" : ""}>{children}</div>

            {showMobileNav ? (
              <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[linear-gradient(180deg,rgba(4,8,16,0.9),rgba(1,3,8,0.98))] shadow-[0_-12px_36px_rgba(0,0,0,0.32)] backdrop-blur">
                <div className="grid h-[84px] grid-cols-5">
                  {mobileNavItems.map((item) => {
                    const active = isNavItemActive(pathname, item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition ${
                          active ? "text-amber-50" : "text-white/62 hover:text-white"
                        }`}
                      >
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                            active
                              ? "border-amber-200/22 bg-amber-200/10 text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.12)]"
                              : "border-transparent bg-white/[0.02] text-white/62"
                          }`}
                        >
                          {renderNavIcon(item.icon, "h-[1.05rem] w-[1.05rem]")}
                        </span>
                        <span className={`leading-none ${active ? "font-semibold" : ""}`}>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden md:block md:overflow-y-auto md:p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
