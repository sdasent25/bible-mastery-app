import { supabase } from "@/lib/supabase"

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day
  const start = new Date(now.setDate(diff))
  start.setHours(0, 0, 0, 0)
  return start.toISOString().split("T")[0]
}

export async function incrementWeeklyScore(amount = 1) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const weekStart = getWeekStart()

  const { data } = await supabase
    .from("weekly_scores")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle()

  if (data) {
    await supabase
      .from("weekly_scores")
      .update({ score: data.score + amount })
      .eq("id", data.id)
  } else {
    await supabase
      .from("weekly_scores")
      .insert({
        user_id: user.id,
        week_start: weekStart,
        score: amount,
      })
  }
}
