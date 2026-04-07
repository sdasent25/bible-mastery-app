export function getXpConfig(questionsPerDay: number) {
  if (questionsPerDay === 5) {
    return {
      perQuestion: 15,
      completionBonus: 45,
    }
  }

  if (questionsPerDay === 10) {
    return {
      perQuestion: 10,
      completionBonus: 20,
    }
  }

  return {
    perQuestion: 7,
    completionBonus: 15,
  }
}

export function getStreakBonus(streak: number) {
  if (streak >= 8) return 20
  if (streak >= 4) return 10
  if (streak >= 1) return 5
  return 0
}
