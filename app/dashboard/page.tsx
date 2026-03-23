'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getStreak, hasCompletedToday } from '@/lib/streak';
import { getXp } from '@/lib/xp';
import { isPro } from '@/lib/user';

export default function Dashboard() {
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [xp, setXp] = useState(0);
  const [reviewCount] = useState(0);
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      const streakData = await getStreak();
      setStreak(streakData.currentStreak);

      const completed = await hasCompletedToday();
      setCompletedToday(completed);

      const storedXp = await getXp();
      setXp(storedXp);
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    async function checkPro() {
      const result = await isPro();
      setIsProUser(result);
    }
    checkPro();
  }, []);

  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const levelProgress = (currentLevelXp / 100) * 100;

  // Determine streak message
  const getStreakMessage = () => {
    if (streak === 0) {
      return 'Start your streak today';
    } else if (streak === 1) {
      return 'Great start — keep going!';
    } else {
      return 'You\'re building a strong habit — keep going!';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-7">
      {/* Streak Banner */}
      <div className="rounded-xl bg-linear-to-r from-orange-500 to-red-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-center mb-3">
          <span className="text-3xl" aria-hidden="true">🔥</span>
          <span className="ml-3 text-2xl font-bold">{streak} Day Streak</span>
        </div>
        <div className="text-center text-sm font-medium">
          {getStreakMessage()}
        </div>
      </div>

      {/* Your Progress */}
      <section className="rounded-xl bg-white p-5 shadow-md">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Your Progress</h2>
        <div className="mb-3 flex items-end justify-between">
          <div className="text-3xl font-extrabold text-gray-900">Level {level}</div>
          <div className="text-base font-semibold text-gray-700">{currentLevelXp} / 100 XP</div>
        </div>
        <div className="h-4 w-full rounded-full bg-gray-200">
          <div className="h-4 rounded-full bg-blue-600 transition-all" style={{ width: `${levelProgress}%` }} />
        </div>
      </section>

      {/* Daily Quiz */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Daily Quiz</h2>
        {/* Today's Reading */}
        <a
          href="https://www.biblegateway.com/passage/?search=Genesis+1-3"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <button className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-start justify-between gap-3 sm:items-center">
              <div className="flex items-center">
                <span className="text-3xl mr-4">📖</span>
                <div className="text-left">
                  <div className="text-lg font-semibold text-gray-900">Today&apos;s Reading</div>
                  <div className="text-sm text-gray-600">Genesis 1–3</div>
                  <div className="mt-1 text-xs text-gray-500">Read today&apos;s passage before taking your quiz</div>
                </div>
              </div>
              <div>
                <div className="ml-2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                  Open Reading
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">Opens in a new tab</div>
          </button>
        </a>

        {!completedToday ? (
          <Link href={`/quiz?segment=genesis_1_3&difficulty=${isProUser ? 'mixed' : 'easy'}`}>
            <button className="w-full rounded-xl bg-blue-700 p-5 text-white shadow-md transition hover:bg-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="flex items-center">
                <span className="text-3xl mr-4">🧠</span>
                <div className="text-left">
                  <div className="text-xl font-bold">Start Quiz</div>
                  <div className="text-sm text-blue-100">5 Questions</div>
                </div>
              </div>
            </button>
          </Link>
        ) : (
          <button disabled className="w-full cursor-not-allowed rounded-xl bg-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <span className="text-3xl mr-4">🧠</span>
              <div className="text-left">
                <div className="text-lg font-semibold text-gray-500">Daily Complete ✅</div>
                <div className="text-sm text-gray-500">Come back tomorrow for a new quiz</div>
              </div>
            </div>
          </button>
        )}
      </section>

      {/* Review */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Review</h2>
        <button className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center">
            <span className="text-3xl mr-4">🔁</span>
            <div className="text-left">
              <div className="text-lg font-semibold text-gray-900">Review Questions</div>
              {reviewCount > 0 ? (
                <div className="text-sm text-gray-600">{reviewCount} Questions Ready</div>
              ) : (
                <div className="text-sm text-gray-600">No review items yet. Finish a quiz to unlock review.</div>
              )}
            </div>
          </div>
        </button>

        {/* Memory Practice */}
        <button className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center">
            <span className="text-3xl mr-4">✍️</span>
            <div className="text-left">
              <div className="text-lg font-semibold text-gray-900">Memory Practice</div>
              <div className="text-sm text-gray-600">2 Verses Ready</div>
            </div>
          </div>
        </button>
      </section>

      {/* Bottom Section - Leaderboard Preview */}
      <section className="rounded-xl bg-white p-5 shadow-md">
        <h2 className="mb-2 text-lg font-bold text-center text-gray-900">Leaderboard</h2>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div className="h-3 rounded-full bg-green-600" style={{ width: '75%' }}></div>
        </div>
        <div className="mt-2 text-center text-sm text-gray-700">75% Complete</div>
      </section>
      </div>
    </div>
  );
}