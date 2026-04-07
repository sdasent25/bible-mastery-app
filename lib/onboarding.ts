import { supabase } from "@/lib/supabase"

export async function saveOnboarding({
  userId,
  name,
  handle,
  goal,
  time_commitment,
}: {
  userId: string
  name: string
  handle: string
  goal: string
  time_commitment: string
}) {
  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      handle,
      goal,
      time_commitment,
      onboarding_complete: true,
    })
    .eq("id", userId)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
