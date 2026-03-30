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

export async function getMyFriends(): Promise<FriendRow[]> {
  return []
}

export async function getFriendLeaderboard(): Promise<FriendLeaderboardEntry[]> {
  return []
}

export async function addFriendship() {
  return
}

export async function addMutualFriendship() {
  return
}

export function getFriends() {
  return []
}

export function addFriend(name: string) {
  return [{ name, score: 0 }]
}

export function generateInviteCode() {
  return ""
}
