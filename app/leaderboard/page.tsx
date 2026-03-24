'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type LeaderboardRow = {
  user_id: string;
  user_display: string | null;
  xp: number;
};

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentWeekStart(): string {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return formatDateLocal(weekStart);
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [weekStart, setWeekStart] = useState('');

  useEffect(() => {
    async function loadLeaderboard() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        window.location.assign('/login');
        return;
      }

      const currentWeekStart = getCurrentWeekStart();
      setWeekStart(currentWeekStart);

      const { data, error } = await supabase
        .from('weekly_xp')
        .select('user_id, user_display, xp')
        .eq('week_start', currentWeekStart)
        .order('xp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading leaderboard:', error);
        setRows([]);
      } else {
        setRows((data || []) as LeaderboardRow[]);
      }

      setLoading(false);
    }

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-gray-700">Loading weekly leaderboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-xl bg-white p-5 shadow-md">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-600">Current week starting: {weekStart}</p>
        </header>

        {rows.length === 0 ? (
          <section className="rounded-xl bg-white p-6 text-center shadow-md">
            <p className="text-lg font-semibold text-gray-900">No rankings yet for this week</p>
            <p className="mt-2 text-sm text-gray-600">Complete quizzes to be the first on the board.</p>
          </section>
        ) : (
          <section className="rounded-xl bg-white p-4 shadow-md">
            <div className="grid grid-cols-[64px_1fr_90px] gap-3 border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span>Rank</span>
              <span>User</span>
              <span className="text-right">XP</span>
            </div>
            <div>
              {rows.map((row, index) => (
                <div key={`${row.user_id}-${index}`} className="grid grid-cols-[64px_1fr_90px] gap-3 border-b border-gray-100 px-3 py-3 last:border-b-0">
                  <span className="font-bold text-gray-900">#{index + 1}</span>
                  <span className="truncate text-gray-800">{row.user_display || 'User'}</span>
                  <span className="text-right font-semibold text-emerald-700">{row.xp}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <Link href="/dashboard" className="block">
          <button className="w-full rounded-xl bg-gray-700 p-4 font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </main>
  );
}
