import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getQuestions } from "@/lib/quiz/getQuestions"
import { getAllNodes, getNodeById, parseNodeId } from "@/lib/nodes"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const allNodes = getAllNodes()
    const nodeIds = allNodes.map((node) => node.id)

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
    const limit = depth || 5

    // ✅ DETERMINE QUESTION COUNT (SINGLE SOURCE OF TRUTH)
    let questionCount = limit

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

    for (let i = 0; i < nodeIds.length; i++) {
      if (masteredSet.has(nodeIds[i])) {
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

      const sortedNodes = [...allNodes].sort((a, b) => {
        const aData = masteryData?.find(m => m.segment === a.id)
        const bData = masteryData?.find(m => m.segment === b.id)

        const aScore = aData ? aData.accuracy : 0
        const bScore = bData ? bData.accuracy : 0

        return aScore - bScore // lowest accuracy first
      })

      let allQuestions = []

      for (const node of sortedNodes) {
        const data = await getQuestions({
          book: node.book,
          startChapter: node.startChapter,
          endChapter: node.endChapter,
          limit: questionCount
        })

        const questions = data.slice(0, questionCount)
        allQuestions.push(...questions)
      }

      return NextResponse.json(allQuestions.slice(0, questionCount))
    }

    let segment = searchParams.get("segment")

    if (!segment) {
      return NextResponse.json({ error: "Missing segment" }, { status: 400 })
    }

    const parsed = parseNodeId(segment)

    if (!parsed) {
      return NextResponse.json({ error: "Invalid segment" }, { status: 400 })
    }

    const requestedNode = getNodeById(segment)
    const requestedIndex = requestedNode
      ? nodeIds.indexOf(requestedNode.id)
      : -1

    if (requestedIndex === 0) {
      // always allowed
    } else if (requestedIndex > unlockIndex) {
      return NextResponse.json(
        { error: "Segment locked" },
        { status: 403 }
      )
    }

    const { book, startChapter, endChapter } = parsed

    const data = await getQuestions({
      book,
      startChapter,
      endChapter,
      limit: questionCount
    })

    const questions = data.slice(0, questionCount)

    return NextResponse.json(questions)
  } catch (err) {
    console.error("QUIZ QUESTIONS ERROR:", err)
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 })
  }
}
