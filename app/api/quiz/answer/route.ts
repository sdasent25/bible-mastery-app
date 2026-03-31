import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("AUTH ERROR:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { questionId, correct } = body

    const { data: existing } = await supabase
      .from("user_question_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("user_question_history")
        .update({
          correct,
          times_seen: existing.times_seen + 1,
          times_correct: correct
            ? existing.times_correct + 1
            : existing.times_correct,
          last_seen: new Date().toISOString()
        })
        .eq("id", existing.id)
    } else {
      await supabase
        .from("user_question_history")
        .insert({
          user_id: user.id,
          question_id: questionId,
          correct,
          times_seen: 1,
          times_correct: correct ? 1 : 0
        })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("SAVE ERROR:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
