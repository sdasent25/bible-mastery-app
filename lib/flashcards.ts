import { supabase } from "@/lib/supabase"

export type Flashcard = {
  id: string
  user_id?: string
  verse: string
  verse_text: string
  reference: string
  status: "new" | "learning" | "mastered"
  tags?: string[]
  createdAt: string | null
  created_at?: string | null
  updated_at?: string | null
  due_date?: string | null
  ease_factor?: number | null
  interval?: number | null
  repetitions?: number | null
  lapses?: number | null
  last_reviewed?: string | null
}

function mapStudyResultToStatus(status: "new" | "learning" | "mastered" | "again" | "hard" | "easy") {
  if (status === "again") return "new"
  if (status === "hard") return "learning"
  if (status === "easy") return "mastered"
  return status
}

export async function createFlashcard({
  verse_text,
  reference,
  tags = [],
}: {
  verse_text: string
  reference: string
  tags?: string[]
}) {
  const { data: userRes } = await supabase.auth.getUser()

  if (!userRes?.user) throw new Error("Not authenticated")

  const { error } = await supabase.from("flashcards").insert({
    user_id: userRes.user.id,
    verse_text,
    reference,
    tags,
  })

  if (error) throw error
}

export async function getFlashcards() {
  const { data: userRes } = await supabase.auth.getUser()

  if (!userRes?.user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, user_id, verse_text, reference, status, tags, created_at, updated_at, ease_factor, interval, due_date, repetitions, lapses, last_reviewed")
    .eq("user_id", userRes.user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((card) => ({
    ...card,
    verse: card.verse_text || "",
    verse_text: card.verse_text || "",
    status: card.status ?? "new",
    tags: card.tags ?? [],
    createdAt: card.created_at,
  })) satisfies Flashcard[]
}

function isDueCard(card: Pick<Flashcard, "due_date">) {
  if (!card.due_date) {
    return true
  }

  return new Date(card.due_date).getTime() <= Date.now()
}

function getPriorityBucket(card: Flashcard) {
  if (isDueCard(card)) return 0
  if ((card.lapses ?? 0) > 0) return 1
  if (card.status === "learning") return 2
  if (card.status === "new") return 3
  return 4
}

export function prioritizeFlashcards(cards: Flashcard[]) {
  return [...cards].sort((left, right) => {
    const bucketDifference = getPriorityBucket(left) - getPriorityBucket(right)

    if (bucketDifference !== 0) {
      return bucketDifference
    }

    const leftDue = left.due_date ? new Date(left.due_date).getTime() : Number.MIN_SAFE_INTEGER
    const rightDue = right.due_date ? new Date(right.due_date).getTime() : Number.MIN_SAFE_INTEGER

    if (leftDue !== rightDue) {
      return leftDue - rightDue
    }

    const leftLapses = left.lapses ?? 0
    const rightLapses = right.lapses ?? 0

    if (leftLapses !== rightLapses) {
      return rightLapses - leftLapses
    }

    return (left.createdAt ?? "").localeCompare(right.createdAt ?? "")
  })
}

export async function updateFlashcardProgress(
  card: {
    id: string
    ease_factor?: number | null
    interval?: number | null
    repetitions?: number | null
    lapses?: number | null
  },
  result: "again" | "hard" | "easy"
) {
  const { data: userRes } = await supabase.auth.getUser()

  if (!userRes?.user) throw new Error("Not authenticated")

  let {
    ease_factor,
    interval,
    repetitions,
    lapses,
  } = card

  if (!ease_factor) ease_factor = 2.5
  if (!interval) interval = 1
  if (!repetitions) repetitions = 0
  if (!lapses) lapses = 0

  let newInterval = interval
  let newEase = ease_factor

  if (result === "again") {
    newInterval = 1
    newEase = Math.max(1.3, ease_factor - 0.2)
    repetitions = 0
    lapses += 1
  }

  if (result === "hard") {
    newInterval = Math.max(1, Math.round(interval * 1.2))
    newEase = Math.max(1.3, ease_factor - 0.1)
    repetitions += 1
  }

  if (result === "easy") {
    newInterval = Math.round(interval * ease_factor)
    newEase = ease_factor + 0.1
    repetitions += 1
  }

  const nextStatus = mapStudyResultToStatus(result)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + newInterval)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      status: nextStatus,
      ease_factor: newEase,
      interval: newInterval,
      repetitions,
      lapses,
      due_date: dueDate.toISOString(),
      last_reviewed: now,
      updated_at: now,
    })
    .eq("id", card.id)
    .eq("user_id", userRes.user.id)
    .select("id, user_id, verse_text, reference, status, tags, created_at, updated_at, due_date, ease_factor, interval, repetitions, lapses, last_reviewed")
    .single()

  if (error) throw error

  return {
    id: data.id,
    user_id: data.user_id,
    verse: data.verse_text,
    verse_text: data.verse_text || "",
    reference: data.reference,
    status: nextStatus,
    tags: data.tags ?? [],
    createdAt: data.created_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    due_date: data.due_date,
    ease_factor: data.ease_factor,
    interval: data.interval,
    repetitions: data.repetitions,
    lapses: data.lapses,
    last_reviewed: data.last_reviewed,
  } satisfies Flashcard
}

export async function updateFlashcardStatus(
  id: string,
  status: "new" | "learning" | "mastered" | "again" | "hard" | "easy"
) {
  const mappedResult =
    status === "again" || status === "hard" || status === "easy"
      ? status
      : status === "new"
        ? "again"
        : status === "learning"
          ? "hard"
          : "easy"

  return updateFlashcardProgress({ id }, mappedResult)
}
