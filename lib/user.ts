import { supabase } from './supabase'

export async function getUserPlan() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data } = await supabase
    .from('profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  return data?.plan_type || 'free'
}

export async function isPro() {
  const plan = await getUserPlan()
  return plan === 'pro' || plan === 'pro_plus'
}

export async function isProPlus() {
  const plan = await getUserPlan()
  return plan === 'pro_plus'
}

export async function setPro(plan = 'pro') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').upsert({
    id: user.id,
    plan_type: plan,
    is_pro: true
  })
}

export async function getUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('profiles')
      .select('plan_type,is_pro')
      .eq('id', user.id)
      .single()

    const planType = data?.plan_type || 'free'
    const proByPlan = planType === 'pro' || planType === 'pro_plus'

    return { isPro: proByPlan || data?.is_pro || false, planType }
  } catch (error) {
    console.error('Error getting user:', error)
    return { isPro: false, planType: 'free' }
  }
}
