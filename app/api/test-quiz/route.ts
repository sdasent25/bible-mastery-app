import { NextResponse } from "next/server"
import { getQuestions } from "@/lib/quiz/getQuestions"

export async function GET() {
  try {
    const questions = await getQuestions({
      book: "Matthew",
      chapter: 5,
      isPro: true
    })

    return NextResponse.json(questions)
  } catch (err) {
    console.error("QUIZ ENGINE ERROR:", err)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}
