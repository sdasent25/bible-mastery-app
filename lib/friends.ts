import { supabase } from './supabase'

export type FriendRow = {
  user_id: string
  friend_id: string
  friend_display: string | null
  created_at: string
}

export type FriendLeaderboardEntry = {
  userId: string
  name: string
  xp: number
  isCurrentUser: boolean
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentWeekStart(): string {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return formatDateLocal(weekStart)
}

export async function addFriendship(
  userId: string,
  friendId: string,
  friendDisplay?: string | null
) {
  if (!userId || !friendId || userId === friendId) {
    return
  }

  const { error } = await supabase
    .from('friendships')
    .upsert(
      {
        user_id: userId,
        friend_id: friendId,
        friend_display: friendDisplay || null
      },
      { onConflict: 'user_id,friend_id' }
    )

  if (error) {
    console.error('Error adding friendship:', error)
  }
}

export async function addMutualFriendship(
  newUserId: string,
  refUserId: string,
  newUserEmail?: string | null,
  refUserEmail?: string | null
) {
  if (!newUserId || !refUserId || newUserId === refUserId) {
    return
  }

  await Promise.all([
    addFriendship(newUserId, refUserId, refUserEmail || 'Friend'),
    addFriendship(refUserId, newUserId, newUserEmail || 'Friend')
  ])
}

export async function getMyFriends(): Promise<FriendRow[]> {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('friendships')
    .select('user_id, friend_id, friend_display, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading friends:', error)
    return []
  }

  return (data || []) as FriendRow[]
}

export async function getFriendLeaderboard(): Promise<FriendLeaderboardEntry[]> {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) {
    return []
  }

  const friends = await getMyFriends()
  const weekStart = getCurrentWeekStart()

  const userIds = [user.id, ...friends.map((friend) => friend.friend_id)]
  const uniqueUserIds = Array.from(new Set(userIds))

  const { data: weeklyRows, error } = await supabase
    .from('weekly_xp')
    .select('user_id, xp')
    .eq('week_start', weekStart)
    .in('user_id', uniqueUserIds)

  if (error) {
    console.error('Error loading friend leaderboard weekly xp:', error)
  }

  const xpByUser = new Map<string, number>()
  for (const row of (weeklyRows || []) as Array<{ user_id: string; xp: number | null }>) {
    xpByUser.set(row.user_id, row.xp || 0)
  }

  const entries: FriendLeaderboardEntry[] = [
    {
      userId: user.id,
      name: 'You',
      xp: xpByUser.get(user.id) || 0,
      isCurrentUser: true
    },
    ...friends.map((friend) => ({
      userId: friend.friend_id,
      name: friend.friend_display || `Friend ${friend.friend_id.slice(0, 8)}`,
      xp: xpByUser.get(friend.friend_id) || 0,
      isCurrentUser: false
    }))
  ]

  entries.sort((a, b) => b.xp - a.xp)
  return entries
}

export function getFriends() {
  const data = localStorage.getItem('friends')
  return data ? JSON.parse(data) : []
}

export function addFriend(name: string) {
  const friends = getFriends()

  const updated = [...friends, { name, score: 0 }]

  localStorage.setItem('friends', JSON.stringify(updated))
  return updated
}

export function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8)
}
