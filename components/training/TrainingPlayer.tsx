"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import {
  getTrainingBookSlugFromSegmentKey,
  isTrainingBookSlug,
} from "@/lib/training/bibleStructure"
import type {
  TrainingAccessTier,
  TrainingDay,
  TrainingImageChoiceOption,
  TrainingItem,
  TrainingMatchingPair,
} from "@/lib/training/types"

type TrainingPlayerProps = {
  day: TrainingDay
  items: TrainingItem[]
  accessTier: TrainingAccessTier
  signedIn: boolean
}

function formatLabel(format: TrainingItem["format"]) {
  switch (format) {
    case "multiple_choice":
      return "Multiple Choice"
    case "fill_blank":
      return "Fill Blank"
    case "image_choice":
      return "Image Choice"
    case "ordering":
      return "Ordering"
    case "matching":
      return "Matching"
    case "true_false":
      return "True / False"
    case "spot_error":
      return "Spot Error"
    default:
      return format
  }
}

function difficultyClass(difficulty: TrainingItem["difficulty"]) {
  switch (difficulty) {
    case "easy":
      return "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
    case "medium":
      return "border-amber-300/35 bg-amber-300/12 text-amber-100"
    case "hard":
      return "border-rose-300/35 bg-rose-300/12 text-rose-100"
    default:
      return "border-white/15 bg-white/10 text-slate-100"
  }
}

function statusTitle(wasCorrect: boolean) {
  return wasCorrect ? "Nice work" : "Good rep — review this"
}

function statusEyebrow(wasCorrect: boolean) {
  return wasCorrect ? "Training rep complete" : "Review this detail"
}

function statusIcon(wasCorrect: boolean) {
  return wasCorrect ? "✦" : "◌"
}

function getAccessDepthLabel(accessTier: TrainingAccessTier) {
  if (accessTier === "pro_plus") return "Full Depth"
  if (accessTier === "pro") return "Core Access"
  return "Free Preview"
}

function getChoiceLetter(index: number) {
  return String.fromCharCode(65 + index)
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, "0")}`
}

function getFocusRank(percentage: number) {
  if (percentage === 100) {
    return {
      label: "Perfect Focus",
      summary: "Flawless session. Every rep locked in.",
      ringClass: "text-emerald-300",
      glowClass: "shadow-[0_0_40px_rgba(52,211,153,0.14)]",
      badgeClass: "border-emerald-300/35 bg-emerald-300/14 text-emerald-100",
      icon: "✦",
    }
  }

  if (percentage >= 90) {
    return {
      label: "Gold Focus",
      summary: "Strong session. Your recall is sharp.",
      ringClass: "text-amber-300",
      glowClass: "shadow-[0_0_40px_rgba(251,191,36,0.14)]",
      badgeClass: "border-amber-300/35 bg-amber-300/14 text-amber-100",
      icon: "◈",
    }
  }

  if (percentage >= 75) {
    return {
      label: "Silver Focus",
      summary: "Good work. A few details are ready for review.",
      ringClass: "text-slate-200",
      glowClass: "shadow-[0_0_38px_rgba(226,232,240,0.10)]",
      badgeClass: "border-slate-200/25 bg-slate-200/10 text-slate-100",
      icon: "◇",
    }
  }

  if (percentage >= 50) {
    return {
      label: "Bronze Focus",
      summary: "Solid effort. Keep building recall.",
      ringClass: "text-amber-500",
      glowClass: "shadow-[0_0_34px_rgba(245,158,11,0.12)]",
      badgeClass: "border-amber-500/30 bg-amber-500/12 text-amber-100",
      icon: "⬢",
    }
  }

  return {
    label: "Review Needed",
    summary: "Good start. Review the passage and run the drill again.",
    ringClass: "text-rose-300",
    glowClass: "shadow-[0_0_34px_rgba(251,113,133,0.12)]",
    badgeClass: "border-rose-300/30 bg-rose-300/12 text-rose-100",
    icon: "◌",
  }
}

function imageCardBadge({
  selected,
  submitted,
  isCorrect,
}: {
  selected: boolean
  submitted: boolean
  isCorrect: boolean
}) {
  if (submitted) {
    if (isCorrect) return "Correct"
    if (selected) return "Review"
    return null
  }

  return selected ? "Selected" : "Tap to choose"
}

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false

  return left.every((value, index) => value === right[index])
}

function SequencePreview({
  values,
  tone,
}: {
  values: string[]
  tone: "neutral" | "correct" | "review"
}) {
  const toneClass =
    tone === "correct"
      ? "border-emerald-300/28 bg-emerald-300/10 text-emerald-50"
      : tone === "review"
        ? "border-amber-300/28 bg-amber-300/10 text-amber-50"
        : "border-white/10 bg-white/[0.03] text-slate-100"

  return (
    <div className="grid gap-2.5">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className={`flex items-start gap-3 rounded-[1.05rem] border px-3 py-3 ${toneClass}`}
        >
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/35 bg-amber-300/12 text-xs font-black uppercase tracking-[0.18em] text-amber-100">
            {index + 1}
          </div>
          <div className="min-w-0 text-sm font-semibold leading-6">{value}</div>
        </div>
      ))}
    </div>
  )
}

function ImageChoiceCard({
  option,
  selected,
  submitted,
  isCorrect,
  disabled,
  onSelect,
}: {
  option: TrainingImageChoiceOption
  selected: boolean
  submitted: boolean
  isCorrect: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const [failed, setFailed] = useState(false)
  const badge = imageCardBadge({ selected, submitted, isCorrect })

  const stateClass = submitted
    ? isCorrect
      ? "border-emerald-300/60 bg-emerald-300/14 shadow-[0_0_28px_rgba(52,211,153,0.16)]"
      : selected
        ? "border-rose-300/50 bg-rose-300/12 shadow-[0_0_24px_rgba(251,113,133,0.10)]"
        : "border-white/10 bg-white/[0.03] opacity-65 saturate-75"
    : selected
      ? "border-cyan-300/60 bg-cyan-300/12 shadow-[0_0_28px_rgba(34,211,238,0.12)] -translate-y-0.5 scale-[1.01]"
      : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`group overflow-hidden rounded-[1.35rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 motion-reduce:transform-none ${stateClass} ${
        disabled ? "cursor-default" : ""
      }`}
    >
      <div className="relative overflow-hidden">
        {failed ? (
          <div className="flex h-32 items-center justify-center bg-[linear-gradient(180deg,rgba(20,25,38,0.98),rgba(10,13,22,0.98))] px-4 text-center text-sm font-medium text-slate-300 sm:h-40 lg:h-48 xl:h-52">
            Image unavailable
          </div>
        ) : (
          <img
            src={option.image_url}
            alt={option.alt}
            className={`h-32 w-full object-cover transition duration-300 sm:h-40 lg:h-48 xl:h-52 ${
              selected && !submitted ? "scale-[1.04]" : "group-hover:scale-[1.03]"
            }`}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.02),rgba(4,8,16,0.14)_46%,rgba(4,8,16,0.62)_100%)]" />
        {badge ? (
          <div className="absolute left-3 top-3 rounded-full border border-black/10 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {badge}
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(180deg,transparent,rgba(4,8,16,0.72))]" />
      </div>

      <div className="space-y-1.5 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-5 text-white">{option.label}</p>
        </div>
        <p className="hidden text-[11px] leading-4 text-slate-400 md:block">
          {option.alt}
        </p>
      </div>
    </button>
  )
}

function EmptyState({
  day,
  accessTier,
  signedIn,
}: {
  day: TrainingDay
  accessTier: TrainingAccessTier
  signedIn: boolean
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#25375f_0%,_#101728_32%,_#070b14_100%)] px-3 py-4 text-white sm:px-5 sm:py-6">
      <div className="mx-auto max-w-2xl rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(8,12,20,0.98))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-200/78">
          Training Arena
        </div>
        <h1 className="mt-4 text-3xl font-black text-white">No Drill Available</h1>
        <p className="mt-3 text-base leading-7 text-slate-300">
          Day {day.day} is available, but there are no items in this pack that match your current Training access rules yet.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Current access: {accessTier === "pro_plus" ? "Pro+" : accessTier === "pro" ? "Pro" : "Free"}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/training"
            className="rounded-full bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#2c1600] shadow-[0_12px_30px_rgba(251,191,36,0.16)] transition hover:scale-[1.01]"
          >
            Back to Training
          </Link>
          {!signedIn ? (
            <Link
              href="/login"
              className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/14"
            >
              Sign In
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/14"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}

export default function TrainingPlayer({
  day,
  items,
  accessTier,
  signedIn,
}: TrainingPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const item = items[currentIndex]
  const total = items.length
  const isComplete = currentIndex >= total

  const percent = useMemo(() => {
    if (total === 0) return 0
    return Math.round(((currentIndex + 1) / total) * 100)
  }, [currentIndex, total])

  useEffect(() => {
    if (isComplete) return

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isComplete])

  if (total === 0) {
    return <EmptyState day={day} accessTier={accessTier} signedIn={signedIn} />
  }

  function resetQuestionState() {
    setSelectedSingle(null)
    setSelectedOrder([])
    setMatchingSelections({})
    setSubmitted(false)
    setWasCorrect(false)
    setSubmissionError(null)
  }

  function handleOrderPick(value: string) {
    if (submitted || selectedOrder.includes(value)) return
    setSelectedOrder((current) => [...current, value])
    setSubmissionError(null)
  }

  function handleMatchingChange(left: string, right: string) {
    if (submitted) return
    setMatchingSelections((current) => ({
      ...current,
      [left]: right,
    }))
    setSubmissionError(null)
  }

  function evaluateCurrentItem() {
    switch (item.format) {
      case "multiple_choice":
      case "fill_blank":
      case "image_choice":
      case "spot_error":
        if (!selectedSingle) {
          return { ready: false, correct: false }
        }
        return {
          ready: true,
          correct: selectedSingle === item.correct_answer.value,
        }
      case "true_false":
        if (!selectedSingle) {
          return { ready: false, correct: false }
        }
        return {
          ready: true,
          correct:
            (selectedSingle === "true") === Boolean(item.correct_answer.value),
        }
      case "ordering":
        if (selectedOrder.length !== item.correct_answer.value.length) {
          return { ready: false, correct: false }
        }
        return {
          ready: true,
          correct: arraysEqual(selectedOrder, item.correct_answer.value),
        }
      case "matching": {
        const pairs = item.correct_answer.value as TrainingMatchingPair[]
        const ready = pairs.every((pair) => matchingSelections[pair.left])

        if (!ready) {
          return { ready: false, correct: false }
        }

        const correct = pairs.every(
          (pair) => matchingSelections[pair.left] === pair.right
        )

        return { ready: true, correct }
      }
      default:
        return { ready: false, correct: false }
    }
  }

  function handleSubmit() {
    const result = evaluateCurrentItem()

    if (!result.ready) {
      setSubmissionError("Choose your answer before submitting.")
      return
    }

    setSubmitted(true)
    setWasCorrect(result.correct)
    setSubmissionError(null)

    if (result.correct) {
      setScore((current) => current + 1)
    }
  }

  function handleContinue() {
    if (currentIndex === total - 1) {
      setCurrentIndex(total)
      return
    }

    setCurrentIndex((current) => current + 1)
    resetQuestionState()
  }

  function handleTrainAgain() {
    setCurrentIndex(0)
    setScore(0)
    setElapsedSeconds(0)
    resetQuestionState()
  }

  function renderChoiceButtons(options: string[]) {
    return (
      <div className="grid gap-3">
        {options.map((option, index) => {
          const active = selectedSingle === option
          const isCorrect = submitted && option === item.correct_answer.value
          const isWrongSelected = submitted && active && !isCorrect
          const stateClass = submitted
            ? isCorrect
              ? "border-emerald-300/60 bg-emerald-300/14 text-emerald-50 shadow-[0_0_28px_rgba(52,211,153,0.16)]"
              : isWrongSelected
                ? "border-rose-300/50 bg-rose-300/12 text-rose-50 shadow-[0_0_22px_rgba(251,113,133,0.08)]"
                : "border-white/10 bg-white/[0.03] text-slate-200 opacity-75"
            : active
              ? "border-cyan-300/60 bg-cyan-300/12 text-white shadow-[0_0_24px_rgba(34,211,238,0.10)] -translate-y-0.5 scale-[1.01]"
              : "border-white/10 bg-white/[0.03] text-slate-100 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"

          return (
            <button
              key={option}
              type="button"
              disabled={submitted}
              onClick={() => {
                setSelectedSingle(option)
                setSubmissionError(null)
              }}
              className={`rounded-[1.15rem] border px-4 py-3.5 text-left text-sm leading-6 transition duration-200 motion-reduce:transform-none sm:py-4 ${stateClass} ${
                submitted ? "cursor-default" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="ba-training-answer-badge">
                  {getChoiceLetter(index)}
                </div>
                <div className="min-w-0 flex-1 font-semibold leading-6">
                  {option}
                </div>
                <div
                  className={`ba-training-answer-indicator ${
                    active
                      ? submitted
                        ? isCorrect
                          ? "is-correct"
                          : "is-incorrect"
                        : "is-active"
                      : ""
                  }`}
                  aria-hidden="true"
                >
                  {active ? "✓" : ""}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  function renderItem() {
    switch (item.format) {
      case "multiple_choice":
        return renderChoiceButtons(item.content.options as string[])
      case "fill_blank":
        return (
          <div className="space-y-4">
            <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4 text-base leading-7 text-slate-100">
              {item.content.text}
            </div>
            {renderChoiceButtons(item.content.options as string[])}
          </div>
        )
      case "image_choice":
        return (
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
            {(item.content.options as TrainingImageChoiceOption[]).map((option) => (
              <ImageChoiceCard
                key={option.image_url}
                option={option}
                selected={selectedSingle === option.label}
                submitted={submitted}
                isCorrect={option.label === item.correct_answer.value}
                disabled={submitted}
                onSelect={() => {
                  setSelectedSingle(option.label)
                  setSubmissionError(null)
                }}
              />
            ))}
          </div>
        )
      case "ordering": {
        const allItems = item.content.items as string[]
        const remaining = allItems.filter((entry) => !selectedOrder.includes(entry))

        return (
          <div className="space-y-5">
            <div className="rounded-[1.2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.03))] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/88">
                Sequence Drill
              </div>
              <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
                {item.content.instruction}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Build The Sequence
                </div>
                <button
                  type="button"
                  disabled={submitted || selectedOrder.length === 0}
                  onClick={() => {
                    setSelectedOrder([])
                    setSubmissionError(null)
                  }}
                  className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/14 disabled:opacity-50"
                >
                  Reset sequence
                </button>
              </div>
              <div className="mt-3 grid gap-2.5">
                {allItems.map((_, index) => {
                  const value = selectedOrder[index]

                  return (
                    <div
                      key={`slot-${index}`}
                      className={`flex items-start gap-3 rounded-[1.15rem] border px-3 py-3.5 transition duration-200 ${
                        value
                          ? "border-cyan-300/28 bg-cyan-300/10 shadow-[0_0_22px_rgba(34,211,238,0.08)]"
                          : "border-dashed border-white/12 bg-black/15"
                      }`}
                    >
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/35 bg-amber-300/12 text-xs font-black uppercase tracking-[0.18em] text-amber-100">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Step {index + 1}
                        </div>
                        <div className={`mt-1 text-sm font-semibold leading-6 ${value ? "text-white" : "text-slate-500"}`}>
                          {value ?? "Choose the next event"}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Available Events
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {remaining.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleOrderPick(entry)}
                    className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold leading-6 text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white motion-reduce:transform-none"
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      }
      case "matching": {
        const pairs = item.correct_answer.value as TrainingMatchingPair[]
        const rightItems = item.content.right_items as string[]

        return (
          <div className="space-y-5">
            <div className="rounded-[1.2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.03))] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/88">
                Connection Drill
              </div>
              <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
                {item.content.instruction}
              </div>
            </div>
            <div className="space-y-4">
              {pairs.map((pair) => {
                const selectedRight = matchingSelections[pair.left] || ""
                const hasSelection = Boolean(selectedRight)

                return (
                  <div
                    key={pair.left}
                    className={`rounded-[1.2rem] border p-4 transition duration-200 ${
                      hasSelection
                        ? "border-cyan-300/28 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
                      <div className="rounded-[1rem] border border-white/10 bg-black/15 px-3 py-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Match this item
                        </div>
                        <div className="mt-1 text-sm font-semibold leading-6 text-white">{pair.left}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Choose the connection
                        </div>
                        <select
                          disabled={submitted}
                          value={selectedRight}
                          onChange={(event) =>
                            handleMatchingChange(pair.left, event.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d1524] px-3 py-3 text-sm text-white outline-none transition duration-200 focus:-translate-y-0.5 focus:border-cyan-300/50 focus:bg-[#101a2d] motion-reduce:transform-none"
                        >
                          <option value="">Select a match</option>
                          {rightItems.map((entry) => (
                            <option key={entry} value={entry}>
                              {entry}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
      case "true_false":
        return (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ].map((option) => {
              const active = selectedSingle === option.value
              const isCorrect =
                submitted &&
                Boolean(item.correct_answer.value) === (option.value === "true")
              const isWrongSelected = submitted && active && !isCorrect
              const stateClass = submitted
                ? isCorrect
                  ? "border-emerald-300/60 bg-emerald-300/14 text-emerald-50 shadow-[0_0_28px_rgba(52,211,153,0.16)]"
                  : isWrongSelected
                    ? "border-rose-300/50 bg-rose-300/12 text-rose-50 shadow-[0_0_22px_rgba(251,113,133,0.08)]"
                    : "border-white/10 bg-white/[0.03] text-slate-200 opacity-75"
                : active
                  ? "border-cyan-300/60 bg-cyan-300/12 text-white shadow-[0_0_24px_rgba(34,211,238,0.10)] -translate-y-0.5 scale-[1.01]"
                  : "border-white/10 bg-white/[0.03] text-slate-100 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={submitted}
                  onClick={() => {
                    setSelectedSingle(option.value)
                    setSubmissionError(null)
                  }}
                  className={`rounded-[1.25rem] border px-4 py-4 text-left transition duration-200 motion-reduce:transform-none sm:py-5 ${stateClass} ${
                    submitted ? "cursor-default" : ""
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Fast decision
                  </div>
                  <div className="mt-2 text-xl font-black text-white sm:text-2xl">
                    {option.label}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    Lock in your call.
                  </div>
                </button>
              )
            })}
          </div>
        )
      case "spot_error":
        return (
          <div className="space-y-4">
            <div className="rounded-[1.2rem] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(255,255,255,0.03))] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/88">
                Correction Drill
              </div>
              <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
                Spot the weak detail
              </div>
            </div>
            <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4 text-base leading-7 text-slate-100">
              {item.content.statement}
            </div>
            <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
              {item.content.instruction}
            </div>
            <div className="grid gap-3">
              {(item.content.options as string[]).map((option) => {
                const active = selectedSingle === option
                const isCorrect = submitted && option === item.correct_answer.value
                const isWrongSelected = submitted && active && !isCorrect
                const stateClass = submitted
                  ? isCorrect
                    ? "border-emerald-300/60 bg-emerald-300/14 text-emerald-50 shadow-[0_0_28px_rgba(52,211,153,0.16)]"
                    : isWrongSelected
                      ? "border-rose-300/50 bg-rose-300/12 text-rose-50 shadow-[0_0_22px_rgba(251,113,133,0.08)]"
                      : "border-white/10 bg-white/[0.03] text-slate-200 opacity-75"
                  : active
                    ? "border-cyan-300/60 bg-cyan-300/12 text-white shadow-[0_0_24px_rgba(34,211,238,0.10)] -translate-y-0.5 scale-[1.01]"
                    : "border-white/10 bg-white/[0.03] text-slate-100 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      setSelectedSingle(option)
                      setSubmissionError(null)
                    }}
                    className={`rounded-[1.15rem] border px-4 py-3.5 text-left transition duration-200 motion-reduce:transform-none sm:py-4 ${stateClass} ${
                      submitted ? "cursor-default" : ""
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Correction option
                    </div>
                    <div className="mt-2 text-sm font-semibold leading-6">{option}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  function getDisplaySelection() {
    if (item.format === "true_false") {
      return selectedSingle === "true"
        ? "True"
        : selectedSingle === "false"
          ? "False"
          : null
    }

    return selectedSingle
  }

  function getCorrectAnswerSummary() {
    if (item.format === "true_false") {
      return item.correct_answer.value ? "True" : "False"
    }

    if (item.format === "ordering") {
      return (item.correct_answer.value as string[]).join(" → ")
    }

    if (item.format === "matching") {
      return (item.correct_answer.value as TrainingMatchingPair[])
        .map((pair) => `${pair.left} → ${pair.right}`)
        .join(" • ")
    }

    return String(item.correct_answer.value)
  }

  function getUserAnswerSummary() {
    if (item.format === "ordering") {
      return selectedOrder.length > 0 ? selectedOrder.join(" → ") : "No answer selected"
    }

    if (item.format === "matching") {
      const pairs = item.content.left_items as string[]
      const selectedPairs = pairs
        .filter((left) => matchingSelections[left])
        .map((left) => `${left} → ${matchingSelections[left]}`)

      return selectedPairs.length > 0
        ? selectedPairs.join(" • ")
        : "No answer selected"
    }

    return getDisplaySelection() ?? "No answer selected"
  }

  function getImageOptionByLabel(label: string | null) {
    if (item.format !== "image_choice" || !label) return null

    const options = item.content.options as TrainingImageChoiceOption[]
    return options.find((option) => option.label === label) ?? null
  }

  const bookSlug = getTrainingBookSlugFromSegmentKey(day.segment_key)
  const campaignHref = isTrainingBookSlug(bookSlug)
    ? `/training/book/${bookSlug}`
    : "/training"
  const accessLabel = getAccessDepthLabel(accessTier)
  const answeredCount = Math.min(total, currentIndex + (submitted ? 1 : 0))
  const accuracy = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0
  const questionLabel = `Question ${Math.min(currentIndex + 1, total)} of ${total}`
  const dayLabel = `Day ${day.day} Mission`
  const elapsedLabel = formatElapsed(elapsedSeconds)

  if (isComplete) {
    const percentage = Math.round((score / total) * 100)
    const focusRank = getFocusRank(percentage)
    const ringSize = 160
    const strokeWidth = 12
    const radius = (ringSize - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (percentage / 100) * circumference

    return (
      <main className="ba-training-player-shell min-h-screen overflow-x-hidden px-3 py-3 text-white sm:px-5 sm:py-5">
        <div className="mx-auto max-w-5xl">
          <div className="ba-training-player-stage overflow-hidden rounded-[2rem] p-5 sm:p-7">
            <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/84">
              Mission Complete
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
            Training Complete
            </h1>
            <p className="mt-2 text-base font-semibold text-amber-100/84 sm:text-lg">
              {day.reading.reference} · Day {day.day} Mission
            </p>

            <div className="mt-6 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
              <div className={`ba-training-session-panel mx-auto flex w-full max-w-[240px] items-center justify-center p-4 ${focusRank.glowClass}`}>
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <svg
                    viewBox={`0 0 ${ringSize} ${ringSize}`}
                    className="h-40 w-40 -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      stroke="currentColor"
                      strokeWidth={strokeWidth}
                      className="text-white/10"
                      fill="none"
                    />
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      stroke="currentColor"
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className={`${focusRank.ringClass} motion-safe:transition-all motion-safe:duration-700`}
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-lg ${focusRank.badgeClass}`}>
                      {focusRank.icon}
                    </div>
                    <div className="mt-2 text-3xl font-black text-white">{percentage}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Accuracy
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${focusRank.badgeClass}`}>
                  {focusRank.label}
                </div>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-200">
                  {focusRank.summary}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="ba-training-session-panel p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      Score
                    </div>
                    <div className="mt-2 text-3xl font-black text-white">
                      {score} / {total}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">correct</div>
                  </div>
                  <div className="ba-training-session-panel p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      Accuracy
                    </div>
                    <div className="mt-2 text-3xl font-black text-white">
                      {percentage}%
                    </div>
                    <div className="mt-1 text-sm text-slate-400">session rate</div>
                  </div>
                  <div className="ba-training-session-panel p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      Access
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {accessLabel}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">active for this session</div>
                  </div>
                </div>
              </div>
            </div>

            {accessTier === "free" ? (
              <div className="mt-6 rounded-[1.35rem] border border-amber-300/18 bg-amber-300/10 p-4">
                <p className="text-base leading-7 text-slate-100">
                  You completed today’s free Training Arena drill.
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-100/84">
                  Free preview includes the first 3 Training Days. Upgrade to continue with full drills and mastery.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-base leading-7 text-slate-300">
                Mission complete. Completion persistence is not stored yet, so this screen reports live session results only.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleTrainAgain}
                className="ba-training-secondary-cta px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Train Again
              </button>
              <Link
                href={campaignHref}
                className="ba-training-primary-cta px-5 py-3 text-center text-sm font-black text-[#2c1600]"
              >
                Back to Campaign
              </Link>
              <Link
                href="/training"
                className="ba-training-secondary-cta px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Return to Training Arena
              </Link>
              {(accessTier === "free" || !signedIn) && (
                <Link
                  href={signedIn ? "/pricing" : "/login"}
                  className="rounded-full border border-cyan-300/24 bg-cyan-300/10 px-5 py-3 text-center text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/14"
                >
                  {signedIn ? "Upgrade" : "Sign In"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="ba-training-player-shell min-h-screen overflow-x-hidden px-3 py-3 text-white sm:px-5 sm:py-5">
      <div className="mx-auto max-w-[1180px]">
        <div className="ba-training-player-stage p-4 sm:p-6 lg:p-7">
          <header className="ba-training-player-header">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <Link
                href={campaignHref}
                className="ba-training-secondary-cta inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-white"
              >
                Exit Mission
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/84">
                  Training Arena
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">
                  {questionLabel}
                </div>
                <div className="rounded-full border border-cyan-300/16 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-50">
                  {elapsedLabel}
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <h1 className="text-[1.65rem] font-black tracking-[-0.04em] text-white sm:text-[2rem]">
                {day.reading.reference}
              </h1>
              <p className="mt-0.5 text-xs font-semibold text-slate-300 sm:text-sm">
                {dayLabel}
              </p>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span>{questionLabel}</span>
                <span>{percent}% complete</span>
              </div>
              <div className="ba-training-player-progress mt-2 h-[5px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-amber-200 shadow-[0_0_28px_rgba(34,211,238,0.18)]"
                  style={{ width: `${percent}%` }}
                >
                  <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-60 blur-[1px] motion-safe:animate-pulse" />
                </div>
              </div>
            </div>
          </header>

          <section className="mt-4 grid gap-3 lg:grid-cols-[132px_minmax(0,1fr)_156px] lg:items-start xl:grid-cols-[148px_minmax(0,1fr)_176px]">
            <aside className="ba-training-focus-panel order-3 p-3 lg:order-1">
              <div className="ba-training-focus-emblem">
                ✦
              </div>
              <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100/74">
                Mission Focus
              </div>
              <div className="mt-1.5 text-lg font-black text-white">
                {answeredCount > 0 ? `${accuracy}%` : "Ready"}
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-300/82">
                Build accuracy through today&apos;s training. Focus rank is finalized after the session.
              </p>
              <div className="mt-3 rounded-[1rem] border border-white/10 bg-black/15 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Access
                </div>
                <div className="mt-1 text-xs font-semibold text-white">{accessLabel}</div>
              </div>
            </aside>

            <article
              key={item.key}
              className="ba-training-question-card order-1 p-3.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2 sm:p-4 lg:order-2 lg:p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-cyan-300/28 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">
                  {item.format === "image_choice" ? "Visual Recognition" : formatLabel(item.format)}
                </div>
                <div
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${difficultyClass(
                    item.difficulty
                  )}`}
                >
                  {item.difficulty}
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200">
                  {item.reference}
                </div>
              </div>

              <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                {questionLabel.toUpperCase()}
              </div>
              <h2 className="mt-2.5 text-[1.42rem] font-black leading-tight text-white sm:text-[1.68rem]">
                {item.prompt}
              </h2>

              <div className="mt-3">
                {submitted ? (
                  <div
                    className={`overflow-hidden rounded-[1.35rem] border p-4 shadow-[0_18px_44px_rgba(0,0,0,0.24)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 sm:p-5 ${
                      wasCorrect
                        ? "border-emerald-300/30 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.14),transparent_42%),linear-gradient(180deg,rgba(16,45,34,0.42),rgba(9,18,17,0.92))] shadow-[0_0_36px_rgba(52,211,153,0.10)]"
                        : "border-amber-300/28 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_42%),linear-gradient(180deg,rgba(54,33,18,0.42),rgba(18,12,10,0.94))] shadow-[0_0_34px_rgba(251,191,36,0.08)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                    <div
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg motion-safe:animate-pulse ${
                        wasCorrect
                          ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.14)]"
                          : "border-amber-300/35 bg-amber-300/12 text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.10)]"
                      }`}
                      aria-hidden="true"
                    >
                      {statusIcon(wasCorrect)}
                    </div>
                    <div className="min-w-0">
                        <div
                          className={`text-[11px] font-black uppercase tracking-[0.24em] ${
                            wasCorrect ? "text-emerald-200" : "text-amber-200"
                          }`}
                        >
                          {statusEyebrow(wasCorrect)}
                        </div>
                      <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
                        {wasCorrect ? "Nice work" : "Not quite"}
                      </h3>
                      <p
                        className={`mt-1 text-sm ${
                          wasCorrect ? "text-emerald-100/85" : "text-amber-100/85"
                        }`}
                      >
                        {wasCorrect
                          ? "Locked in. Carry that rhythm forward."
                          : "Small correction now, stronger recall on the next rep."}
                      </p>
                    </div>
                  </div>

                    <div className="mt-3 grid gap-2.5">
                      <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                          Your answer
                        </div>
                        {item.format === "image_choice" ? (
                          <div className="mt-2 flex items-center gap-3">
                            {getImageOptionByLabel(selectedSingle) ? (
                              <img
                                src={getImageOptionByLabel(selectedSingle)?.image_url}
                                alt={getImageOptionByLabel(selectedSingle)?.alt}
                                className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                              />
                            ) : null}
                            <p className="text-sm font-semibold leading-6 text-white">
                              {getUserAnswerSummary()}
                            </p>
                          </div>
                        ) : item.format === "ordering" ? (
                          <div className="mt-2">
                            <SequencePreview
                              values={selectedOrder}
                              tone={wasCorrect ? "correct" : "review"}
                            />
                          </div>
                        ) : item.format === "matching" ? (
                          <div className="mt-2 grid gap-2.5">
                            {(item.correct_answer.value as TrainingMatchingPair[]).map((pair) => {
                              const selectedRight = matchingSelections[pair.left]
                              const pairCorrect = selectedRight === pair.right

                              return (
                                <div
                                  key={`selected-${pair.left}`}
                                  className={`rounded-[1rem] border px-3 py-3 ${
                                    pairCorrect
                                      ? "border-emerald-300/28 bg-emerald-300/10 text-emerald-50"
                                      : "border-amber-300/28 bg-amber-300/10 text-amber-50"
                                  }`}
                                >
                                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    {pair.left}
                                  </div>
                                  <div className="mt-1 text-sm font-semibold">
                                    {selectedRight ?? "No answer selected"}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm font-semibold leading-6 text-white">
                            {getUserAnswerSummary()}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                          Correct answer
                        </div>
                        {item.format === "image_choice" ? (
                          <div className="mt-2 flex items-center gap-3">
                            {getImageOptionByLabel(String(item.correct_answer.value)) ? (
                              <img
                                src={getImageOptionByLabel(String(item.correct_answer.value))?.image_url}
                                alt={getImageOptionByLabel(String(item.correct_answer.value))?.alt}
                                className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                              />
                            ) : null}
                            <p className="text-sm font-semibold leading-6 text-white">
                              {getCorrectAnswerSummary()}
                            </p>
                          </div>
                        ) : item.format === "ordering" ? (
                          <div className="mt-2">
                            <SequencePreview
                              values={item.correct_answer.value as string[]}
                              tone="correct"
                            />
                          </div>
                        ) : item.format === "matching" ? (
                          <div className="mt-2 grid gap-2.5">
                            {(item.correct_answer.value as TrainingMatchingPair[]).map((pair) => (
                              <div
                                key={`correct-${pair.left}`}
                                className="rounded-[1rem] border border-emerald-300/28 bg-emerald-300/10 px-3 py-3 text-emerald-50"
                              >
                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100/72">
                                  {pair.left}
                                </div>
                                <div className="mt-1 text-sm font-semibold">{pair.right}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm font-semibold leading-6 text-white">
                            {getCorrectAnswerSummary()}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                          Explanation
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{item.explanation}</p>
                      </div>
                    </div>

                    <div className="ba-training-submit-wrap mt-3">
                      <button
                        type="button"
                        onClick={handleContinue}
                        className="ba-training-primary-cta inline-flex min-h-12 w-full items-center justify-center px-6 py-3 text-sm font-black text-[#2c1600] sm:w-auto"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ) : (
                  renderItem()
                )}
              </div>

              {!submitted && (
                <div className="ba-training-submit-wrap mt-3">
                  {submissionError && (
                    <div className="mb-3 rounded-[1.05rem] border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                      {submissionError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="ba-training-primary-cta min-h-12 w-full px-5 py-3 text-sm font-black text-[#2c1600]"
                  >
                    Submit Answer
                  </button>
                </div>
              )}
            </article>

            <aside className="ba-training-session-panel order-2 p-3 lg:order-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Mission Stats
              </div>
              <div className="mt-3 grid gap-2.5">
                <div className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-white/10 bg-black/15 px-3 py-2.5">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Correct</span>
                  <span className="text-lg font-black text-white">{score}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-white/10 bg-black/15 px-3 py-2.5">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Progress</span>
                  <span className="text-lg font-black text-white">{answeredCount}/{total}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-white/10 bg-black/15 px-3 py-2.5">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Accuracy</span>
                  <span className="text-lg font-black text-white">{accuracy}%</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-white/10 bg-black/15 px-3 py-2.5">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Timer</span>
                  <span className="text-lg font-black text-white">{elapsedLabel}</span>
                </div>
                <div className="rounded-[0.95rem] border border-white/10 bg-black/15 px-3 py-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Access Depth
                  </div>
                  <div className="mt-1 text-xs font-semibold text-white">{accessLabel}</div>
                </div>
              </div>
            </aside>
          </section>

          <div className="mt-4">
            <Link
              href={campaignHref}
              className="text-sm font-semibold text-amber-100/84 transition hover:text-white"
            >
              ← Back to Campaign
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
