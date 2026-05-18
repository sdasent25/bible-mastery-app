"use client"

import Image from "next/image"
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
  const isTrainingRoute = pathname === "/training"

  const showMobileNav = !isGameMode
  const athleteLevel = Math.max(1, Math.floor(xp / 250) + 1)

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
    <div className={`ba-page-bg ba-auth-shell ba-mobile-shell min-h-screen text-white ${open && !isGameMode ? "overflow-hidden" : ""}`}>
      {open && !isGameMode ? (
        <div
          className="ba-mobile-drawer-overlay fixed inset-0 z-[900] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="min-h-screen w-full lg:px-2 lg:py-2 xl:px-2.5 xl:py-2.5">
        <div className="flex min-h-screen w-full lg:rounded-[2rem] lg:border lg:border-white/8 lg:bg-[linear-gradient(180deg,rgba(6,12,22,0.96),rgba(4,8,16,0.98))] lg:shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
          <aside className="hidden lg:block lg:relative lg:z-[2] lg:w-[220px] lg:shrink-0 xl:w-[228px]">
            <Sidebar variant="desktop" />
          </aside>

          {showMobileNav ? (
            <div
              className={`fixed inset-y-0 left-0 z-[950] w-[88vw] max-w-[23rem] transform transition-transform duration-300 lg:hidden ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="ba-mobile-drawer flex h-full flex-col rounded-r-[1.85rem] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="ba-sidebar-brand-mark h-10 w-10 rounded-[0.95rem]">
                        {renderNavIcon("brand", "h-[1rem] w-[1rem]")}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[0.95rem] font-bold tracking-[-0.02em] text-white">
                          Bible Athlete
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">
                          Sacred Training
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300/16 bg-amber-300/8 px-2.5 py-1 text-[0.68rem] font-medium text-amber-50/88">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/10 text-[0.76rem] font-black text-amber-50">
                        {athleteLevel}
                      </span>
                      Athlete Level
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close navigation menu"
                    className="ba-mobile-drawer-close"
                  >
                    {renderNavIcon("close", "h-[1.05rem] w-[1.05rem]")}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <Sidebar variant="mobile" closeMobile={() => setOpen(false)} />
                </div>
              </div>
            </div>
          ) : null}

          <div className="ba-content-frame flex min-w-0 flex-1 flex-col md:min-h-0">
            {showMobileNav ? (
              <div
                className={`ba-top-shell sticky top-0 z-30 px-4 lg:hidden ${
                  isTrainingRoute ? "py-2" : "py-3"
                }`}
              >
                <div className="ba-cinematic-container">
                  <div className="ba-mobile-topbar">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="ba-icon-badge ba-gold-edge inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-amber-50">
                        {renderNavIcon("brand", "h-[1.05rem] w-[1.05rem]")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[0.94rem] font-semibold tracking-[0.02em] text-amber-50">
                          Bible Athlete
                        </div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/58">
                          Dashboard
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href="/upgrade"
                        className="ba-mobile-header-icon text-amber-50"
                        aria-label="Open upgrade options"
                      >
                        {renderNavIcon("crown", "h-[1rem] w-[1rem]")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-label="Open navigation menu"
                        className="ba-mobile-header-icon ba-mobile-menu-trigger text-white"
                      >
                        {renderNavIcon("menu", "h-[1.05rem] w-[1.05rem]")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className={`flex-1 transition lg:min-h-0 ${open ? "lg:blur-0" : ""}`}>
              <div className="overflow-x-hidden lg:hidden">
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
                              {item.imageSrc ? (
                                <Image
                                  src={item.imageSrc}
                                  alt=""
                                  width={36}
                                  height={36}
                                  className={`h-[1.8rem] w-[1.8rem] object-contain transition ${
                                    active
                                      ? "brightness-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.35)]"
                                      : "opacity-78"
                                  }`}
                                />
                              ) : (
                                renderNavIcon(item.icon, "h-[1.05rem] w-[1.05rem]")
                              )}
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

              <div className="hidden lg:block lg:px-[12px] lg:py-[12px] xl:px-[14px] xl:py-[14px]">
                <div
                  className={`w-full ${
                    isTrainingRoute ? "ba-scrollbar-hidden overflow-y-auto lg:min-h-0" : ""
                  }`}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
