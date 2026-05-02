import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authClient = await createClient()
    const body = await req.json()
    const { questionId, correct, segmentId } = body ?? {}

    if (!questionId || typeof correct !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { status: 400 }
      )
    }

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const { data: existing } = await supabase
      .from("user_question_history")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle()

    let firstTimeCorrect = false

    if (existing) {
      if (!existing.correct && correct) {
        firstTimeCorrect = true
      }

      await supabase
        .from("user_question_history")
        .update({
          correct: existing.correct || correct,
          times_seen: existing.times_seen + 1,
          times_correct: correct
            ? existing.times_correct + 1
            : existing.times_correct,
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      firstTimeCorrect = correct

      await supabase
        .from("user_question_history")
        .insert({
          user_id: userId,
          question_id: questionId,
          correct,
          times_seen: 1,
          times_correct: correct ? 1 : 0,
          last_seen_at: new Date().toISOString(),
        })
    }

    if (firstTimeCorrect) {
      await supabase.rpc("increment_streak")
    }

    if (segmentId) {
      const { data: mastery } = await supabase
        .from("user_segment_mastery")
        .select("*")
        .eq("user_id", userId)
        .eq("segment", segmentId)
        .maybeSingle()

      if (mastery) {
        const newAnswered = mastery.total_answered + 1
        const newCorrect = correct
          ? mastery.total_correct + 1
          : mastery.total_correct

        const accuracy = newCorrect / newAnswered

        await supabase
          .from("user_segment_mastery")
          .update({
            total_answered: newAnswered,
            total_correct: newCorrect,
            accuracy,
            mastered: accuracy >= 0.8 && newAnswered >= 5,
            updated_at: new Date().toISOString(),
          })
          .eq("id", mastery.id)
      } else {
        await supabase
          .from("user_segment_mastery")
          .insert({
            user_id: userId,
            segment: segmentId,
            total_answered: 1,
            total_correct: correct ? 1 : 0,
            accuracy: correct ? 1 : 0,
            mastered: false,
          })
      }
    }

    if (correct) {
      await supabase
        .from("profiles")
        .update({
          last_completed_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", userId)
    }

    return NextResponse.json({
      success: true,
      firstTimeCorrect,
    })
  } catch (err) {
    console.error("SAVE ERROR:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
