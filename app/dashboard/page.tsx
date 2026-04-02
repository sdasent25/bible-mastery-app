'use client';

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { signOut } from '@/lib/auth';
import { getFriends, addFriend, generateInviteCode, type FriendLeaderboardEntry } from '@/lib/friends';
import { getStreak, hasCompletedToday } from '@/lib/streak';
import { getXp } from '@/lib/xp';
import { getSubscriptionStatus } from '@/lib/user';
import { getPerformanceStats, type PerformanceStats } from '@/lib/performance';
import { getDailyProgress } from '@/lib/daily';
import { hasClaimedReward } from '@/lib/rewards';
import { hasFreeze } from '@/lib/freeze';
import { getAchievements } from '@/lib/achievements';
import { getSession } from '@/lib/resume';
import { getDailyStats, getWeeklyStats } from '@/lib/stats';
import { getFamily, createFamily } from '@/lib/family';
import { supabase } from '@/lib/supabase';

const segments = [
  "genesis_1_3",
  "genesis_4_6",
  "genesis_7_9",
  "genesis_10_11"
];

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
  const router = useRouter();
  const [completedToday, setCompletedToday] = useState(false);
  const [xp, setXp] = useState(0);
  const [weeklyXp, setWeeklyXp] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [nextSegment, setNextSegment] = useState<string | null>(null);
  const [reviewCount] = useState(0);
  const [daily, setDaily] = useState({ count: 0, completed: false });
  const [streak, setStreak] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [freezeAvailable, setFreezeAvailable] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState({ xp: 0, sessions: 0 });
  const [weeklyStats, setWeeklyStats] = useState({ xp: 0, sessions: 0 });
  const [family, setFamily] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
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
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      console.log('USER ID:', data?.user?.id);
    }

    getUser();
  }, []);

  useEffect(() => {
    const fetchWeeklyXp = async () => {
      const fallback = [0, 0, 0, 0, 0, 0, 0];

      try {
        const res = await fetch("/api/analytics/weekly-xp");
        const data = await res.json();

        if (
          Array.isArray(data) &&
          data.length === 7 &&
          data.every((value) => typeof value === "number")
        ) {
          setWeeklyXp(data);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch weekly XP", error);
      }

      setWeeklyXp(fallback);
    };

    fetchWeeklyXp();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('currentSegment');
    if (saved) {
      queueMicrotask(() => setCurrentSegment(saved));
    }
  }, []);

  useEffect(() => {
    const f = getFamily();
    setFamily(f);
  }, []);

  useEffect(() => {
    setFriends(getFriends());
  }, []);

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
      const board: FriendLeaderboardEntry[] = [];
      setFriendLeaderboard(board);
    }

    loadFriendBoard();
  }, []);

  useEffect(() => {
    setStreak(getStreak());
    setRewardClaimed(hasClaimedReward());
    setFreezeAvailable(hasFreeze());
    setAchievements(getAchievements());
    setSession(getSession());
    setDailyStats(getDailyStats());
    setWeeklyStats(getWeeklyStats());
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from("user_segment_mastery")
        .select("segment, mastered");

      const masteryMap: Record<string, boolean> = {};
      data?.forEach((row: { segment: string; mastered: boolean }) => {
        masteryMap[row.segment] = row.mastered;
      });

      for (const seg of segments) {
        if (!masteryMap[seg]) {
          setNextSegment(seg);
          break;
        }
      }
    };

    fetchProgress();
  }, []);

  const level = Math.floor(xp / 100) + 1;
  const totalXp = xp;
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

  const getStreakMessage = () => {
    if (streak === 0) {
      return 'Start your streak today';
    } else if (streak === 1) {
      return 'Great start — keep going!';
    } else {
      return "You're building a strong habit — keep going!";
    }
  };

  const cardStyle =
    "bg-slate-900 hover:bg-slate-800 transition-all duration-200 p-5 rounded-xl text-white font-semibold text-lg shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-white/5";

  if (loadingPro) {
    return (
      <div className="p-6 text-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <div className="hidden w-64 border-r border-white/10 lg:block">
        <div className="p-6">
          <div className="sticky top-6">
            <h2 className="text-2xl font-bold">Bible Mastery</h2>
            <p className="mt-2 text-sm text-slate-400">
              Dashboard navigation
            </p>

            <div className="mt-8 space-y-4">
              <div
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer rounded-xl border border-blue-500/30 bg-blue-600/20 p-5 text-lg font-semibold text-white transition-all hover:bg-slate-800"
              >
                Home
              </div>

              <div
                onClick={() => router.push("/journey")}
                className="cursor-pointer rounded-xl border border-white/5 bg-slate-900 p-5 text-lg font-semibold text-white transition-all hover:bg-slate-800"
              >
                Journey
              </div>

              <div
                onClick={() => router.push("/quiz")}
                className="cursor-pointer rounded-xl border border-white/5 bg-slate-900 p-5 text-lg font-semibold text-white transition-all hover:bg-slate-800"
              >
                Training
              </div>

              <div
                onClick={() => router.push("/review")}
                className="cursor-pointer rounded-xl border border-white/5 bg-slate-900 p-5 text-lg font-semibold text-white transition-all hover:bg-slate-800"
              >
                Review
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-10 py-8">
        <div className="max-w-5xl">
          <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
          <div className="rounded-xl bg-slate-900 p-4 text-white shadow-[0_0_25px_rgba(59,130,246,0.15)]">
            <p className="text-sm text-slate-400">Level</p>
            <p className="text-2xl font-bold">Level {level}</p>
            <p className="text-sm text-slate-400 mt-1">
              XP: {totalXp} / {(level * 100)}
            </p>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(totalXp % 100) * 1}%` }}
              />
            </div>
          </div>
          {nextSegment && (
            <button
              onClick={() => router.push(`/quiz?segment=${nextSegment}`)}
              className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:bg-blue-500 hover:scale-[1.02] hover:shadow-blue-500/30"
            >
              Continue → {nextSegment.replace(/_/g, " ")}
            </button>
          )}

          <div className="mt-6 rounded-xl bg-slate-900 p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Weekly Progress
            </h2>

            <div className="flex items-end justify-between h-32 gap-2">
              {weeklyXp.map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="flex h-full w-full items-end rounded-md bg-slate-800">
                    <div
                      className="w-full bg-blue-500 rounded-md transition-all duration-500"
                      style={{ height: `${value * 2}px` }}
                    />
                  </div>

                  <span className="text-xs text-slate-400 mt-1">
                    {["S", "M", "T", "W", "T", "F", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div
              onClick={() => router.push("/journey")}
              className={cardStyle}
            >
              📖 Continue Journey
            </div>

            <div
              onClick={() => router.push("/quiz")}
              className={cardStyle}
            >
              🎮 Training Mode
            </div>

            <div
              onClick={() => router.push("/review")}
              className={cardStyle}
            >
              🧠 Review Weak Areas
            </div>

            <div
              onClick={() => router.push("/settings")}
              className={cardStyle}
            >
              ⚙️ Settings
            </div>
          </div>
        </div>
      </div>

      <div className="hidden w-80 flex-col gap-4 border-l border-white/5 p-6 xl:flex">
        <div className="bg-slate-900 p-5 rounded-xl border border-white/5">
          🔥 {streak} day streak
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-white/5">
          📊 Accuracy: {hasPerformanceData ? accuracy : 87}%
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-white/5">
          🎯 You're close to unlocking the next level
        </div>
      </div>
    </div>
  );
}
