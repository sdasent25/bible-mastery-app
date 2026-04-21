import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getQuestions } from "@/lib/quiz/getQuestions"
import { segments } from "@/lib/questions"

export const dynamic = "force-dynamic"

type FinalPlan =
  | "free"
  | "pro"
  | "pro_plus"
  | "family_pro"
  | "family_pro_plus"

type MasteryRow = {
  segment: string
  mastered?: boolean | null
  accuracy?: number | null
}

function normalizeSegmentId(value: string) {
  return value.replace(/-/g, "_").toLowerCase()
}

function parseSegment(segment: string) {
  const normalized = normalizeSegmentId(segment)
  const parts = normalized.split("_")

  if (parts.length < 3) {
    return null
  }

  const book = parts[0]
  const start = Number(parts[1])
  const end = Number(parts[2])

  if (!book || Number.isNaN(start) || Number.isNaN(end)) {
    return null
  }

  return {
    book: book.charAt(0).toUpperCase() + book.slice(1),
    start,
    end,
  }
}

function getQuestionCount(plan: FinalPlan | null | undefined, depth: number | null) {
  if (plan === "pro" || plan === "family_pro") {
    return 7
  }

  if (plan === "pro_plus" || plan === "family_pro_plus") {
    if (depth && [5, 10, 15].includes(depth)) {
      return depth
    }
    return 10
  }

  return 2
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: access, error: accessError } = await supabase
      .from("user_access")
      .select("final_plan")
      .eq("user_id", user.id)
      .single()

    if (accessError) {
      console.error("USER ACCESS ERROR:", accessError)
      return NextResponse.json({ error: "Failed to load access" }, { status: 500 })
    }

    const plan = (access?.final_plan ?? "free") as FinalPlan

    const searchParams = req.nextUrl.searchParams
    const mode = searchParams.get("mode") || "normal"
    const depthParam = searchParams.get("depth")
    const depth = depthParam ? Number(depthParam) : null

    const questionCount = getQuestionCount(plan, depth)

    const { data: historyCheck, error: historyError } = await supabase
      .from("user_question_history")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)

    if (historyError) {
      console.error("HISTORY CHECK ERROR:", historyError)
      return NextResponse.json({ error: "Failed to load history" }, { status: 500 })
    }

    if (mode === "scholar" && (!historyCheck || historyCheck.length === 0)) {
      return NextResponse.json({ error: "Scholar mode locked" }, { status: 403 })
    }

    const { data: masteryData, error: masteryError } = await supabase
      .from("user_segment_mastery")
      .select("segment, mastered, accuracy")
      .eq("user_id", user.id)

    if (masteryError) {
      console.error("MASTERY ERROR:", masteryError)
      return NextResponse.json({ error: "Failed to load mastery" }, { status: 500 })
    }

    const masteryRows = (masteryData ?? []) as MasteryRow[]
    const normalizedSegments = segments.map(normalizeSegmentId)

    const masteredSet = new Set(
      masteryRows
        .filter((row) => !!row.mastered)
        .map((row) => normalizeSegmentId(row.segment))
    )

    let unlockIndex = 0

    for (let i = 0; i < normalizedSegments.length; i++) {
      if (masteredSet.has(normalizedSegments[i])) {
        unlockIndex = i + 1
      } else {
        break
      }
    }

    if (mode === "scholar") {
      const sortedSegments = [...normalizedSegments].sort((a, b) => {
        const aData = masteryRows.find((m) => normalizeSegmentId(m.segment) === a)
        const bData = masteryRows.find((m) => normalizeSegmentId(m.segment) === b)

        const aScore = typeof aData?.accuracy === "number" ? aData.accuracy : 0
        const bScore = typeof bData?.accuracy === "number" ? bData.accuracy : 0

        return aScore - bScore
      })

      const allQuestions: any[] = []

      for (const segmentId of sortedSegments) {
        if (allQuestions.length >= questionCount) {
          break
        }

        const parsed = parseSegment(segmentId)
        if (!parsed) {
          continue
        }

        const remaining = questionCount - allQuestions.length

        const questions = await getQuestions({
          book: parsed.book,
          startChapter: parsed.start,
          endChapter: parsed.end,
          limit: remaining,
        })

        allQuestions.push(...questions)
      }

      return NextResponse.json(allQuestions.slice(0, questionCount))
    }

    const rawSegment = searchParams.get("segment")

    if (!rawSegment) {
      return NextResponse.json({ error: "Missing segment" }, { status: 400 })
    }

    const normalizedRequestedSegment = normalizeSegmentId(rawSegment)

    if (!normalizedSegments.includes(normalizedRequestedSegment)) {
      return NextResponse.json({ error: "Invalid segment" }, { status: 400 })
    }

    const requestedIndex = normalizedSegments.indexOf(normalizedRequestedSegment)

    if (requestedIndex !== 0 && requestedIndex > unlockIndex) {
      return NextResponse.json({ error: "Segment locked" }, { status: 403 })
    }

    const parsedSegment = parseSegment(normalizedRequestedSegment)

    if (!parsedSegment) {
      return NextResponse.json({ error: "Invalid segment" }, { status: 400 })
    }

    const questions = await getQuestions({
      book: parsedSegment.book,
      startChapter: parsedSegment.start,
      endChapter: parsedSegment.end,
      limit: questionCount,
    })

    return NextResponse.json(questions)
  } catch (err) {
    console.error("QUIZ QUESTIONS ERROR:", err)
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 })
  }
}