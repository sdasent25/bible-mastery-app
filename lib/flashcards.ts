import { supabase } from "@/lib/supabase"

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
