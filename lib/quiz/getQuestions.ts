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

  const normalized = shuffled.map((q) => {
    const options = [
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d
    ]

    const correctIndex =
      q.correct_answer === "A" ? 0 :
      q.correct_answer === "B" ? 1 :
      q.correct_answer === "C" ? 2 :
      q.correct_answer === "D" ? 3 :
      0

    return {
      ...q,
      options,
      correctIndex
    }
  })

  // Return EXACT amount
  return normalized.slice(0, limit)
}
