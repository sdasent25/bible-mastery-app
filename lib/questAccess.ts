export const QUEST_ALLOWED_PLANS = ["pro_plus", "family_pro_plus"] as const

export function isQuestPlan(plan: string) {
  return QUEST_ALLOWED_PLANS.includes(
    plan as (typeof QUEST_ALLOWED_PLANS)[number]
  )
}
