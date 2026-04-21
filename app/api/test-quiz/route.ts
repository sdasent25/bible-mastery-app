import { NextResponse } from "next/server"
import { getQuestions } from "@/lib/quiz/getQuestions"

export async function GET() {
  try {
    const questions = await getQuestions({
      book: "Matthew",
      startChapter: 5,
      endChapter: 5,
      limit: 10,
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("TEST QUIZ ERROR:", error)
    return NextResponse.json({ error: "Failed to load test quiz" }, { status: 500 })
  }
}
