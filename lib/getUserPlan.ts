import { createClient } from "@/lib/supabase/client"

export async function getUserPlan() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return "free"

  // Use user_access view as the source of truth for final plan resolution.
  const { data, error } = await supabase
    .from("user_access")
    .select("final_plan")
    .eq("user_id", user.id)
    .single()

  if (error || !data) return "free"

  return data.final_plan || "free"
}
