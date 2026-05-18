import type { TrainingDaySummary } from "./types"

export type TrainingBookSlug = "genesis" | "exodus"

const TRAINING_BOOK_LABELS: Record<TrainingBookSlug, string> = {
  genesis: "Genesis",
  exodus: "Exodus",
}

export function isTrainingBookSlug(value: string): value is TrainingBookSlug {
  return value === "genesis" || value === "exodus"
}

export function getTrainingBookLabel(slug: TrainingBookSlug) {
  return TRAINING_BOOK_LABELS[slug]
}

export function getTrainingBookSlugFromSegmentKey(segmentKey: string) {
  const [bookSlug] = segmentKey.split("-")
  return bookSlug?.toLowerCase() ?? ""
}

export function getTrainingDaysForBook(
  days: TrainingDaySummary[],
  bookSlug: TrainingBookSlug
) {
  return days.filter((day) => getTrainingBookSlugFromSegmentKey(day.segmentKey) === bookSlug)
}
