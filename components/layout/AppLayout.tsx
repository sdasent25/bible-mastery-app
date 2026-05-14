"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import Sidebar from "@/components/layout/Sidebar"
import { isNavItemActive, mobileNavItems, renderNavIcon } from "@/lib/navigation"
import { useXPStore } from "@/lib/xpStore"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const xp = useXPStore((s) => s.xp)

  const isGameMode =
    pathname === "/quiz" ||
    pathname === "/flashcards/review" ||
    pathname.startsWith("/games/")

  const showMobileNav = !isGameMode
  const athleteLevel = Math.max(1, Math.floor(xp / 250) + 1)
  const xpIntoLevel = xp % 250
  const levelProgress = Math.max(10, Math.min(100, (xpIntoLevel / 250) * 100))

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOpen(false)
    })

    return () => window.cancelAnimationFrame(frame)
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
      className={`ba-page-bg ba-auth-shell flex min-h-screen text-white ${open && !isGameMode ? "overflow-hidden" : ""}`}
    >
      {open && !isGameMode ? (
        <div
          className="fixed inset-0 z-[900] bg-black/65 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside className="hidden md:block md:relative md:z-[999] md:h-screen md:w-72 md:shrink-0">
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
          <div className="ba-sacred-surface flex h-full flex-col rounded-r-[1.75rem] border-l-0 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
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

      <div className="ba-content-frame flex min-w-0 flex-1 flex-col">
        {showMobileNav ? (
          <div className="ba-top-shell sticky top-0 z-30 px-4 py-3 md:hidden">
            <div className="ba-cinematic-container flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="ba-icon-badge ba-gold-edge inline-flex h-11 w-11 items-center justify-center rounded-2xl text-amber-50">
                    {renderNavIcon("brand", "h-[1.05rem] w-[1.05rem]")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold tracking-[0.08em] text-amber-50">
                      Bible Athlete
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/58">
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/10 px-1 text-[9px] text-amber-50">
                        {athleteLevel}
                      </span>
                      <span>Athlete Level</span>
                    </div>
                  </div>
                </div>
                <div className="ba-progress-track mt-2 h-1.5 w-[9.75rem]">
                  <div
                    className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(241,185,63,1),rgba(250,214,117,0.98),rgba(147,229,255,0.42))]"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/upgrade"
                  className="ba-topbar-icon h-11 w-11 text-amber-50"
                  aria-label="Open upgrade options"
                >
                  {renderNavIcon("crown", "h-[1rem] w-[1rem]")}
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-label="Open navigation menu"
                  className="ba-topbar-icon h-11 w-11 text-white shadow-[0_0_18px_rgba(0,0,0,0.2)]"
                >
                  {renderNavIcon("menu", "h-[1.05rem] w-[1.05rem]")}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className={`flex-1 transition ${open ? "md:blur-0" : ""}`}>
          <div className="md:hidden">
            <div className={`ba-cinematic-container ${showMobileNav ? "ba-page-with-nav" : ""}`}>
              {children}
            </div>

            {showMobileNav ? (
              <div className="ba-mobile-safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pt-2">
                <div className="ba-bottom-nav mx-auto grid h-[82px] max-w-[32rem] grid-cols-5 rounded-[1.8rem] px-1">
                  {mobileNavItems.map((item) => {
                    const active = isNavItemActive(pathname, item.href)
                    const showDot = item.href === "/quests"

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`ba-nav-item flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition ${
                          active ? "text-amber-50" : "text-white/62 hover:text-white"
                        }`}
                      >
                        <span
                          className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                            active
                              ? "ba-nav-active border-amber-200/22 bg-amber-200/10 text-amber-50"
                              : "border-transparent bg-white/[0.02] text-white/62"
                          }`}
                        >
                          {renderNavIcon(item.icon, "h-[1.05rem] w-[1.05rem]")}
                          {showDot ? (
                            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]" />
                          ) : null}
                        </span>
                        <span className={`leading-none ${active ? "font-semibold" : ""}`}>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden md:block md:overflow-y-auto md:px-8 md:py-7">
            <div className="mx-auto w-full max-w-[1560px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
