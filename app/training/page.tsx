import type { ReactNode } from "react"

import dayOneTraining from "@/data/training/day-001.json"

import TrainingImageOption from "./TrainingImageOption"

type Difficulty = "easy" | "medium" | "hard" | "scholar"
type ItemFormat =
  | "multiple_choice"
  | "fill_blank"
  | "image_choice"
  | "ordering"
  | "matching"
  | "true_false"
  | "spot_error"

type BaseItem = {
  key: string
  format: ItemFormat
  prompt: string
  book: string
  chapter: number
  verse_start: number
  verse_end: number
  reference: string
  testament: string
  category: string
  skill: string
  difficulty: Difficulty
  explanation: string
  teaching_note: string | null
  image_accuracy_note: string | null
  unlock_type: string
  unlock_key: string
  tags: string[]
}

type MultipleChoiceItem = BaseItem & {
  format: "multiple_choice"
  content: {
    options: string[]
  }
  correct_answer: {
    type: "single"
    value: string
  }
}

type FillBlankItem = BaseItem & {
  format: "fill_blank"
  content: {
    text: string
    blank_count: number
    options: string[]
  }
  correct_answer: {
    type: "single"
    value: string
  }
}

type ImageChoiceOption = {
  label: string
  image_url: string
  alt: string
}

type ImageChoiceItem = BaseItem & {
  format: "image_choice"
  content: {
    question_image_type: "answer_cards"
    options: ImageChoiceOption[]
  }
  correct_answer: {
    type: "single"
    value: string
  }
}

type OrderingItem = BaseItem & {
  format: "ordering"
  content: {
    instruction: string
    items: string[]
  }
  correct_answer: {
    type: "ordered_list"
    value: string[]
  }
}

type MatchingPair = {
  left: string
  right: string
}

type MatchingItem = BaseItem & {
  format: "matching"
  content: {
    instruction: string
    left_items: string[]
    right_items: string[]
  }
  correct_answer: {
    type: "pairs"
    value: MatchingPair[]
  }
}

type TrueFalseItem = BaseItem & {
  format: "true_false"
  content: {
    statement: string
  }
  correct_answer: {
    type: "boolean"
    value: boolean
  }
}

type SpotErrorItem = BaseItem & {
  format: "spot_error"
  content: {
    statement: string
    instruction: string
    options: string[]
  }
  correct_answer: {
    type: "single"
    value: string
  }
}

type TrainingItem =
  | MultipleChoiceItem
  | FillBlankItem
  | ImageChoiceItem
  | OrderingItem
  | MatchingItem
  | TrueFalseItem
  | SpotErrorItem

type TrainingDay = {
  day: number
  segment_key: string
  unlock_key: string
  reading: {
    book: string
    chapter_start: number
    chapter_end: number
    reference: string
  }
  items: TrainingItem[]
}

const trainingDay = dayOneTraining as TrainingDay

const formatOrder: ItemFormat[] = [
  "multiple_choice",
  "fill_blank",
  "image_choice",
  "ordering",
  "matching",
  "true_false",
  "spot_error",
]

const difficultyOrder: Difficulty[] = ["easy", "medium", "hard"]

function formatLabel(format: ItemFormat) {
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

function difficultyClass(difficulty: Difficulty) {
  switch (difficulty) {
    case "easy":
      return "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
    case "medium":
      return "border-amber-300/35 bg-amber-300/10 text-amber-100"
    case "hard":
      return "border-rose-300/35 bg-rose-300/10 text-rose-100"
    default:
      return "border-white/15 bg-white/8 text-slate-100"
  }
}

function StatPill({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  )
}

function AnswerPanel({
  children,
  title = "Correct Answer",
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <div className="rounded-[1.2rem] border border-emerald-300/24 bg-emerald-300/8 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100/80">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-white">{children}</div>
    </div>
  )
}

function renderItemContent(item: TrainingItem) {
  switch (item.format) {
    case "multiple_choice":
      return (
        <div className="space-y-3">
          <div className="grid gap-3">
            {item.content.options.map((option) => {
              const isCorrect = option === item.correct_answer.value
              return (
                <div
                  key={option}
                  className={`rounded-[1.15rem] border px-4 py-3 text-sm leading-6 ${
                    isCorrect
                      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-50"
                      : "border-white/10 bg-white/[0.03] text-slate-200"
                  }`}
                >
                  {option}
                </div>
              )
            })}
          </div>
          <AnswerPanel>{item.correct_answer.value}</AnswerPanel>
        </div>
      )
    case "fill_blank":
      return (
        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-base leading-7 text-slate-100">
            {item.content.text}
          </div>
          <div className="grid gap-3">
            {item.content.options.map((option) => {
              const isCorrect = option === item.correct_answer.value
              return (
                <div
                  key={option}
                  className={`rounded-[1.15rem] border px-4 py-3 text-sm leading-6 ${
                    isCorrect
                      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-50"
                      : "border-white/10 bg-white/[0.03] text-slate-200"
                  }`}
                >
                  {option}
                </div>
              )
            })}
          </div>
          <AnswerPanel>{item.correct_answer.value}</AnswerPanel>
        </div>
      )
    case "image_choice":
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {item.content.options.map((option) => (
              <TrainingImageOption
                key={option.image_url}
                imageUrl={option.image_url}
                alt={option.alt}
                label={option.label}
                isCorrect={option.label === item.correct_answer.value}
              />
            ))}
          </div>
          <AnswerPanel>{item.correct_answer.value}</AnswerPanel>
        </div>
      )
    case "ordering":
      return (
        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
            {item.content.instruction}
          </div>
          <div className="grid gap-3">
            {item.content.items.map((entry, index) => (
              <div
                key={`${item.key}-display-${entry}`}
                className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200"
              >
                Display {index + 1}. {entry}
              </div>
            ))}
          </div>
          <AnswerPanel title="Correct Order">
            <ol className="list-decimal space-y-1 pl-5">
              {item.correct_answer.value.map((entry) => (
                <li key={`${item.key}-answer-${entry}`}>{entry}</li>
              ))}
            </ol>
          </AnswerPanel>
        </div>
      )
    case "matching":
      return (
        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
            {item.content.instruction}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Left Items
              </div>
              <div className="mt-3 space-y-2">
                {item.content.left_items.map((entry) => (
                  <div
                    key={`${item.key}-left-${entry}`}
                    className="rounded-xl border border-white/8 bg-black/10 px-3 py-2 text-sm text-slate-100"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Right Items
              </div>
              <div className="mt-3 space-y-2">
                {item.content.right_items.map((entry) => (
                  <div
                    key={`${item.key}-right-${entry}`}
                    className="rounded-xl border border-white/8 bg-black/10 px-3 py-2 text-sm text-slate-100"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <AnswerPanel title="Correct Pairs">
            <div className="space-y-2">
              {item.correct_answer.value.map((pair) => (
                <div key={`${item.key}-${pair.left}`} className="text-sm leading-6">
                  <span className="font-bold text-emerald-100">{pair.left}</span> → {pair.right}
                </div>
              ))}
            </div>
          </AnswerPanel>
        </div>
      )
    case "true_false":
      return (
        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-base leading-7 text-slate-100">
            {item.content.statement}
          </div>
          <AnswerPanel>{item.correct_answer.value ? "True" : "False"}</AnswerPanel>
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
          <div className="grid gap-3">
            {item.content.options.map((option) => {
              const isCorrect = option === item.correct_answer.value
              return (
                <div
                  key={option}
                  className={`rounded-[1.15rem] border px-4 py-3 text-sm leading-6 ${
                    isCorrect
                      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-50"
                      : "border-white/10 bg-white/[0.03] text-slate-200"
                  }`}
                >
                  {option}
                </div>
              )
            })}
          </div>
          <AnswerPanel>{item.correct_answer.value}</AnswerPanel>
        </div>
      )
    default:
      return null
  }
}

export default function TrainingPage() {
  const items = trainingDay.items
  const difficultyCounts = difficultyOrder.map((difficulty) => ({
    difficulty,
    count: items.filter((item) => item.difficulty === difficulty).length,
  }))
  const formatCounts = formatOrder.map((format) => ({
    format,
    count: items.filter((item) => item.format === format).length,
  }))

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#25375f_0%,_#101728_32%,_#070b14_100%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,215,118,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-3rem] top-40 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-3rem] top-[20rem] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(8,12,20,0.98))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-7">
          <div className="inline-flex rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-100/84">
            Content Preview
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Training Arena
          </h1>
          <p className="mt-3 text-lg font-semibold text-amber-100/84">
            Day 1 · {trainingDay.reading.reference}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Review the first Training Arena pack with answers, explanations, image options, and structured content exactly as it loads from the new Training data source.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Total Items" value={items.length} />
            <StatPill label="Segment" value={trainingDay.segment_key} />
            <StatPill label="Unlock Key" value={trainingDay.unlock_key} />
            <StatPill label="Reading" value={trainingDay.reading.reference} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Difficulty Mix
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {difficultyCounts.map(({ difficulty, count }) => (
                  <div
                    key={difficulty}
                    className={`rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] ${difficultyClass(
                      difficulty
                    )}`}
                  >
                    {difficulty}: {count}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Format Mix
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {formatCounts.map(({ format, count }) => (
                  <div
                    key={format}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200"
                  >
                    {format}: {count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-5">
          {items.map((item, index) => (
            <article
              key={item.key}
              className="rounded-[1.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,22,36,0.96),rgba(8,11,20,0.98))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-200">
                    Item {index + 1}
                  </div>
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
                </div>

                <div>
                  <h2 className="text-2xl font-black leading-tight text-white">
                    {item.prompt}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-amber-100/78">
                    {item.reference}
                  </p>
                </div>

                {renderItemContent(item)}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Explanation
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      {item.explanation}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Review Notes
                    </div>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-slate-200">
                      <p>
                        <span className="font-bold text-white">Skill:</span> {item.skill}
                      </p>
                      <p>
                        <span className="font-bold text-white">Tags:</span> {item.tags.join(", ")}
                      </p>
                      <p>
                        <span className="font-bold text-white">Teaching note:</span>{" "}
                        {item.teaching_note || "None"}
                      </p>
                      <p>
                        <span className="font-bold text-white">Image note:</span>{" "}
                        {item.image_accuracy_note || "None"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
