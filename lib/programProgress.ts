import { createClient } from "@/lib/supabase/client"
import { getStreak } from "@/lib/streak"
import { supabase } from './supabase'
import { getUserPlan } from "@/lib/userPlan"
import { getXpConfig, getStreakBonus } from "@/lib/xpEngine"

export type ProgramProgress = {
  programId: string;
  currentSegmentIndex: number;
  completed: boolean;
  bonusAwarded: boolean;
}

type ProgramProgressRow = {
  program_id: string;
  current_segment_index: number | null;
  completed: boolean | null;
  bonus_awarded: boolean | null;
}

function getDefaultProgress(programId: string): ProgramProgress {
  return {
    programId,
    currentSegmentIndex: 0,
    completed: false,
    bonusAwarded: false
  }
}

function mapRowToProgress(programId: string, row?: ProgramProgressRow | null): ProgramProgress {
  if (!row) {
    return getDefaultProgress(programId)
  }

  return {
    programId,
    currentSegmentIndex: typeof row.current_segment_index === 'number' ? row.current_segment_index : 0,
    completed: row.completed === true,
    bonusAwarded: row.bonus_awarded === true
  }
}

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getProgramProgress(programId: string): Promise<ProgramProgress> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return getDefaultProgress(programId)
  }

  const { data, error } = await supabase
    .from('user_program_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .maybeSingle()

  console.log("DB progress row:", data)

  if (error && error.code !== "PGRST116") {
    console.error('Error loading program progress:', error)
  }

  return mapRowToProgress(programId, data)
}

export async function getProgramsProgress(programIds: string[]): Promise<Record<string, ProgramProgress>> {
  const defaults = Object.fromEntries(programIds.map((programId) => [programId, getDefaultProgress(programId)]))
  const userId = await getCurrentUserId()

  if (!userId || programIds.length === 0) {
    return defaults
  }

  const { data, error } = await supabase
    .from('user_program_progress')
    .select('program_id, current_segment_index, completed, bonus_awarded')
    .eq('user_id', userId)
    .in('program_id', programIds)

  if (error) {
    console.error('Error loading programs progress:', error)
    return defaults
  }

  const mapped = { ...defaults }

  for (const row of (data || []) as ProgramProgressRow[]) {
    mapped[row.program_id] = mapRowToProgress(row.program_id, row)
  }

  return mapped
}

export function getResumeSegmentIndex(progress: ProgramProgress, totalSegments: number) {
  if (totalSegments <= 0) return 0
  if (progress.completed) return totalSegments - 1

  return Math.min(progress.currentSegmentIndex, totalSegments - 1)
}

export async function completeSegment() {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("User not found")
    return { success: false }
  }

  const { data, error } = await supabase.rpc("complete_segment")

  if (error) {
    console.error("Error completing segment:", error)
    return { success: false }
  }

  if (data === false) {
    return {
      success: false,
      limitReached: true,
    }
  }

  const userPlan = await getUserPlan()
  const questionsPerDay = userPlan?.segmentsPerDay ?? 10
  const currentStreak = typeof window !== "undefined" ? getStreak() : 0
  const { completionBonus } = getXpConfig(questionsPerDay)
  const streakBonus = getStreakBonus(currentStreak)
  const totalXp = completionBonus + streakBonus

  await supabase.rpc("increment_xp", {
    amount: totalXp,
  })

  return {
    success: true,
  }
}
