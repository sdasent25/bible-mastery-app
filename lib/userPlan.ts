import { supabase } from "@/lib/supabase"
import type { GeneratedPlan } from "@/lib/planGenerator"

export type UserPlan = GeneratedPlan & {
  userId: string
}

type UserSettingsRow = {
  user_id: string
  reading_time: number | null
  segments_per_day: number | null
  training_enabled: boolean | null
  estimated_days: number | null
}

export async function saveUserPlan(plan: GeneratedPlan) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User must be signed in to save a plan.")
  }

  const payload = {
    user_id: user.id,
    reading_time: plan.timeline,
    segments_per_day: plan.segmentsPerDay,
    training_enabled: plan.trainingEnabled,
    estimated_days: plan.estimatedDays,
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" })

  if (error) {
    throw error
  }

  return {
    userId: user.id,
    ...plan,
  }
}

export async function getUserPlan(): Promise<UserPlan | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("user_id, reading_time, segments_per_day, training_enabled, estimated_days")
    .eq("user_id", user.id)
    .maybeSingle<UserSettingsRow>()

  if (error) {
    console.error("Error loading user plan:", error)
    return null
  }

  if (!data) {
    return null
  }

  return {
    userId: data.user_id,
    timelineDays: data.reading_time ?? 365,
    segmentsPerDay: data.segments_per_day ?? 1,
    trainingEnabled: data.training_enabled === true,
    estimatedDays: data.estimated_days ?? 365,
  }
}
