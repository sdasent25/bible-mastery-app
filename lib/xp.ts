import { supabase } from './supabase'

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

async function addWeeklyXp(userId: string, _userEmail: string | null | undefined, amount: number) {
  const weekStart = getCurrentWeekStart()

  const { data: existing, error: fetchError } = await supabase
    .from('weekly_xp')
    .select('xp')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle<{ xp: number | null }>()

  if (fetchError) {
    console.error('Error reading weekly XP:', fetchError)
    return
  }

  const nextXp = (existing?.xp || 0) + amount

  const { error: upsertError } = await supabase
    .from('weekly_xp')
    .upsert(
      {
        user_id: userId,
        week_start: weekStart,
        xp: nextXp
      },
      { onConflict: 'user_id,week_start' }
    )

  if (upsertError) {
    console.error('Error writing weekly XP:', upsertError)
  }
}

export async function getXp(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data, error } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', user.id)
      .single()

    if (error || !data) return 0
    return data.xp || 0
  } catch (error) {
    console.error('Error getting XP:', error)
    return 0
  }
}

export async function addXp(amount: number): Promise<number> {
  if (typeof amount !== 'number' || Number.isNaN(amount) || !Number.isFinite(amount) || amount <= 0) {
    return await getXp()
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const current = await getXp()
    const updated = current + amount

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, xp: updated })

    if (error) throw error

    // Keep a weekly running total for leaderboard ranking.
    await addWeeklyXp(user.id, user.email, amount)

    return updated
  } catch (error) {
    console.error('Error adding XP:', error)
    return await getXp()
  }
}
