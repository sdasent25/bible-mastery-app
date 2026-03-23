import { supabase } from './supabase'

export async function getStreak(): Promise<{ lastCompletedDate: string | null; currentStreak: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { lastCompletedDate: null, currentStreak: 0 }

    const { data, error } = await supabase
      .from('profiles')
      .select('last_completed_date')
      .eq('id', user.id)
      .single()

    if (error || !data) return { lastCompletedDate: null, currentStreak: 0 }

    const lastCompletedDate = data.last_completed_date
    const today = new Date().toISOString().split('T')[0]
    const currentStreak = lastCompletedDate === today ? 1 : 0

    return { lastCompletedDate, currentStreak }
  } catch (error) {
    console.error('Error getting streak:', error)
    return { lastCompletedDate: null, currentStreak: 0 }
  }
}

export async function hasCompletedToday(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('profiles')
      .select('last_completed_date')
      .eq('id', user.id)
      .single()

    if (error || !data) return false

    const today = new Date().toISOString().split('T')[0]
    return data.last_completed_date === today
  } catch (error) {
    console.error('Error checking completion:', error)
    return false
  }
}

export async function completeToday(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, last_completed_date: today })

    if (error) throw error
  } catch (error) {
    console.error('Error completing today:', error)
  }
}
