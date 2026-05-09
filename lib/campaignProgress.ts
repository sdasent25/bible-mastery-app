import { getProgramById, type Program } from "@/lib/programs"
import type { ProgramProgress } from "@/lib/programProgress"

export const WORLD_CAMPAIGN_PROGRAM_IDS = ["genesis"] as const

function getProgramOrNull(programId: string): Program | null {
  return getProgramById(programId)
}

export function getCompletedProgramSegmentCount(
  progress: ProgramProgress,
  totalSegments: number
) {
  if (totalSegments <= 0) return 0
  if (progress.completed) return totalSegments

  return Math.min(progress.currentSegmentIndex, totalSegments)
}

export function getCompletedProgramSegments(
  programId: string,
  progress: ProgramProgress
) {
  const program = getProgramOrNull(programId)

  if (!program) {
    return new Set<string>()
  }

  const completedCount = getCompletedProgramSegmentCount(
    progress,
    program.segments.length
  )

  return new Set(
    program.segments
      .slice(0, completedCount)
      .map((segment) => segment.segment)
  )
}

export function getCompletedWorldSegments(
  progressByProgram: Partial<Record<string, ProgramProgress>>
) {
  const completed = new Set<string>()

  for (const programId of WORLD_CAMPAIGN_PROGRAM_IDS) {
    const progress = progressByProgram[programId]

    if (!progress) continue

    for (const segment of getCompletedProgramSegments(programId, progress)) {
      completed.add(segment)
    }
  }

  return completed
}
