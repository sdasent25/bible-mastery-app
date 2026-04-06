import { supabase } from "@/lib/supabase"

export async function incrementDailyProgress() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("daily_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  if (error) {
    console.error("Error fetching daily progress:", error)
    return
  }

  if (data) {
    await supabase
      .from("daily_progress")
      .update({
        segments_completed: data.segments_completed + 1,
      })
      .eq("id", data.id)
  } else {
    await supabase
      .from("daily_progress")
      .insert({
        user_id: user.id,
        date: today,
        segments_completed: 1,
      })
  }
}
