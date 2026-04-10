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

    // ✅ GET USER PLAN
    const { data: access } = await supabase
      .from("user_access")
      .select("final_plan")
      .eq("user_id", user.id)
      .single()

    let questionsPerDay = 2 // default free

    if (access?.final_plan === "pro") questionsPerDay = 10
    if (access?.final_plan === "pro_plus") questionsPerDay = 15

    const searchParams = req.nextUrl.searchParams
    const mode = searchParams.get("mode") || "normal"
    const isPro = searchParams.get("isPro") === "true"

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
        const segmentMastery = masteryData?.find((m) => m.segment === segmentId)
        const segmentLimit =
          segmentMastery && segmentMastery.accuracy >= 0.8 ? 2 : 5

        for (let c = Number(start); c <= Number(end); c++) {
          const batch = await getQuestions({
            book: book.charAt(0).toUpperCase() + book.slice(1),
            chapter: c,
            isPro: true,
            userId: user.id,
            limit: segmentLimit
          })

          allQuestions.push(...batch)
        }
      }

      return NextResponse.json(allQuestions.slice(0, questionsPerDay))
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

    let questions = []

    for (let c = start; c <= end; c++) {
      const batch = await getQuestions({
        book,
        chapter: c,
        isPro,
        userId: user.id,
        limit: Math.ceil(questionsPerDay / (end - start + 1))
      })

      questions.push(...batch)
    }

    questions = questions.slice(0, questionsPerDay)

    return NextResponse.json(questions)
  } catch (err) {
    console.error("QUIZ QUESTIONS ERROR:", err)
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 })
  }
}
