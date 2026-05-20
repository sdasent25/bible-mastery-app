"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { renderNavIcon } from "@/lib/navigation"

type QuestHorizontalRailProps = {
  title: string
  ariaLabelBase: string
  desktopClassName: string
  children: ReactNode
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export default function QuestHorizontalRail({
  title,
  ariaLabelBase,
  desktopClassName,
  children,
}: QuestHorizontalRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    const updateScrollState = () => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth
      setCanScrollLeft(rail.scrollLeft > 8)
      setCanScrollRight(maxScrollLeft - rail.scrollLeft > 8)
    }

    updateScrollState()
    rail.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)

    return () => {
      rail.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [])

  const handleScroll = (direction: "left" | "right") => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    rail.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    })
  }

  return (
    <section className="space-y-2.5">
      <div className="ba-quest-section-head">
        <h2 className="ba-font-display text-[1.28rem] font-semibold tracking-[-0.03em] text-[#f6ecde] sm:text-[1.4rem]">
          {title}
        </h2>

        <div className="ba-quests-carousel-controls md:hidden">
          <button
            type="button"
            aria-label={`Scroll ${ariaLabelBase} left`}
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="ba-quests-carousel-arrow"
          >
            {renderNavIcon("chevron-right", "h-3.5 w-3.5 rotate-180")}
          </button>
          <button
            type="button"
            aria-label={`Scroll ${ariaLabelBase} right`}
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="ba-quests-carousel-arrow"
          >
            {renderNavIcon("chevron-right", "h-3.5 w-3.5")}
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className={cn(
          "ba-quests-carousel ba-scrollbar-hidden -mx-4 flex gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:px-0",
          desktopClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}
