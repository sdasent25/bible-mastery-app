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
    const { questionId, correct, segmentId } = await req.json()

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

    // ===== DAILY XP CAP =====
    const DAILY_XP_CAP = 120

    const { data: xpData } = await supabase
      .from("user_stats")
      .select("daily_xp, last_xp_date")
      .eq("user_id", userId)
      .maybeSingle()

    const today = new Date().toISOString().split("T")[0]

    let dailyXp = xpData?.daily_xp || 0
    let lastDate = xpData?.last_xp_date

    if (lastDate !== today) {
      dailyXp = 0
    }

    let xpAwarded = 0

    if (firstTimeCorrect && dailyXp < DAILY_XP_CAP) {
      xpAwarded = 10

      if (dailyXp + xpAwarded > DAILY_XP_CAP) {
        xpAwarded = DAILY_XP_CAP - dailyXp
      }

      await supabase.rpc("increment_xp", {
        user_id: userId,
        amount: xpAwarded,
      })

      await supabase
        .from("user_stats")
        .upsert(
          {
            user_id: userId,
            daily_xp: dailyXp + xpAwarded,
            last_xp_date: today,
          },
          { onConflict: "user_id" }
        )
    }

    if (firstTimeCorrect) {
      await supabase.rpc("increment_streak", { user_id: userId })
      await supabase.rpc("increment_combo", { user_id: userId })
    } else {
      await supabase.rpc("reset_combo", { user_id: userId })
    }

    const segment = segmentId

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
          updated_at: new Date().toISOString(),
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
          mastered: false,
        })
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
      xpAwarded,
    })
  } catch (err) {
    console.error("SAVE ERROR:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
