import { createClient } from "@/lib/supabase/server"

type GetQuestionsParams = {
  book: string
  startChapter: number
  endChapter: number
  limit: number
}

export async function getQuestions({
  book,
  startChapter,
  endChapter,
  limit
}: GetQuestionsParams) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("book", book)
    .gte("chapter", startChapter)
    .lte("chapter", endChapter)
    .limit(limit * 4) // 🔥 OVERFETCH

  if (error || !data) {
    console.error("Error fetching questions:", error)
    return []
  }

  // Shuffle
  const shuffled = data.sort(() => Math.random() - 0.5)

  // Return EXACT amount
  return shuffled.slice(0, limit)
}