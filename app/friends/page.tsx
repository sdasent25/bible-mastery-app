'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getMyFriends, type FriendRow } from '@/lib/friends';
import { supabase } from '@/lib/supabase';

function toDisplayName(friend: FriendRow) {
  if (friend.friend_display && friend.friend_display.trim()) {
    return friend.friend_display;
  }

  return `Friend ${friend.friend_id.slice(0, 8)}`;
}

function formatJoinedDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString();
}

export default function FriendsPage() {
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        window.location.assign('/login');
        return;
      }

      setUserId(authData.user.id);
      const rows = await getMyFriends();
      setFriends(rows);
      setLoading(false);
    }

    load();
  }, []);

  const inviteLink = useMemo(() => {
    if (!userId || typeof window === 'undefined') return '';
    return `${window.location.origin}/signup?ref=${userId}`;
  }, [userId]);

  const handleCopyInvite = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch (error) {
      console.error('Error copying invite link:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-gray-700">Loading friends...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-xl bg-white p-5 shadow-md space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
          <p className="text-sm text-gray-600">Share this link to invite friends</p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 break-all">
            {inviteLink || 'Invite link unavailable'}
          </div>
          <button
            onClick={handleCopyInvite}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Invite a Friend
          </button>
        </header>

        <section className="rounded-xl bg-white p-4 shadow-md">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Your Friends</h2>

          {friends.length === 0 ? (
            <p className="text-sm text-gray-600">No friends added yet. Invite someone to get started.</p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={`${friend.user_id}-${friend.friend_id}`} className="rounded-lg border border-gray-200 px-3 py-3">
                  <p className="font-semibold text-gray-900">{toDisplayName(friend)}</p>
                  <p className="text-xs text-gray-600">Joined: {formatJoinedDate(friend.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <Link href="/dashboard" className="block">
          <button className="w-full rounded-xl bg-gray-700 p-4 font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </main>
  );
}
