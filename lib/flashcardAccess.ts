import type { PlanType } from "@/lib/user"

export const FLASHCARD_ALLOWED_PLANS: PlanType[] = [
  "pro",
  "pro_plus",
  "family_pro",
  "family_pro_plus",
]

export const FLASHCARD_PAYWALL_COPY = {
  title: "Unlock Verse Memory",
  message: "Add your own Scripture, train recall, and build lasting memory through guided review.",
} as const

export function canAccessFlashcards(plan: PlanType | string | null | undefined): plan is PlanType {
  return FLASHCARD_ALLOWED_PLANS.includes(plan as PlanType)
}
