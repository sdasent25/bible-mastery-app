"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { getUserPlan } from "@/lib/getUserPlan"
import {
  desktopNavItems,
  isNavItemActive,
  renderNavIcon,
  type NavIconKey,
} from "@/lib/navigation"

type SidebarProps = {
  closeMobile?: () => void
  variant?: "desktop" | "mobile"
}

export default function Sidebar({
  closeMobile,
  variant = "desktop",
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [planType, setPlanType] = useState<string>("free")
  const [isPlanLoaded, setIsPlanLoaded] = useState(false)
  const hasAvailableQuests = true
  const isMobile = variant === "mobile"

  useEffect(() => {
    const loadPlan = async () => {
      const currentPlan = await getUserPlan()
      setPlanType(currentPlan)
      setIsPlanLoaded(true)
    }

    void loadPlan()
  }, [])

  function navItem(
    label: string,
    href: string,
    icon: NavIconKey,
    imageSrc?: string,
    showAlert = false
  ) {
    const active = isNavItemActive(pathname, href)

    return (
      <Link
        href={href}
        onClick={() => closeMobile?.()}
        className={`ba-sidebar-nav-item ${active ? "is-active" : ""}`}
      >
        <span className={`ba-sidebar-nav-icon ${active ? "is-active" : ""}`}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              width={34}
              height={34}
              className={`h-[1.1rem] w-[1.1rem] object-contain ${
                active ? "brightness-110" : "opacity-85"
              }`}
            />
          ) : (
            renderNavIcon(icon, "h-[1rem] w-[1rem]")
          )}
        </span>
        <span className="text-[0.84rem] font-medium leading-none">{label}</span>
        {showAlert ? <span className="ba-sidebar-nav-dot" /> : null}
      </Link>
    )
  }

  const hasLeaderboardAccess =
    planType === "pro_plus" || planType === "family_pro_plus"
  const questsActive = pathname.startsWith("/quests")
  const profileActive = pathname === "/settings"

  if (!isPlanLoaded) {
    return (
      <div className={`ba-sidebar ${isMobile ? "w-full" : "w-full"}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-16 rounded-[1.1rem] border border-white/8 bg-white/[0.04]" />
          <div className="space-y-2">
            <div className="h-11 rounded-[0.95rem] bg-white/[0.04]" />
            <div className="h-11 rounded-[0.95rem] bg-white/[0.04]" />
            <div className="h-11 rounded-[0.95rem] bg-white/[0.04]" />
            <div className="h-11 rounded-[0.95rem] bg-white/[0.04]" />
          </div>
          <div className="h-28 rounded-[1.2rem] border border-white/8 bg-white/[0.04]" />
        </div>
      </div>
    )
  }

  return (
    <div className={`ba-sidebar ${isMobile ? "w-full" : "w-full"}`}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="ba-sidebar-brand">
          <div className="flex items-center gap-3">
            <span className="ba-sidebar-brand-mark">
              {renderNavIcon("brand", "h-[1.15rem] w-[1.15rem]")}
            </span>
            <div className="min-w-0">
              <div className="ba-serif-brand text-[0.98rem] text-[#f5e7c8]">
                Bible Athlete
              </div>
              <div className="mt-0.5 text-[0.56rem] uppercase tracking-[0.28em] text-white/42">
                Sacred Training
              </div>
            </div>
          </div>
          <p className="mt-3 max-w-[12rem] text-[0.72rem] leading-5 text-white/44">
            Train your mind. Strengthen your faith.
          </p>
        </div>

        <div className="space-y-1.5">
          {desktopNavItems
            .filter((item) => item.href !== "/settings" && item.href !== "/profile")
            .map((item) => (
              <div key={`${item.href}-${item.label}`}>
                {item.href === "/leaderboard" && !hasLeaderboardAccess ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile?.()
                      router.push("/pricing?source=leaderboard_locked")
                    }}
                    className="ba-sidebar-nav-item w-full text-left"
                  >
                    <span className="ba-sidebar-nav-icon">
                      {renderNavIcon("leaderboard", "h-[1rem] w-[1rem]")}
                    </span>
                    <span className="truncate text-[0.92rem] font-medium">Leaderboard</span>
                  </button>
                ) : (
                  navItem(
                    item.label,
                    item.href,
                    item.icon,
                    item.imageSrc,
                    item.href === "/quests" && hasAvailableQuests && !questsActive
                  )
                )}
              </div>
            ))}

          {navItem("Profile", "/settings", "profile", "/icons/navigation/nav-profile-headset-transparent.png")}
        </div>

        <div className="ba-sidebar-devotion mt-auto">
          <div className="ba-sidebar-devotion-art" />
          <div className="relative z-10">
            <div className="text-[0.62rem] uppercase tracking-[0.24em] text-amber-100/70">
              {planType === "pro_plus" || planType === "family_pro_plus"
                ? "Pro+ Member"
                : "Faith Focus"}
            </div>
            <p className="mt-3 text-[0.86rem] font-semibold text-[#f5e8cf]">
              Grow in faith. Compete with purpose.
            </p>
            <p className="mt-2 text-[0.72rem] leading-5 text-white/44">
              Keep showing up. Strength is built one faithful day at a time.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-white/8 pt-3">
        <button
          onClick={() => {
            closeMobile?.()
            router.push("/settings")
          }}
          className={`ba-sidebar-nav-item w-full text-left ${profileActive ? "is-active" : ""}`}
        >
          <span className={`ba-sidebar-nav-icon ${profileActive ? "is-active" : ""}`}>
            {renderNavIcon("settings", "h-[1rem] w-[1rem]")}
          </span>
          <span className="text-[0.84rem] font-medium">Settings</span>
        </button>
      </div>
    </div>
  )
}
