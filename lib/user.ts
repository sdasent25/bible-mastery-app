import { supabase } from './supabase'

export type PlanType = 'free' | 'pro' | 'pro_plus'

type ProfilePlanRow = {
  plan_type?: PlanType | null
}

type SubscriptionStatus = {
  plan: PlanType
  isPro: boolean
  isProPlus: boolean
}

function getPlanFromProfile(profile: ProfilePlanRow | null): PlanType {
  const plan = profile?.plan_type || 'free'
  return plan === 'pro' || plan === 'pro_plus' ? plan : 'free'
}

export function getPlanFlags(plan: PlanType): Pick<SubscriptionStatus, 'isPro' | 'isProPlus'> {
  const isPro = plan === 'pro' || plan === 'pro_plus'
  const isProPlus = plan === 'pro_plus'

  return { isPro, isProPlus }
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { plan: 'free', isPro: false, isProPlus: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  const plan = getPlanFromProfile(profile)
  const { isPro, isProPlus } = getPlanFlags(plan)

  return { plan, isPro, isProPlus }
}

export async function getUserPlan() {
  const { plan } = await getSubscriptionStatus()
  return plan
}

export async function isPro() {
  const { isPro } = await getSubscriptionStatus()
  return isPro
}

export async function isProPlus() {
  const { isProPlus } = await getSubscriptionStatus()
  return isProPlus
}

export async function setPro(plan: 'pro' | 'pro_plus' = 'pro') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const nextPlan = plan === 'pro_plus' ? 'pro_plus' : 'pro'

  await supabase.from('profiles').upsert({
    id: user.id,
    plan_type: nextPlan
  })
}

export async function getUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', user.id)
      .single()

    const planType = getPlanFromProfile(profile)
    const { isPro, isProPlus } = getPlanFlags(planType)

    return { isPro, isProPlus, planType }
  } catch (error) {
    console.error('Error getting user:', error)
    return { isPro: false, isProPlus: false, planType: 'free' as PlanType }
  }
}
