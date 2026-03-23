import { supabase } from './supabase'

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
    return updated
  } catch (error) {
    console.error('Error adding XP:', error)
    return await getXp()
  }
}