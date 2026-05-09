import type { PlanType } from "@/lib/user"

export const FLASHCARD_ALLOWED_PLANS: PlanType[] = [
  "pro",
  "pro_plus",
  "family_pro",
  "family_pro_plus",
]

export const FLASHCARD_PAYWALL_COPY = {
  title: "Unlock Scripture Memory Training",
  message: "Create verse cards, train recall, and strengthen retention.",
} as const

export function canAccessFlashcards(plan: PlanType | string | null | undefined): plan is PlanType {
  return FLASHCARD_ALLOWED_PLANS.includes(plan as PlanType)
}
