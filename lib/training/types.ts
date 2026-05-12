export type TrainingDifficulty = "easy" | "medium" | "hard" | "scholar"

export type TrainingItemFormat =
  | "multiple_choice"
  | "fill_blank"
  | "image_choice"
  | "ordering"
  | "matching"
  | "true_false"
  | "spot_error"

export type TrainingImageChoiceOption = {
  label: string
  image_url: string
  alt: string
}

export type TrainingMatchingPair = {
  left: string
  right: string
}

export type TrainingItem = {
  key: string
  format: TrainingItemFormat
  prompt: string
  book: string
  chapter: number
  verse_start: number
  verse_end: number
  reference: string
  testament: string
  category: string
  skill: string
  difficulty: TrainingDifficulty
  content: Record<string, any>
  correct_answer: Record<string, any>
  explanation: string
  teaching_note: string | null
  image_accuracy_note: string | null
  unlock_type: string
  unlock_key: string
  tags: string[]
}

export type TrainingDay = {
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

export type TrainingDaySummary = {
  day: number
  reference: string
  itemCount: number
  segmentKey: string
}

export type TrainingAccessTier = "free" | "pro" | "pro_plus"

export type TrainingAccessState = {
  signedIn: boolean
  rawPlan:
    | "free"
    | "pro"
    | "pro_plus"
    | "family_pro"
    | "family_pro_plus"
  tier: TrainingAccessTier
}
