export function getAchievements() {
  const data = localStorage.getItem('achievements')
  return data ? JSON.parse(data) : []
}

export function unlockAchievement(name: string) {
  const achievements = getAchievements()

  if (!achievements.includes(name)) {
    const updated = [...achievements, name]
    localStorage.setItem('achievements', JSON.stringify(updated))
    return true
  }

  return false
}
