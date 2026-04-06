import { supabase } from "@/lib/supabase"
import type { GeneratedPlan } from "@/lib/planGenerator"

export type UserPlan = GeneratedPlan & {
  userId: string
}

type UserSettingsRow = {
  user_id: string
  timeline_days: number | null
  segments_per_day: number | null
  training_enabled: boolean | null
  estimated_days: number | null
}

export async function saveUserPlan(plan: {
  timelineDays: number
  segmentsPerDay: number
  trainingEnabled: boolean
  estimatedDays: number
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      timeline_days: plan.timelineDays,
      segments_per_day: plan.segmentsPerDay,
      training_enabled: plan.trainingEnabled,
      estimated_days: plan.estimatedDays,
    }, { onConflict: "user_id" })

  if (error) {
    console.error("Error saving user plan:", error)
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
    .select("user_id, timeline_days, segments_per_day, training_enabled, estimated_days")
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
    timelineDays: data.timeline_days ?? 365,
    segmentsPerDay: data.segments_per_day ?? 1,
    trainingEnabled: data.training_enabled === true,
    estimatedDays: data.estimated_days ?? 365,
  }
}
