"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

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

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false

  return left.every((value, index) => value === right[index])
}

function ImageChoiceCard({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: TrainingImageChoiceOption
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const [failed, setFailed] = useState(false)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`overflow-hidden rounded-[1.35rem] border text-left transition ${
        selected
          ? "border-cyan-300/60 bg-cyan-300/12 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      } ${disabled ? "cursor-default" : ""}`}
    >
      {failed ? (
        <div className="flex aspect-square items-center justify-center bg-[linear-gradient(180deg,rgba(20,25,38,0.98),rgba(10,13,22,0.98))] px-4 text-center text-sm font-medium text-slate-300">
          Image unavailable
        </div>
      ) : (
        <img
          src={option.image_url}
          alt={option.alt}
          className="aspect-square w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <div className="p-4">
        <p className="text-sm font-semibold text-white">{option.label}</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">{option.alt}</p>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#25375f_0%,_#101728_32%,_#070b14_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(8,12,20,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
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
            className="rounded-full bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#2c1600] transition hover:scale-[1.01]"
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

  const item = items[currentIndex]
  const total = items.length
  const isComplete = currentIndex >= total

  const percent = useMemo(() => {
    if (total === 0) return 0
    return Math.round(((currentIndex + 1) / total) * 100)
  }, [currentIndex, total])

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

  function renderChoiceButtons(options: string[]) {
    return (
      <div className="grid gap-3">
        {options.map((option) => {
          const active = selectedSingle === option

          return (
            <button
              key={option}
              type="button"
              disabled={submitted}
              onClick={() => {
                setSelectedSingle(option)
                setSubmissionError(null)
              }}
              className={`rounded-[1.2rem] border px-4 py-4 text-left text-sm leading-6 transition ${
                active
                  ? "border-cyan-300/60 bg-cyan-300/12 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-100 hover:border-white/20 hover:bg-white/[0.06]"
              } ${submitted ? "cursor-default" : ""}`}
            >
              {option}
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
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-base leading-7 text-slate-100">
              {item.content.text}
            </div>
            {renderChoiceButtons(item.content.options as string[])}
          </div>
        )
      case "image_choice":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {(item.content.options as TrainingImageChoiceOption[]).map((option) => (
              <ImageChoiceCard
                key={option.image_url}
                option={option}
                selected={selectedSingle === option.label}
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
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
              {item.content.instruction}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Your Order
              </div>
              <div className="mt-3 flex min-h-[4.5rem] flex-wrap gap-2 rounded-[1.2rem] border border-dashed border-white/12 bg-black/15 p-3">
                {selectedOrder.length > 0 ? (
                  selectedOrder.map((entry, index) => (
                    <div
                      key={`${entry}-${index}`}
                      className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-3 py-2 text-sm font-semibold text-cyan-50"
                    >
                      {index + 1}. {entry}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">
                    Tap the items below in the order they appear.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Tap To Build
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {remaining.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleOrderPick(entry)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={submitted || selectedOrder.length === 0}
              onClick={() => {
                setSelectedOrder([])
                setSubmissionError(null)
              }}
              className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        )
      }
      case "matching": {
        const pairs = item.correct_answer.value as TrainingMatchingPair[]
        const rightItems = item.content.right_items as string[]

        return (
          <div className="space-y-5">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
              {item.content.instruction}
            </div>
            <div className="space-y-4">
              {pairs.map((pair) => (
                <div
                  key={pair.left}
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="text-sm font-semibold text-white">{pair.left}</div>
                  <select
                    disabled={submitted}
                    value={matchingSelections[pair.left] || ""}
                    onChange={(event) =>
                      handleMatchingChange(pair.left, event.target.value)
                    }
                    className="mt-3 w-full rounded-xl border border-white/10 bg-[#0d1524] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
                  >
                    <option value="">Select a match</option>
                    {rightItems.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )
      }
      case "true_false":
        return (
          <div className="grid gap-3">
            {[
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ].map((option) => {
              const active = selectedSingle === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={submitted}
                  onClick={() => {
                    setSelectedSingle(option.value)
                    setSubmissionError(null)
                  }}
                  className={`rounded-[1.2rem] border px-4 py-4 text-left text-sm leading-6 transition ${
                    active
                      ? "border-cyan-300/60 bg-cyan-300/12 text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-100 hover:border-white/20 hover:bg-white/[0.06]"
                  } ${submitted ? "cursor-default" : ""}`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )
      case "spot_error":
        return (
          <div className="space-y-4">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-base leading-7 text-slate-100">
              {item.content.statement}
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
              {item.content.instruction}
            </div>
            {renderChoiceButtons(item.content.options as string[])}
          </div>
        )
      default:
        return null
    }
  }

  function getDisplaySelection() {
    if (item.format === "true_false") {
      return selectedSingle === "True" || selectedSingle === "False"
        ? selectedSingle
        : selectedSingle === "true"
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

  if (isComplete) {
    const percentage = Math.round((score / total) * 100)

    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#25375f_0%,_#101728_32%,_#070b14_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(8,12,20,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-8">
          <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-100/84">
            Training Arena
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white">
            Training Complete
          </h1>
          <p className="mt-3 text-lg font-semibold text-amber-100/84">
            Day {day.day} · {day.reading.reference}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Score
              </div>
              <div className="mt-2 text-3xl font-black text-white">
                {score}/{total}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Accuracy
              </div>
              <div className="mt-2 text-3xl font-black text-white">
                {percentage}%
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Access
              </div>
              <div className="mt-2 text-3xl font-black text-white">
                {accessTier === "pro_plus" ? "Pro+" : accessTier === "pro" ? "Pro" : "Free"}
              </div>
            </div>
          </div>

          {accessTier === "free" ? (
            <p className="mt-6 text-base leading-7 text-slate-300">
              You completed today’s free Training Arena drill. Upgrade to unlock deeper drills, more formats, and full Bible mastery.
            </p>
          ) : (
            <p className="mt-6 text-base leading-7 text-slate-300">
              You completed this Training Arena day. More progression, XP, and mastery tracking can plug into this route in the next pass.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/training"
              className="rounded-full bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#2c1600] transition hover:scale-[1.01]"
            >
              Continue Training
            </Link>
            <Link
              href="/training"
              className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/14"
            >
              Back to Training
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
      </main>
    )
  }

  const selectedDisplay = getDisplaySelection()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#25375f_0%,_#101728_32%,_#070b14_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(8,12,20,0.98))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-100/84">
              Training Arena
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-200">
              Question {currentIndex + 1} of {total}
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
            Day {day.day} · {day.reading.reference}
          </h1>

          <div className="mt-5 h-[6px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-100 via-yellow-200 to-orange-300 shadow-[0_0_28px_rgba(251,191,36,0.18)]"
              style={{ width: `${percent}%` }}
            />
          </div>

          <article className="mt-6 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-cyan-300/28 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100">
                {formatLabel(item.format)}
              </div>
              <div
                className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${difficultyClass(
                  item.difficulty
                )}`}
              >
                {item.difficulty}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-200">
                {item.reference}
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-black leading-tight text-white">
              {item.prompt}
            </h2>

            <div className="mt-5">{renderItem()}</div>

            {submissionError && !submitted && (
              <div className="mt-5 rounded-[1.15rem] border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                {submissionError}
              </div>
            )}

            {submitted && (
              <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-black/18 p-4">
                <div
                  className={`text-sm font-black uppercase tracking-[0.24em] ${
                    wasCorrect ? "text-emerald-200" : "text-amber-200"
                  }`}
                >
                  {wasCorrect ? "Correct" : "Not quite"}
                </div>
                {selectedDisplay && item.format !== "ordering" && item.format !== "matching" && (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Your answer: <span className="font-semibold text-white">{selectedDisplay}</span>
                  </p>
                )}
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Correct answer: <span className="font-semibold text-white">{getCorrectAnswerSummary()}</span>
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-200">{item.explanation}</p>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-[#2c1600] transition hover:scale-[1.01]"
                >
                  Continue
                </button>
              </div>
            )}

            {!submitted && (
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-6 rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-[#2c1600] transition hover:scale-[1.01]"
              >
                Submit
              </button>
            )}
          </article>

          <div className="mt-5">
            <Link
              href="/training"
              className="text-sm font-semibold text-amber-100/84 transition hover:text-white"
            >
              ← Back to Training
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
