import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { questionId, correct } = body

    if (!questionId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = user.id

    // Check if record exists
    const { data: existing } = await supabase
      .from("user_question_history")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("user_question_history")
        .update({
          correct,
          last_seen: new Date().toISOString(),
          times_seen: existing.times_seen + 1,
          times_correct: correct
            ? existing.times_correct + 1
            : existing.times_correct
        })
        .eq("id", existing.id)

      if (error) {
        console.error("SUPABASE ERROR:", error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
    } else {
      const { error } = await supabase
        .from("user_question_history")
        .insert({
          user_id: userId,
          question_id: questionId,
          correct,
          times_seen: 1,
          times_correct: correct ? 1 : 0
        })

      if (error) {
        console.error("SUPABASE ERROR:", error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("ANSWER SAVE ERROR:", err)
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    )
  }
}
