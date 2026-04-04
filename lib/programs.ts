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
      { segment: 'genesis-1-3', label: 'Genesis 1–3' },
      { segment: 'genesis-4-6', label: 'Genesis 4–6' },
      { segment: 'genesis-7-9', label: 'Genesis 7–9' },
      { segment: 'genesis-10-12', label: 'Genesis 10–12' },
      { segment: 'genesis-13-15', label: 'Genesis 13–15' },
      { segment: 'genesis-16-18', label: 'Genesis 16–18' },
      { segment: 'genesis-19-21', label: 'Genesis 19–21' },
      { segment: 'genesis-22-24', label: 'Genesis 22–24' },
      { segment: 'genesis-25-27', label: 'Genesis 25–27' },
      { segment: 'genesis-28-30', label: 'Genesis 28–30' },
      { segment: 'genesis-31-33', label: 'Genesis 31–33' },
      { segment: 'genesis-34-36', label: 'Genesis 34–36' },
      { segment: 'genesis-37-39', label: 'Genesis 37–39' },
      { segment: 'genesis-40-42', label: 'Genesis 40–42' },
      { segment: 'genesis-43-46', label: 'Genesis 43–46' },
      { segment: 'genesis-47-50', label: 'Genesis 47–50' }
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
