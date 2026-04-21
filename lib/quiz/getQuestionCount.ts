export function getQuestionCount(plan: string, depth?: number) {
  if (plan === "free") return 2

  if (plan === "pro" || plan === "family_pro") {
    return 10
  }

  if (plan === "pro_plus" || plan === "family_pro_plus") {
    if (depth && [5, 10, 15].includes(depth)) {
      return depth
    }
    return 10
  }

  return 2
}
