// /lib/quiz/getQuestions.ts

import { createClient } from "@/lib/supabase/server"

type GetQuestionsParams = {
  book?: string
  chapter?: number
  startChapter?: number
  endChapter?: number
  day?: number
  isPro: boolean
  userId: string
  limit?: number
}

type QuestionRow = {
  id: string
  day: number | null
  reference: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  difficulty: "easy" | "medium" | "hard"
}

type QuestionHistoryRow = {
  question_id: string | null
  times_seen: number | null
  times_correct: number | null
  last_seen_at: string | null
}

export async function getQuestions({
  book,
  chapter,
  startChapter,
  endChapter,
  userId,
  limit
}) {
  const supabase = createClient()

  let query = supabase
    .from("questions")
    .select("*")
    .eq("book", book)

  // ✅ handle chapter or range
  if (chapter) {
    query = query.eq("chapter", chapter)
  }

  if (startChapter && endChapter) {
    query = query
      .gte("chapter", startChapter)
      .lte("chapter", endChapter)
  }

  // ✅ OVERFETCH (important)
  const { data: questions, error } = await query.limit(limit * 4)

  if (error || !questions) {
    console.error("Error fetching questions:", error)
    return []
  }

  // ✅ OPTIONAL: shuffle to avoid clustering
  const shuffled = questions.sort(() => 0.5 - Math.random())

  // ✅ RETURN EXACT COUNT
  return shuffled.slice(0, limit)
}

//
// 🔀 SHUFFLE ARRAY
//
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5)
}

function toSegmentId(day: number | null) {
  switch (day) {
    case 1:
      return "genesis_1_3"
    case 2:
      return "genesis_4_6"
    case 3:
      return "genesis_7_9"
    case 4:
      return "genesis_10_11"
    default:
      return "genesis_1_3"
  }
}

async function fetchQuestionsByDifficulty({
  supabase,
  book,
  chapter,
  startChapter,
  endChapter,
  day,
  difficulty,
  count,
  seenQuestionIds,
  applySeenFilter
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  book?: string
  chapter?: number
  startChapter?: number
  endChapter?: number
  day?: number
  difficulty: string
  count: number
  seenQuestionIds: string[]
  applySeenFilter: boolean
}) {
  let query = supabase
    .from("questions")
    .select("*")

  query = query
    .eq("difficulty", difficulty)
    .limit(count)

  if (typeof day === "number") {
    query = query.eq("day", day)
  } else {
    if (book) {
      query = query.eq("book", book)
    }

    if (chapter) {
      query = query.eq("chapter", chapter)
    }

    if (startChapter && endChapter) {
      query = query
        .gte("chapter", startChapter)
        .lte("chapter", endChapter)
    }
  }

  if (applySeenFilter && seenQuestionIds.length > 0) {
    query = query.not("id", "in", `(${seenQuestionIds.join(",")})`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching ${difficulty} questions`)
  }

  return (data ?? []) as QuestionRow[]
}

//
// 🔀 FORMAT + SHUFFLE ANSWERS
//
function formatQuestion(q: QuestionRow) {
  const options = [
    { key: "A", text: q.option_a },
    { key: "B", text: q.option_b },
    { key: "C", text: q.option_c },
    { key: "D", text: q.option_d }
  ]

  const shuffled = shuffleArray(options)

  // find new correct answer index
  const correctIndex = shuffled.findIndex(
    (opt) => opt.key === q.correct_answer
  )

  return {
    id: q.id,
    uuid: q.id,
    segmentId: toSegmentId(q.day),
    reference: q.reference,
    question: q.question,
    options: shuffled.map((o) => o.text),
    correctIndex,
    correctAnswerIndex: correctIndex,
    explanation: `Review ${q.reference} for context.`,
    difficulty: q.difficulty
  }
}
