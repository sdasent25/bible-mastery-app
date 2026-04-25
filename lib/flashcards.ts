import { supabase } from "@/lib/supabase"

export type Flashcard = {
  id: string
  verse: string
  verse_text?: string
  reference: string
  status: "new" | "learning" | "mastered"
  createdAt: string | null
  due_date?: string | null
  ease_factor?: number | null
  interval?: number | null
  repetitions?: number | null
  lapses?: number | null
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
    .select("*")
    .eq("user_id", userRes.user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((card) => ({
    id: card.id,
    verse: card.verse_text,
    verse_text: card.verse_text,
    reference: card.reference,
    status: card.status ?? "new",
    createdAt: card.created_at,
    due_date: card.due_date,
    ease_factor: card.ease_factor,
    interval: card.interval,
    repetitions: card.repetitions,
    lapses: card.lapses,
  })) satisfies Flashcard[]
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
    .select("id, verse_text, reference, status, created_at, due_date, ease_factor, interval, repetitions, lapses")
    .single()

  if (error) throw error

  return {
    id: data.id,
    verse: data.verse_text,
    verse_text: data.verse_text,
    reference: data.reference,
    status: nextStatus,
    createdAt: data.created_at,
    due_date: data.due_date,
    ease_factor: data.ease_factor,
    interval: data.interval,
    repetitions: data.repetitions,
    lapses: data.lapses,
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
