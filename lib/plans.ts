export type DisplayPlan =
  | "free"
  | "pro"
  | "pro_plus"
  | "family_pro"
  | "family_pro_plus"

export function getPlanDisplayName(plan: string | null | undefined): string {
  switch (plan) {
    case "pro":
      return "Pro"
    case "pro_plus":
      return "Pro+"
    case "family_pro":
      return "Family Pro"
    case "family_pro_plus":
      return "Family Pro+"
    case "free":
    default:
      return "Free"
  }
}

export function isFamilyPlan(plan: string | null | undefined): boolean {
  return plan === "family_pro" || plan === "family_pro_plus"
}

export function getPlanMemberLabel(plan: string | null | undefined): string {
  switch (plan) {
    case "pro":
      return "Pro Member"
    case "pro_plus":
      return "Pro+ Member"
    case "family_pro":
      return "Family Pro Member"
    case "family_pro_plus":
      return "Family Pro+ Member"
    case "free":
    default:
      return "Faith Focus"
  }
}
