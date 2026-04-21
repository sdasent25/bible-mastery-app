import { createClient } from "@/lib/supabase/server"

type GetQuestionsParams = {
  book: string
  chapter?: number
  startChapter?: number
  endChapter?: number
  userId: string
  limit: number
}

export async function getQuestions({
  book,
  chapter,
  startChapter,
  endChapter,
  userId,
  limit
}: GetQuestionsParams) {
  const supabase = await createClient()

  let query = supabase
    .from("questions")
    .select("*")
    .eq("book", book)

  // ✅ Handle single chapter
  if (chapter !== undefined) {
    query = query.eq("chapter", chapter)
  }

  // ✅ Handle chapter range
  if (startChapter !== undefined && endChapter !== undefined) {
    query = query
      .gte("chapter", startChapter)
      .lte("chapter", endChapter)
  }

  // ✅ OVERFETCH to survive filtering
  const { data, error } = await query.limit(limit * 4)

  if (error || !data) {
    console.error("Error fetching questions:", error)
    return []
  }

  // ✅ Shuffle results
  const shuffled = data.sort(() => 0.5 - Math.random())

  // ✅ Return EXACT number requested
  return shuffled.slice(0, limit)
}