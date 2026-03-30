// /lib/quiz/getQuestions.ts

import { createClient } from "@/lib/supabase/server"

type GetQuestionsParams = {
  book: string
  chapter: number
  isPro: boolean
  userId: string
  limit?: number
}

type QuestionRow = {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  difficulty: "easy" | "medium" | "hard"
}

export async function getQuestions({
  book,
  chapter,
  isPro,
  userId,
  limit = 10
}: GetQuestionsParams) {
  const supabase = createClient()
  const { data: historyData, error: historyError } = await supabase
    .from("user_question_history")
    .select("question_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (historyError) {
    throw new Error("Error fetching user question history")
  }

  const seenQuestionIds: string[] =
    historyData
      ?.map((row: { question_id: string | null }) => row.question_id)
      .filter((questionId): questionId is string => Boolean(questionId)) ?? []

  // 🎯 STEP 1 — Determine difficulty distribution
  let difficultyMap: Record<string, number>

  if (!isPro) {
    difficultyMap = { easy: limit }
  } else {
    difficultyMap = {
      easy: 2,
      medium: 4,
      hard: 4
    }
  }

  // 🧠 STEP 2 — Fetch questions by difficulty
  const allQuestions: QuestionRow[] = []

  for (const [difficulty, count] of Object.entries(difficultyMap)) {
    const filteredQuestions = await fetchQuestionsByDifficulty({
      supabase,
      book,
      chapter,
      difficulty,
      count,
      seenQuestionIds,
      applySeenFilter: seenQuestionIds.length > 0
    })

    const questionsForDifficulty =
      filteredQuestions.length >= count
        ? filteredQuestions
        : await fetchQuestionsByDifficulty({
            supabase,
            book,
            chapter,
            difficulty,
            count,
            seenQuestionIds,
            applySeenFilter: false
          })

    if (questionsForDifficulty.length > 0) {
      // randomize + take needed count
      const shuffled = shuffleArray(questionsForDifficulty)
      allQuestions.push(...shuffled.slice(0, count))
    }
  }

  // 🚫 STEP 3 — Ensure no duplicates
  const uniqueMap = new Map<string, QuestionRow>()
  for (const q of allQuestions) {
    uniqueMap.set(q.id, q)
  }

  const uniqueQuestions = Array.from(uniqueMap.values())

  // 🔀 STEP 4 — Shuffle final question order
  const finalQuestions = shuffleArray(uniqueQuestions)

  // 🔀 STEP 5 — Shuffle answer choices
  const formatted = finalQuestions.map(formatQuestion)

  return formatted
}

//
// 🔀 SHUFFLE ARRAY
//
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5)
}

async function fetchQuestionsByDifficulty({
  supabase,
  book,
  chapter,
  difficulty,
  count,
  seenQuestionIds,
  applySeenFilter
}: {
  supabase: ReturnType<typeof createClient>
  book: string
  chapter: number
  difficulty: string
  count: number
  seenQuestionIds: string[]
  applySeenFilter: boolean
}) {
  let query = supabase
    .from("questions")
    .select("*")
    .eq("book", book)
    .eq("chapter", chapter)
    .eq("difficulty", difficulty)
    .limit(count * 3)

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
    question: q.question,
    options: shuffled.map((o) => o.text),
    correctAnswerIndex: correctIndex,
    difficulty: q.difficulty
  }
}
