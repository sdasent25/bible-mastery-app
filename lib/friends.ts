import { supabase } from './supabase'

export type FriendRow = {
  user_id: string
  friend_id: string
  friend_display: string | null
  created_at: string
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
