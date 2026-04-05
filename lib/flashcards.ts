import { supabase } from "@/lib/supabase"

export type Flashcard = {
  id: string
  verse: string
  reference: string
  status: "new" | "learning" | "mastered"
  createdAt: string | null
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

  return data || []
}

export async function updateFlashcardStatus(
  id: string,
  status: "new" | "learning" | "mastered" | "again" | "hard" | "easy"
) {
  const { data: userRes } = await supabase.auth.getUser()

  if (!userRes?.user) throw new Error("Not authenticated")

  const nextStatus = mapStudyResultToStatus(status)

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userRes.user.id)
    .select("id, verse_text, reference, status, created_at")
    .single()

  if (error) throw error

  return {
    id: data.id,
    verse: data.verse_text,
    reference: data.reference,
    status: nextStatus,
    createdAt: data.created_at,
  } satisfies Flashcard
}
