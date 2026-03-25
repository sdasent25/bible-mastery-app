type SegmentPerformance = {
  answered: number;
  correct: number;
};

export type PerformanceStats = {
  totalAnswered: number;
  totalCorrect: number;
  bySegment: Record<string, SegmentPerformance>;
};

const PERFORMANCE_KEY = 'performance_stats_v1';

function getDefaultStats(): PerformanceStats {
  return {
    totalAnswered: 0,
    totalCorrect: 0,
    bySegment: {}
  };
}

export function getPerformanceStats(): PerformanceStats {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  const stored = localStorage.getItem(PERFORMANCE_KEY);
  if (!stored) {
    return getDefaultStats();
  }

  try {
    const parsed = JSON.parse(stored) as Partial<PerformanceStats>;
    return {
      totalAnswered: typeof parsed.totalAnswered === 'number' ? parsed.totalAnswered : 0,
      totalCorrect: typeof parsed.totalCorrect === 'number' ? parsed.totalCorrect : 0,
      bySegment: parsed.bySegment || {}
    };
  } catch {
    return getDefaultStats();
  }
}

export function recordAnswerPerformance(segmentId: string, isCorrect: boolean) {
  if (typeof window === 'undefined') return;

  const current = getPerformanceStats();
  const segment = current.bySegment[segmentId] || { answered: 0, correct: 0 };

  const updated: PerformanceStats = {
    totalAnswered: current.totalAnswered + 1,
    totalCorrect: current.totalCorrect + (isCorrect ? 1 : 0),
    bySegment: {
      ...current.bySegment,
      [segmentId]: {
        answered: segment.answered + 1,
        correct: segment.correct + (isCorrect ? 1 : 0)
      }
    }
  };

  localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(updated));
}
