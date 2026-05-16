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

  const showMobileNav = !isGameMode
  const athleteLevel = Math.max(1, Math.floor(xp / 250) + 1)
  const xpIntoLevel = xp % 250
  const xpToNextLevel = Math.max(250 - xpIntoLevel, 0)
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
    <div className={`ba-page-bg ba-auth-shell min-h-screen text-white ${open && !isGameMode ? "overflow-hidden" : ""}`}>
      {open && !isGameMode ? (
        <div
          className="fixed inset-0 z-[900] bg-black/65 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="mx-auto min-h-screen w-full md:h-screen md:w-[calc(100vw-20px)] md:max-w-[1270px] md:px-0 md:py-2.5 xl:w-[calc(100vw-28px)] xl:max-w-[1286px] xl:py-3">
        <div className="flex min-h-screen w-full md:sticky md:top-2.5 md:h-[calc(100vh-20px)] md:min-h-0 md:overflow-hidden md:rounded-[2rem] md:border md:border-white/8 md:bg-[linear-gradient(180deg,rgba(6,12,22,0.96),rgba(4,8,16,0.98))] md:shadow-[0_28px_80px_rgba(0,0,0,0.42)] xl:top-3 xl:h-[calc(100vh-24px)]">
          <aside className="hidden md:block md:relative md:z-[2] md:w-[196px] md:shrink-0 xl:w-[202px]">
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

          <div className="ba-content-frame flex min-w-0 flex-1 flex-col md:min-h-0">
            {showMobileNav ? (
              <div className="ba-top-shell sticky top-0 z-30 px-4 py-3 md:hidden">
                <div className="ba-cinematic-container">
                  <div className="flex items-center justify-between gap-3 rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(10,16,28,0.9),rgba(5,10,18,0.86))] px-3.5 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.24)] backdrop-blur-[18px]">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="ba-icon-badge ba-gold-edge inline-flex h-11 w-11 items-center justify-center rounded-2xl text-amber-50">
                        {renderNavIcon("brand", "h-[1.05rem] w-[1.05rem]")}
                      </div>
                      <div className="min-w-0 max-w-[7rem]">
                        <div className="truncate text-sm font-semibold tracking-[0.08em] text-amber-50">
                          Bible Athlete
                        </div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/58">
                          Dashboard
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] border border-amber-300/22 bg-[linear-gradient(180deg,rgba(35,26,14,0.98),rgba(14,11,11,0.98))] text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/8 text-[0.95rem] font-black">
                          {athleteLevel}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[0.8rem] font-medium text-white/82">Athlete Level</div>
                        <div className="truncate text-[0.92rem] font-semibold tracking-[-0.02em] text-white">
                          {xpToNextLevel} XP to next level
                        </div>
                        <div className="ba-progress-track mt-2 h-1.5">
                          <div
                            className="ba-progress-glow h-full rounded-full bg-[linear-gradient(90deg,rgba(241,185,63,1),rgba(250,214,117,0.98),rgba(147,229,255,0.42))]"
                            style={{ width: `${levelProgress}%` }}
                          />
                        </div>
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
              </div>
            ) : null}

            <div className={`flex-1 transition md:min-h-0 ${open ? "md:blur-0" : ""}`}>
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

              <div className="hidden h-full md:block md:overflow-hidden md:px-[18px] md:py-[18px] xl:px-5 xl:py-5">
                <div className="h-full w-full">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
