import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { questionId, correct } = await req.json()

    // TEMP: use your real user ID (replace if needed)
    const userId = "3cc20757-f21c-4ba5-81ce-04c4a721f2fc"

    const { data: existing } = await supabase
      .from("user_question_history")
      .select("*")
      .eq("user_id", userId)
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
          user_id: userId,
          question_id: questionId,
          correct,
          times_seen: 1,
          times_correct: correct ? 1 : 0
        })
    }

    // ===== MASTERY UPDATE =====

    // derive segment from questionId using questions table
    const { data: questionRow } = await supabase
      .from("questions")
      .select("book, chapter")
      .eq("id", questionId)
      .single()

    let segment = "genesis_1_3"

    if (questionRow) {
      const book = questionRow.book.toLowerCase()

      if (questionRow.chapter >= 1 && questionRow.chapter <= 3) {
        segment = `${book}_1_3`
      } else if (questionRow.chapter >= 4 && questionRow.chapter <= 6) {
        segment = `${book}_4_6`
      } else if (questionRow.chapter >= 7 && questionRow.chapter <= 9) {
        segment = `${book}_7_9`
      } else if (questionRow.chapter >= 10 && questionRow.chapter <= 11) {
        segment = `${book}_10_11`
      }
    }

    const { data: mastery } = await supabase
      .from("user_segment_mastery")
      .select("*")
      .eq("user_id", userId)
      .eq("segment", segment)
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
          updated_at: new Date().toISOString()
        })
        .eq("id", mastery.id)
    } else {
      await supabase
        .from("user_segment_mastery")
        .insert({
          user_id: userId,
          segment,
          total_answered: 1,
          total_correct: correct ? 1 : 0,
          accuracy: correct ? 1 : 0,
          mastered: false
        })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("SAVE ERROR:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
