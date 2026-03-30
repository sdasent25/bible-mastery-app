'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signOut } from '@/lib/auth';
import { getFriends, addFriend, generateInviteCode, type FriendLeaderboardEntry } from '@/lib/friends';
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
import { supabase } from '@/lib/supabase';

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

  const level = Math.floor(xp / 100) + 1;
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

  if (loadingPro) {
    return (
      <div className="p-6 text-black">
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Test</h1>
    </div>
  );
}
