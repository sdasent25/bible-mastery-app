import { supabase } from "@/lib/supabase"

export async function saveOnboarding({
  userId,
  name,
  handle,
}: {
  userId: string
  name: string
  handle: string
}) {
  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      handle,
      onboarding_complete: true,
    })
    .eq("id", userId)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
