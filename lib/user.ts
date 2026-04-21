import { supabase } from './supabase'

export type PlanType =
  | "free"
  | "pro"
  | "pro_plus"
  | "family_pro"
  | "family_pro_plus"

type AccessPlanRow = {
  final_plan?: PlanType | null
}

type SubscriptionStatus = {
  plan: PlanType
  isPro: boolean
  isProPlus: boolean
}

function getPlanFromAccess(access: AccessPlanRow | null): PlanType {
  const plan = access?.final_plan || 'free'
  return plan === "pro" ||
    plan === "pro_plus" ||
    plan === "family_pro" ||
    plan === "family_pro_plus"
    ? plan
    : "free"
}

export function getPlanFlags(plan: PlanType): Pick<SubscriptionStatus, 'isPro' | 'isProPlus'> {
  const isPro =
    plan === 'pro' ||
    plan === 'pro_plus' ||
    plan === 'family_pro' ||
    plan === 'family_pro_plus'
  const isProPlus = plan === 'pro_plus' || plan === 'family_pro_plus'

  return { isPro, isProPlus }
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { plan: 'free', isPro: false, isProPlus: false }
  }

  const { data: access } = await supabase
    .from('user_access')
    .select('final_plan')
    .eq('user_id', user.id)
    .single()

  console.log("FINAL PLAN:", access?.final_plan)

  const plan = getPlanFromAccess(access)
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

    const { data: access } = await supabase
      .from('user_access')
      .select('final_plan')
      .maybeSingle()

    console.log("FINAL PLAN:", access?.final_plan)

    const planType = getPlanFromAccess(access)
    const { isPro, isProPlus } = getPlanFlags(planType)

    return { isPro, isProPlus, planType }
  } catch (error) {
    console.error('Error getting user:', error)
    return { isPro: false, isProPlus: false, planType: 'free' as PlanType }
  }
}
