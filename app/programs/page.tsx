'use client';

import { useEffect, useState } from 'react';
import { getProgramById, programs, toQuizSegmentId } from '@/lib/programs';
import { getSubscriptionStatus } from '@/lib/user';
import { getNextProgramSegmentIndex, getProgramProgress, startProgram } from '@/lib/programProgress';

export default function ProgramsPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const { isPro } = await getSubscriptionStatus();
      setHasAccess(isPro);
    }

    checkAccess();
  }, []);

  const handleStartProgram = (programId: string) => {
    const program = getProgramById(programId);
    if (!program) return;

    const nextIndex = getNextProgramSegmentIndex(programId, program.segments.length) ?? 0;
    const nextSegment = program.segments[nextIndex];

    startProgram(programId);
    window.location.assign(`/quiz?program=${programId}&segment=${toQuizSegmentId(nextSegment.segment)}`);
  };

  if (hasAccess === null) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-700">Loading programs...</p>
        </div>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow-md space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Training Programs</h1>
          <p className="text-gray-700">Training Programs are available on Pro and Pro+.</p>
          <button
            onClick={() => window.location.assign('/upgrade')}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upgrade to Unlock Programs
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Training Programs</h1>
          <p className="text-gray-700">Follow structured learning paths and move segment by segment with clear next steps.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {programs.map((program) => {
            const progress = getProgramProgress(program.id);
            const nextIndex = getNextProgramSegmentIndex(program.id, program.segments.length);
            const completedCount = progress.completedSegmentIndexes.length;
            const isComplete = nextIndex === null;
            const nextSegment = nextIndex !== null ? program.segments[nextIndex] : null;

            return (
              <section key={program.id} className="rounded-xl bg-white p-6 shadow-md space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-gray-900">{program.title}</h2>
                  <p className="text-gray-700">{program.description}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {isComplete ? 'Program complete' : `Next segment: ${nextSegment?.label}`}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {completedCount} of {program.segments.length} segments completed
                  </p>
                </div>

                <div className="space-y-3">
                  {program.segments.map((programSegment, index) => {
                    const completed = index < completedCount;
                    const current = index === completedCount && !isComplete;

                    const rowClass = completed
                      ? 'border-green-200 bg-green-50'
                      : current
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-100';

                    return (
                      <div key={programSegment.segment} className={`rounded-lg border p-3 ${rowClass}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{programSegment.label}</p>
                            <p className="text-xs text-gray-600">
                              {completed ? 'Completed' : current ? 'Ready now' : 'Locked until previous segment is complete'}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">
                            {completed ? '✓ Done' : current ? 'Next' : '🔒 Locked'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleStartProgram(program.id)}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isComplete ? 'Restart Program' : completedCount > 0 ? 'Continue Program' : 'Start Program'}
                </button>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
