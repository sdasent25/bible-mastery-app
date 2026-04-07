import { supabase } from "@/lib/supabase"

export async function saveOnboarding({
  userId,
  name,
  handle,
  goal,
  time_commitment,
  is_family,
}: {
  userId: string
  name: string
  handle: string
  goal: string
  time_commitment: string
  is_family: boolean
}) {
  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      handle,
      goal,
      time_commitment,
      is_family,
      onboarding_complete: true,
    })
    .eq("id", userId)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
