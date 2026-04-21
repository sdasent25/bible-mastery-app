import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getQuestions } from "@/lib/quiz/getQuestions"
import { segments } from "@/lib/questions"

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

    // ✅ DETERMINE QUESTION COUNT (SINGLE SOURCE OF TRUTH)
    let questionCount = 2 // free default

    if (
      access?.final_plan === "pro" ||
      access?.final_plan === "family_pro"
    ) {
      questionCount = 7
    }

    if (
      access?.final_plan === "pro_plus" ||
      access?.final_plan === "family_pro_plus"
    ) {
      if (depth && [5, 10, 15].includes(depth)) {
        questionCount = depth
      } else {
        questionCount = 10 // safe fallback
      }
    }

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

    const { data: masteryData } = await supabase
      .from("user_segment_mastery")
      .select("*")
      .eq("user_id", user.id)

    const masteredSet = new Set(
      (masteryData || [])
        .filter((m) => m.mastered)
        .map((m) => m.segment)
    )

    let unlockIndex = 0

    for (let i = 0; i < segments.length; i++) {
      if (masteredSet.has(segments[i])) {
        unlockIndex = i + 1
      } else {
        break
      }
    }

    if (mode === "scholar") {
      const { data: masteryData } = await supabase
        .from("user_segment_mastery")
        .select("*")
        .eq("user_id", user.id)

      const sortedSegments = [...segments].sort((a, b) => {
        const aData = masteryData?.find(m => m.segment === a)
        const bData = masteryData?.find(m => m.segment === b)

        const aScore = aData ? aData.accuracy : 0
        const bScore = bData ? bData.accuracy : 0

        return aScore - bScore // lowest accuracy first
      })

      let allQuestions = []

      for (const segmentId of sortedSegments) {
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

    if (!segments.includes(segment)) {
      return NextResponse.json({ error: "Invalid segment" }, { status: 400 })
    }

    const requestedIndex = segments.indexOf(segment)

    if (requestedIndex === 0) {
      // always allowed
    } else if (requestedIndex > unlockIndex) {
      return NextResponse.json(
        { error: "Segment locked" },
        { status: 403 }
      )
    }

    const { book, start, end } = parseSegment(segment)

    if (!book || Number.isNaN(start) || Number.isNaN(end)) {
      return NextResponse.json({ error: "Invalid segment" }, { status: 400 })
    }

    const questions = await getQuestions({
      book,
      startChapter: start,
      endChapter: end,
      limit: questionCount
    })

    return NextResponse.json(questions)
  } catch (err) {
    console.error("QUIZ QUESTIONS ERROR:", err)
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 })
  }
}
