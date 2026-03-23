'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { programs } from '@/lib/programs';
import { isProPlus } from '@/lib/user';

function formatSegmentLabel(segment: string) {
  const [, range] = segment.split('-');
  if (!range) return segment;

  const parts = segment.split('-');
  if (parts.length < 3) return segment;

  return `Genesis ${parts[1]}-${parts[2]}`;
}

export default function ProgramsPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const result = await isProPlus();
      setHasAccess(result);
    }

    checkAccess();
  }, []);

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
                const unlocked = index === 0;
                return (
                  <div
                    key={level.segment}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      unlocked ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-100'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {level.label} - {formatSegmentLabel(level.segment)}
                    </div>
                    {unlocked ? (
                      <Link href={`/quiz?segment=${level.segment.replace(/-/g, '_')}&difficulty=mixed`}>
                        <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          Start Program
                        </button>
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-gray-600">Locked</span>
                    )}
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
