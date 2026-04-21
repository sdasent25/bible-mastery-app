import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getQuestions } from "@/lib/quiz/getQuestions"
import { getQuestionCount } from "@/lib/quiz/getQuestionCount"

export const dynamic = "force-dynamic"

function parseSegment(segment: string) {
  const [book, start, end] = segment.split("_")

  return {
    book: book.charAt(0).toUpperCase() + book.slice(1),
    start: Number(start),
    end: Number(end)
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ GET USER ACCESS
    const { data: access } = await supabase
      .from("user_access")
      .select("final_plan")
      .eq("user_id", user.id)
      .single()

    // ✅ READ DEPTH FROM URL
    const searchParams = req.nextUrl.searchParams
    const depthParam = searchParams.get("depth")
    const depth = depthParam ? parseInt(depthParam) : null

    const questionCount = getQuestionCount(
      access?.final_plan,
      depth || undefined
    )

    const mode = searchParams.get("mode") || "normal"

    const { data: historyCheck } = await supabase
      .from("user_question_history")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)

    if (mode === "scholar" && (!historyCheck || historyCheck.length === 0)) {
      return NextResponse.json(
        { error: "Scholar mode locked" },
        { status: 403 }
      )
    }

    if (mode === "scholar") {
      const { data: masteryData } = await supabase
        .from("user_segment_mastery")
        .select("*")
        .eq("user_id", user.id)

      const sortedSegments = [...(masteryData || [])].sort((a, b) => {
        const aScore = a ? a.accuracy : 0
        const bScore = b ? b.accuracy : 0

        return aScore - bScore // lowest accuracy first
      })

      let allQuestions = []

      for (const { segment: segmentId } of sortedSegments) {
        const [book, start, end] = segmentId.split("_")
        const questions = await getQuestions({
          book: book.charAt(0).toUpperCase() + book.slice(1),
          startChapter: Number(start),
          endChapter: Number(end),
          limit: questionCount
        })

        allQuestions.push(...questions)
      }

      return NextResponse.json(allQuestions.slice(0, questionCount))
    }

    let segment = searchParams.get("segment")

    if (!segment) {
      return NextResponse.json({ error: "Missing segment" }, { status: 400 })
    }

    // TEMP: allow segment access if requested
    // (real progression will be handled elsewhere)
    const requestedIndex = 0 // bypass strict index logic

    const parsed = parseSegment(segment)

    if (!parsed.book || Number.isNaN(parsed.start) || Number.isNaN(parsed.end)) {
      return NextResponse.json({ error: "Invalid segment format" }, { status: 400 })
    }

    const questions = await getQuestions({
      book: parsed.book,
      startChapter: parsed.start,
      endChapter: parsed.end,
      limit: questionCount
    })

    return NextResponse.json(questions)
  } catch (err) {
    console.error("QUIZ QUESTIONS ERROR:", err)
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 })
  }
}
