'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signOut } from '@/lib/auth';
import { getFriendLeaderboard, getFriends, addFriend, generateInviteCode, type FriendLeaderboardEntry } from '@/lib/friends';
import { getStreak, hasCompletedToday } from '@/lib/streak';
import { getXp } from '@/lib/xp';
import { getSubscriptionStatus } from '@/lib/user';
import { segments } from '@/lib/questions';
import { getPerformanceStats, type PerformanceStats } from '@/lib/performance';
import { getDailyProgress } from '@/lib/daily';
import { hasClaimedReward } from '@/lib/rewards';
import { hasFreeze } from '@/lib/freeze';
import { getAchievements } from '@/lib/achievements';
import { getSession } from '@/lib/resume';
import { getDailyStats, getWeeklyStats } from '@/lib/stats';
import { getFamily, createFamily } from '@/lib/family';
import { getAvatar, setAvatar } from '@/lib/avatar';

const segmentLabels: Record<string, string> = {
  'genesis-1-3': 'Genesis 1–3',
  'genesis-4-6': 'Genesis 4–6',
  'genesis-7-9': 'Genesis 7–9',
  'genesis-10-11': 'Genesis 10–11'
};

const shortSegmentLabels: Record<string, string> = {
  'genesis-1-3': 'Gen 1–3',
  'genesis-4-6': 'Gen 4–6',
  'genesis-7-9': 'Gen 7–9',
  'genesis-10-11': 'Gen 10–11'
};

function normalizeSegmentKey(segmentId: string) {
  return segmentId.replace(/_/g, '-');
}

function formatSegmentLabel(segmentId: string) {
  const normalized = normalizeSegmentKey(segmentId);
  return segmentLabels[normalized] || segmentId.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}


export default function Dashboard() {
  const [completedToday, setCompletedToday] = useState(false);
  const [xp, setXp] = useState(0);
  const [reviewCount] = useState(0);
  const [daily, setDaily] = useState({ count: 0, completed: false });
  const [family, setFamily] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [avatar, setUserAvatar] = useState('🙂');
  const [isProUser, setIsProUser] = useState(false);
  const [isProPlusUser, setIsProPlusUser] = useState(false);
  const [loadingPro, setLoadingPro] = useState(true);
  const [currentSegment, setCurrentSegment] = useState('genesis-1-3');
  const [friendLeaderboard, setFriendLeaderboard] = useState<FriendLeaderboardEntry[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    totalAnswered: 0,
    totalCorrect: 0,
    bySegment: {}
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      const completed = await hasCompletedToday();
      setCompletedToday(completed);

      const storedXp = await getXp();
      setXp(storedXp);

      setPerformanceStats(getPerformanceStats());
      setDaily(getDailyProgress());
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('currentSegment');
    if (saved) {
      queueMicrotask(() => setCurrentSegment(saved));
    }
  }, []);

  useEffect(() => {
    const f = getFamily()
    setFamily(f)
  }, [])

  useEffect(() => {
    setFriends(getFriends())
  }, [])

  useEffect(() => {
    setUserAvatar(getAvatar())
  }, [])

  useEffect(() => {
    if (!completedToday) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastAdvancedDate = localStorage.getItem('journeyAdvancedDate');
    if (lastAdvancedDate === today) return;

    const currentIndex = segments.indexOf(currentSegment);
    const next = segments[currentIndex + 1];

    if (next) {
      localStorage.setItem('currentSegment', next);
      queueMicrotask(() => setCurrentSegment(next));
    }

    localStorage.setItem('journeyAdvancedDate', today);
  }, [completedToday, currentSegment]);

  useEffect(() => {
    async function checkPro() {
      const { isPro, isProPlus } = await getSubscriptionStatus();
      setIsProUser(isPro);
      setIsProPlusUser(isProPlus);
      setLoadingPro(false);
    }
    checkPro();
  }, []);

  useEffect(() => {
    async function loadFriendBoard() {
      const board = await getFriendLeaderboard();
      setFriendLeaderboard(board);
    }

    loadFriendBoard();
  }, []);

  const level = Math.floor(xp / 100) + 1;
  const streak = typeof window !== 'undefined' ? getStreak() : 0;
  const rewardClaimed = typeof window !== 'undefined' ? hasClaimedReward() : false;
  const freezeAvailable = typeof window !== 'undefined' ? hasFreeze() : false;
  const achievements = typeof window !== 'undefined' ? getAchievements() : [];
  const session = typeof window !== 'undefined' ? getSession() : null;
  const dailyStats = typeof window !== 'undefined' ? getDailyStats() : { xp: 0, sessions: 0 };
  const weeklyStats = typeof window !== 'undefined' ? getWeeklyStats() : { xp: 0, sessions: 0 };
  const currentLevelXp = xp % 100;
  const levelProgress = (currentLevelXp / 100) * 100;
  const currentJourneyLabel = segmentLabels[currentSegment] || 'Genesis 1–3';
  const currentSegmentForQuiz = currentSegment.replace(/-/g, '_');
  const journeyCurrentIndex = segments.indexOf(currentSegment);
  const yourFriendRank = friendLeaderboard.findIndex((entry) => entry.isCurrentUser) + 1;
  const yourFriendEntry = friendLeaderboard.find((entry) => entry.isCurrentUser);
  const topFriendEntry = friendLeaderboard[0];
  const rankDiff = topFriendEntry && yourFriendEntry ? topFriendEntry.xp - yourFriendEntry.xp : 0;
  const hasPerformanceData = performanceStats.totalAnswered > 0;
  const accuracy = hasPerformanceData
    ? Math.round((performanceStats.totalCorrect / performanceStats.totalAnswered) * 100)
    : 0;
  const segmentPerformanceEntries = Object.entries(performanceStats.bySegment)
    .filter(([, value]) => value.answered > 0)
    .map(([segmentId, value]) => ({
      segmentId,
      accuracy: value.correct / value.answered,
      answered: value.answered
    }));
  const strongestArea = segmentPerformanceEntries.length
    ? segmentPerformanceEntries.reduce((best, current) =>
      current.accuracy > best.accuracy ? current : best
    )
    : null;
  const focusArea = segmentPerformanceEntries.length
    ? segmentPerformanceEntries.reduce((lowest, current) =>
      current.accuracy < lowest.accuracy ? current : lowest
    )
    : null;

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

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

  if (loadingPro) {
    return <div className="p-6 text-black">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-7">
      <div className="bg-white p-6 rounded-2xl shadow border mb-6 text-center">

        <div className="text-4xl mb-2">
          {avatar}
        </div>

        <p className="font-bold text-gray-900 mb-3">
          Your Avatar
        </p>

        <div className="flex justify-center gap-3">
          {['🙂', '🔥', '⚡', '📖', '💪'].map((a) => (
            <button
              key={a}
              onClick={() => {
                setUserAvatar(a)
                setAvatar(a)
              }}
              className="text-2xl"
            >
              {a}
            </button>
          ))}
        </div>

      </div>
      {session && (
        <div className="bg-white p-6 rounded-2xl shadow border mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Continue Training
          </h2>

          <p className="text-gray-900 mb-2">
            Resume your last session
          </p>

          <Link
            href={`/games/${session.game}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold inline-block"
          >
            Continue →
          </Link>
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Log Out
        </button>
      </div>
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

      <div className="bg-white p-6 rounded-2xl shadow border mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Streak
        </h2>

        <p className="text-2xl font-extrabold text-orange-600">
          🔥 {streak} day streak
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Daily Challenge
        </h2>

        <p className="text-gray-900 mb-2">
          {daily.count} / 5 completed
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(daily.count / 5) * 100}%` }}
          />
        </div>

        {daily.completed && (
          <p className="text-green-600 font-bold">
            🎉 Daily Complete!
          </p>
        )}

        {daily.completed && !rewardClaimed && (
          <p className="text-blue-600 font-bold mt-2">
            🎁 +50 XP Bonus Earned!
          </p>
        )}

        {daily.completed && rewardClaimed && (
          <p className="text-gray-600 font-medium mt-2">
            Reward claimed ✔
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Streak Protection
        </h2>

        {freezeAvailable ? (
          <p className="text-blue-600 font-bold">
            🛡️ Freeze available
          </p>
        ) : (
          <p className="text-gray-600">
            Freeze used
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Achievements
        </h2>

        {achievements.length === 0 ? (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
            <p className="text-gray-900 font-medium">
              No achievements yet
            </p>
            <p className="text-gray-700 text-sm mt-1">
              Keep training to unlock your first badge.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {achievements.map((a: any, i: number) => (
              <div
                key={i}
                className="bg-green-50 border border-green-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="text-green-800 font-bold">
                      {a.icon} {a.name}
                    </p>
                    <p className="text-green-700 text-sm">
                      Achievement unlocked
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border mt-6">

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Daily Recap
        </h2>

        <p className="text-gray-900">
          XP Today: {dailyStats.xp}
        </p>

        <p className="text-gray-900">
          Sessions: {dailyStats.sessions}
        </p>

      </div>

      <div className="bg-white p-6 rounded-2xl shadow border mt-6">

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Weekly Summary
        </h2>

        <p className="text-gray-900">
          XP This Week: {weeklyStats.xp}
        </p>

        <p className="text-gray-900">
          Sessions: {weeklyStats.sessions}
        </p>

      </div>

      <div className="bg-white p-6 rounded-2xl shadow border mt-6">

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Family
        </h2>

        <p className="text-gray-900 mb-3">
          Your household group (up to 6 members). Share progress and grow together.
        </p>

        {!family && (
          <button
            onClick={() => setFamily(createFamily('My Family'))}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            Create Family
          </button>
        )}

        {family && (
          <div>

            <p className="font-bold mb-3">{family.name}</p>

            <div className="space-y-2">
              {family.members.map((m: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between bg-gray-100 p-3 rounded-lg"
                >
                  <span>{m.name}</span>
                  <span className="font-bold">{m.score}</span>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      <div className="bg-white p-6 rounded-2xl shadow border mt-6">

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Friends
        </h2>

        <p className="text-gray-900 mb-3">
          Invite others to compete, compare scores, and stay motivated.
        </p>

        <button
          onClick={() => setInviteCode(generateInviteCode())}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold mb-3"
        >
          Generate Invite
        </button>

        {inviteCode && (
          <p className="mb-3 font-bold">
            Invite Code: {inviteCode}
          </p>
        )}

        <button
          onClick={() => setFriends(addFriend('New Friend'))}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold mb-3"
        >
          Add Friend (Demo)
        </button>

        <div className="space-y-2">
          {friends.map((f, i) => (
            <div key={i} className="flex justify-between bg-gray-100 p-3 rounded-lg">
              <span>{f.name}</span>
              <span className="font-bold">{f.score}</span>
            </div>
          ))}
        </div>

      </div>

      <section className="rounded-xl bg-slate-900 p-5 shadow-md text-white">
        <h2 className="text-lg font-bold">Your Performance</h2>
        {hasPerformanceData ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">Accuracy</p>
                <p className="mt-1 text-2xl font-bold">{accuracy}%</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">Total Questions Answered</p>
                <p className="mt-1 text-2xl font-bold">{performanceStats.totalAnswered}</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">Current Streak</p>
                <p className="mt-1 text-2xl font-bold">{streak} days</p>
              </div>
            </div>

            {(strongestArea || focusArea) && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-emerald-200">Strongest Area</p>
                  <p className="mt-1 text-base font-semibold text-emerald-50">
                    {strongestArea
                      ? `${formatSegmentLabel(strongestArea.segmentId)} (${Math.round(strongestArea.accuracy * 100)}%)`
                      : 'Not enough data yet'}
                  </p>
                </div>
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-amber-200">Focus Area</p>
                  <p className="mt-1 text-base font-semibold text-amber-50">
                    {focusArea
                      ? `${formatSegmentLabel(focusArea.segmentId)} (${Math.round(focusArea.accuracy * 100)}%)`
                      : 'Not enough data yet'}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-200">Start training to see your stats</p>
        )}
      </section>

      {/* Training Progress */}
      <section className="rounded-xl bg-white p-5 shadow-md">
        <h2 className="text-lg font-bold text-gray-900">🏃 Training Progress</h2>
        <p className="mt-1 text-sm text-gray-600">Advance through your training blocks</p>

        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-4 py-4">
            {segments.map((segment, index) => {
              const completed = index < journeyCurrentIndex;
              const current = index === journeyCurrentIndex;
              const locked = index > journeyCurrentIndex;

              const circleClass = completed
                ? 'bg-green-500 text-white'
                : current
                  ? 'bg-blue-600 text-white scale-110'
                  : 'bg-gray-300 text-gray-600';

              return (
                <div key={segment} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${circleClass}`}>
                      {completed ? '✓' : locked ? '🔒' : `${index + 1}`}
                    </div>
                    <div className="mt-2 text-xs text-center text-gray-700">{shortSegmentLabels[segment] || segment}</div>
                  </div>
                  {index < segments.length - 1 && (
                    <div className={`mx-3 flex-1 h-1 min-w-8 rounded ${completed ? 'bg-green-400' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Daily Quiz</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Current Journey: {currentJourneyLabel}</p>
        </div>

        {/* Today's Reading */}
        <a
          href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(currentJourneyLabel)}`}
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
                  <div className="text-sm text-gray-600">{currentJourneyLabel}</div>
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
          <Link href={`/quiz?segment=${currentSegmentForQuiz}&difficulty=${isProUser ? 'mixed' : 'easy'}`}>
            <button className="w-full rounded-xl bg-blue-700 p-5 text-white shadow-md transition hover:bg-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="flex items-center">
                <span className="text-3xl mr-4">🧠</span>
                <div className="text-left">
                  <div className="text-xl font-bold">Start Quiz</div>
                  <div className="text-sm text-blue-100">{isProUser ? '15 Questions' : '2 Questions'}</div>
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

      <section className="rounded-xl bg-white p-5 shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Training Programs</h2>
          <p className="mt-1 text-sm text-gray-600">Follow guided paths that walk you through scripture step by step.</p>
        </div>
        <Link href={isProUser ? '/programs' : '/upgrade'}>
          <button className="w-full rounded-xl bg-slate-900 p-4 text-white shadow-md transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500">
            <div className="flex items-center">
              <span className="mr-4 text-3xl">🗺️</span>
              <div className="text-left">
                <div className="text-lg font-bold">View Programs</div>
                <div className="text-sm text-slate-200">Structured learning for Pro and Pro+</div>
              </div>
            </div>
          </button>
        </Link>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Flashcard Training</h2>
          <p className="mt-1 text-sm text-gray-600">Memorize verses by recalling each reference one card at a time.</p>
        </div>
        <Link href="/flashcards">
          <button className="w-full rounded-xl bg-amber-500 p-4 text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <div className="flex items-center">
              <span className="mr-4 text-3xl">🗂️</span>
              <div className="text-left">
                <div className="text-lg font-bold">Start Training</div>
                <div className="text-sm text-amber-100">Pro+ verse memorization practice</div>
              </div>
            </div>
          </button>
        </Link>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Weekly Leaderboard</h2>
          <p className="mt-1 text-sm text-gray-600">See who is leading this week and where you rank.</p>
        </div>
        <Link href="/leaderboard">
          <button className="w-full rounded-xl bg-emerald-600 p-4 text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <div className="flex items-center">
              <span className="mr-4 text-3xl">🏅</span>
              <div className="text-left">
                <div className="text-lg font-bold">View Rankings</div>
                <div className="text-sm text-emerald-100">Top 50 for the current week</div>
              </div>
            </div>
          </button>
        </Link>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Friends</h2>
          <p className="mt-1 text-sm text-gray-600">Invite friends and see your social circle grow.</p>
        </div>
        <Link href="/friends">
          <button className="w-full rounded-xl bg-indigo-600 p-4 text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <div className="flex items-center">
              <span className="mr-4 text-3xl">👥</span>
              <div className="text-left">
                <div className="text-lg font-bold">View Friends</div>
                <div className="text-sm text-indigo-100">Share your invite link and connect</div>
              </div>
            </div>
          </button>
        </Link>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-md space-y-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Your Rank Among Friends</h2>
          {friendLeaderboard.length <= 1 ? (
            <p className="mt-1 text-sm text-gray-600">Invite friends to compete</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-700">Rank: #{yourFriendRank} of {friendLeaderboard.length}</p>
              <p className="text-sm text-gray-700">
                {rankDiff > 0
                  ? `${rankDiff} XP behind #1`
                  : 'You are currently leading your friends'}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Scholar Mode - Pro+ Exclusive */}
      {isProPlusUser && (
        <section className="rounded-xl bg-linear-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 p-5 shadow-md">
          <h2 className="text-lg font-bold text-gray-900">🏆 Scholar Mode</h2>
          <p className="mt-1 text-sm text-gray-600">Train anywhere. Master every part of scripture.</p>
          <Link href="/quiz?mode=scholar">
            <button className="mt-4 w-full rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 p-4 text-white shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <div className="flex items-center">
                <span className="text-3xl mr-4">⭐</span>
                <div className="text-left">
                  <div className="text-lg font-bold">Enter Scholar Mode</div>
                  <div className="text-sm text-purple-100">Questions from all segments at maximum difficulty</div>
                </div>
              </div>
            </button>
          </Link>
        </section>
      )}

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
