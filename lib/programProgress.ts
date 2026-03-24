type ProgramProgress = {
  completedSegmentIndexes: number[];
  bonusAwarded: boolean;
};

const ACTIVE_PROGRAM_KEY = 'active_program_id';

function isBrowser() {
  return typeof window !== 'undefined';
}

function getProgressKey(programId: string) {
  return `program_progress_${programId}`;
}

function getDefaultProgress(): ProgramProgress {
  return {
    completedSegmentIndexes: [],
    bonusAwarded: false
  };
}

export function getProgramProgress(programId: string): ProgramProgress {
  if (!isBrowser()) {
    return getDefaultProgress();
  }

  const stored = localStorage.getItem(getProgressKey(programId));
  if (!stored) {
    return getDefaultProgress();
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ProgramProgress>;
    return {
      completedSegmentIndexes: Array.isArray(parsed.completedSegmentIndexes)
        ? parsed.completedSegmentIndexes.filter((value): value is number => typeof value === 'number')
        : [],
      bonusAwarded: parsed.bonusAwarded === true
    };
  } catch {
    return getDefaultProgress();
  }
}

function saveProgramProgress(programId: string, progress: ProgramProgress) {
  if (!isBrowser()) return;

  localStorage.setItem(getProgressKey(programId), JSON.stringify(progress));
}

export function startProgram(programId: string) {
  if (!isBrowser()) return;

  localStorage.setItem(ACTIVE_PROGRAM_KEY, programId);
}

export function getActiveProgramId(): string | null {
  if (!isBrowser()) return null;

  return localStorage.getItem(ACTIVE_PROGRAM_KEY);
}

export function clearActiveProgram(programId?: string) {
  if (!isBrowser()) return;

  const activeProgramId = getActiveProgramId();
  if (!programId || activeProgramId === programId) {
    localStorage.removeItem(ACTIVE_PROGRAM_KEY);
  }
}

export function markProgramSegmentComplete(programId: string, segmentIndex: number) {
  const progress = getProgramProgress(programId);
  if (progress.completedSegmentIndexes.includes(segmentIndex)) {
    return progress;
  }

  const nextProgress = {
    ...progress,
    completedSegmentIndexes: [...progress.completedSegmentIndexes, segmentIndex].sort((a, b) => a - b)
  };

  saveProgramProgress(programId, nextProgress);
  return nextProgress;
}

export function getNextProgramSegmentIndex(programId: string, totalSegments: number): number | null {
  const progress = getProgramProgress(programId);

  for (let index = 0; index < totalSegments; index += 1) {
    if (!progress.completedSegmentIndexes.includes(index)) {
      return index;
    }
  }

  return null;
}

export function markProgramBonusAwarded(programId: string) {
  const progress = getProgramProgress(programId);
  if (progress.bonusAwarded) {
    return progress;
  }

  const nextProgress = {
    ...progress,
    bonusAwarded: true
  };

  saveProgramProgress(programId, nextProgress);
  return nextProgress;
}

export function getCompletedLevels(programId: string) {
  return getProgramProgress(programId).completedSegmentIndexes;
}

export function completeLevel(programId: string, levelIndex: number) {
  markProgramSegmentComplete(programId, levelIndex);
}
