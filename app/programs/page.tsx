'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { programs } from '@/lib/programs';
import { getSubscriptionStatus } from '@/lib/user';
import { getCompletedLevels, completeLevel } from '@/lib/programProgress';

function formatSegmentLabel(segment: string) {
  const [, range] = segment.split('-');
  if (!range) return segment;

  const parts = segment.split('-');
  if (parts.length < 3) return segment;

  return `Genesis ${parts[1]}-${parts[2]}`;
}

export default function ProgramsPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [completedByProgram, setCompletedByProgram] = useState<Record<string, number[]>>({});

  useEffect(() => {
    async function checkAccess() {
      const { isProPlus } = await getSubscriptionStatus();
      setHasAccess(isProPlus);
    }

    checkAccess();
  }, []);

  useEffect(() => {
    if (!hasAccess) return;

    const progress: Record<string, number[]> = {};
    for (const program of programs) {
      progress[program.id] = getCompletedLevels(program.id);
    }
    queueMicrotask(() => setCompletedByProgram(progress));
  }, [hasAccess]);

  const handleCompleteLevel = (programId: string, levelIndex: number) => {
    completeLevel(programId, levelIndex);

    setCompletedByProgram((prev) => {
      const existing = prev[programId] || [];
      if (existing.includes(levelIndex)) return prev;

      return {
        ...prev,
        [programId]: [...existing, levelIndex]
      };
    });
  };

  if (hasAccess === null) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
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
          <p className="text-gray-800">🔒 Training Programs are available on Pro+</p>
          <Link href="/upgrade" className="inline-block">
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Upgrade to Pro+
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Training Programs</h1>
          <p className="text-gray-700">Structured programs to build Bible mastery level by level.</p>
        </header>

        {programs.map((program) => (
          <section key={program.id} className="rounded-xl bg-white p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">{program.title}</h2>
              <p className="text-gray-700">{program.description}</p>
            </div>

            <div className="space-y-3">
              {program.levels.map((level, index) => {
                const completedLevels = completedByProgram[program.id] || [];
                const completed = completedLevels.includes(index);
                const unlocked = index === 0 || completedLevels.includes(index - 1);

                const rowClass = completed
                  ? 'border-green-200 bg-green-50'
                  : unlocked
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-100';

                return (
                  <div
                    key={level.segment}
                    className={`flex items-center justify-between rounded-lg border p-3 ${rowClass}`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {level.label} - {formatSegmentLabel(level.segment)}
                    </div>
                    <div className="flex items-center gap-2">
                      {completed ? (
                        <span className="text-xs font-semibold text-green-700">✓ Completed</span>
                      ) : unlocked ? (
                        <>
                          <Link href={`/quiz?segment=${level.segment.replace(/-/g, '_')}&difficulty=mixed`}>
                            <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                              Start Program
                            </button>
                          </Link>
                          <button
                            onClick={() => handleCompleteLevel(program.id, index)}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Mark Complete
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-gray-600">🔒 Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
