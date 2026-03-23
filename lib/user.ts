import { supabase } from './supabase'

export async function isPro(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single()

    if (error || !data) return false
    return data.is_pro || false
  } catch (error) {
    console.error('Error checking pro status:', error)
    return false
  }
}

export async function setPro(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, is_pro: true })

    if (error) throw error
  } catch (error) {
    console.error('Error setting pro status:', error)
    throw error
  }
}

export async function getUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single()

    if (error || !data) return { isPro: false }
    return { isPro: data.is_pro || false }
  } catch (error) {
    console.error('Error getting user:', error)
    return { isPro: false }
  }
}
