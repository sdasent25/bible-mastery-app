export type ProgramSegment = {
  segment: string;
  label: string;
};

export type Program = {
  id: string;
  title: string;
  description: string;
  segments: ProgramSegment[];
};

export const programs: Program[] = [
  {
    id: 'genesis',
    title: 'Genesis Program',
    description: 'Start at the beginning of scripture.',
    segments: [
      { segment: 'genesis-1-3', label: 'Genesis 1-3' },
      { segment: 'genesis-4-6', label: 'Genesis 4-6' },
      { segment: 'genesis-7-9', label: 'Genesis 7-9' }
    ]
  },
  {
    id: 'origins',
    title: 'Origins Path',
    description: 'Follow the early story of creation, judgment, and renewal.',
    segments: [
      { segment: 'genesis-4-6', label: 'Genesis 4-6' },
      { segment: 'genesis-7-9', label: 'Genesis 7-9' },
      { segment: 'genesis-10-11', label: 'Genesis 10-11' }
    ]
  }
];

export function getProgramById(programId: string | null | undefined): Program | null {
  if (!programId) return null;

  return programs.find((program) => program.id === programId) || null;
}

export function toQuizSegmentId(segment: string): string {
  return segment.replace(/-/g, '_');
}
