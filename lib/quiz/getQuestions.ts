// /lib/quiz/getQuestions.ts

import { createClient } from "@/lib/supabase/server"

type GetQuestionsParams = {
  book?: string
  chapter?: number
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
  day,
  isPro,
  userId,
  limit = 10
}: GetQuestionsParams) {
  const supabase = await createClient()
  const { data: historyData, error: historyError } = await supabase
    .from("user_question_history")
    .select("question_id, times_seen, times_correct, last_seen_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (historyError) {
    console.error("HISTORY ERROR:", historyError)
  }

  const historyMap = new Map()

  historyData?.forEach((item) => {
    historyMap.set(item.question_id, item)
  })

  const seenQuestionIds: string[] =
    historyData
      ?.map((row: QuestionHistoryRow) => row.question_id)
      .filter((questionId): questionId is string => Boolean(questionId)) ?? []

  // 🎯 STEP 1 — Determine difficulty distribution
  const easyCount = Math.ceil(limit * 0.2)
  const mediumCount = Math.ceil(limit * 0.5)
  const hardCount = limit - easyCount - mediumCount
  const difficultyMap: Record<string, number> = {
    easy: easyCount,
    medium: mediumCount,
    hard: hardCount
  }

  // 🧠 STEP 2 — Fetch questions by difficulty
  const allQuestions: QuestionRow[] = []

  for (const [difficulty, count] of Object.entries(difficultyMap)) {
    const filteredQuestions = await fetchQuestionsByDifficulty({
      supabase,
      book,
      chapter,
      day,
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
            day,
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

  // 🎯 STEP 4 — Prioritize unseen and weaker questions
  const scored = uniqueQuestions.map((q) => {
    const history = historyMap.get(q.id) as QuestionHistoryRow | undefined

    if (!history) {
      return { ...q, score: 1000 }
    }

    const timesSeen = history.times_seen ?? 0
    const timesCorrect = history.times_correct ?? 0
    const accuracy = timesSeen > 0 ? timesCorrect / timesSeen : 0
    const weaknessScore = (1 - accuracy) * 500
    const repetitionPenalty = timesSeen * -5
    const recencyBonus = history.last_seen_at
      ? Math.max(
          0,
          50 - (Date.now() - new Date(history.last_seen_at).getTime()) / 1000000
        )
      : 0

    return {
      ...q,
      score: weaknessScore + repetitionPenalty + recencyBonus
    }
  })

  scored.sort((a, b) => b.score - a.score)

  const finalQuestions = shuffleArray(scored)

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
  day,
  difficulty,
  count,
  seenQuestionIds,
  applySeenFilter
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  book?: string
  chapter?: number
  day?: number
  difficulty: string
  count: number
  seenQuestionIds: string[]
  applySeenFilter: boolean
}) {
  let query = supabase
    .from("questions")
    .select("*")
    .eq("difficulty", difficulty)
    .limit(count)

  if (typeof day === "number") {
    query = query.eq("day", day)
  } else {
    if (book) {
      query = query.eq("book", book)
    }

    if (typeof chapter === "number") {
      query = query.eq("chapter", chapter)
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
