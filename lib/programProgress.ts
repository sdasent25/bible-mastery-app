import { supabase } from './supabase'

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
    .select('program_id, current_segment_index, completed, bonus_awarded')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .maybeSingle<ProgramProgressRow>()

  console.log("DB progress row:", data)

  if (error) {
    console.error('Error loading program progress:', error)
    return getDefaultProgress(programId)
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

async function saveProgramProgress(programId: string, progress: Omit<ProgramProgress, 'programId'>) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return getDefaultProgress(programId)
  }

  const payload = {
    user_id: userId,
    program_id: programId,
    current_segment_index: progress.currentSegmentIndex,
    completed: progress.completed,
    bonus_awarded: progress.bonusAwarded
  }

  const { error } = await supabase
    .from('user_program_progress')
    .upsert(payload, { onConflict: 'user_id,program_id' })

  if (error) {
    console.error('Error saving program progress:', error)
  }

  return {
    programId,
    ...progress
  }
}

export function getResumeSegmentIndex(progress: ProgramProgress, totalSegments: number) {
  if (totalSegments <= 0) return 0
  if (progress.completed) return totalSegments - 1

  return Math.min(progress.currentSegmentIndex, totalSegments - 1)
}

export async function completeProgramSegment(programId: string, totalSegments: number) {
  const existing = await getProgramProgress(programId)

  if (existing.completed) {
    return existing
  }

  const nextSegmentIndex = existing.currentSegmentIndex + 1
  const completed = nextSegmentIndex >= totalSegments

  return saveProgramProgress(programId, {
    currentSegmentIndex: completed ? totalSegments : nextSegmentIndex,
    completed,
    bonusAwarded: existing.bonusAwarded
  })
}

export async function markProgramBonusAwarded(programId: string) {
  const existing = await getProgramProgress(programId)
  if (existing.bonusAwarded) {
    return existing
  }

  return saveProgramProgress(programId, {
    currentSegmentIndex: existing.currentSegmentIndex,
    completed: existing.completed,
    bonusAwarded: true
  })
}
