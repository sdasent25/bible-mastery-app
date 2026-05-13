"use client"

import Link from "next/link"
import type { ReactNode } from "react"

type Tone = "default" | "ready" | "practice" | "locked"

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export function BooksQuestPageShell({
  children,
  maxWidth = "max-w-3xl",
}: {
  children: ReactNode
  maxWidth?: string
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.14),transparent_28%),radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_46%),linear-gradient(180deg,#07101a_0%,#090d16_42%,#04070f_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute left-[-4rem] top-24 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-40 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />
      <div className={cn("relative mx-auto flex w-full flex-col gap-6", maxWidth)}>
        {children}
      </div>
    </div>
  )
}

export function BooksQuestPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={cn("ba-card rounded-[1.9rem] p-5 sm:p-6", className)}>{children}</section>
}

export function BooksQuestHero({
  eyebrow,
  title,
  subtitle,
  actions,
  stats,
}: {
  eyebrow: string
  title: string
  subtitle: string
  actions?: ReactNode
  stats?: ReactNode
}) {
  return (
    <BooksQuestPanel className="rounded-[2rem]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="ba-badge-gold">{eyebrow}</div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-lg sm:leading-8">
            {subtitle}
          </p>
        </div>
        {actions ? <div className="w-full lg:w-auto">{actions}</div> : null}
      </div>
      {stats ? <div className="mt-6">{stats}</div> : null}
    </BooksQuestPanel>
  )
}

export function BooksQuestTopBar({
  backHref,
  meta,
}: {
  backHref: string
  meta?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <Link
        href={backHref}
        className="ba-button-secondary px-4 py-2.5 text-sm font-semibold"
      >
        Back to Books
      </Link>
      {meta ? <div className="text-sm font-medium text-slate-300">{meta}</div> : null}
    </div>
  )
}

export function BooksQuestStatusBadge({
  tone = "default",
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  const toneClass =
    tone === "ready"
      ? "ba-badge-success"
      : tone === "practice"
        ? "ba-badge-gold"
        : tone === "locked"
          ? "ba-badge-locked"
          : "ba-badge"

  return <span className={cn(toneClass, className)}>{children}</span>
}
