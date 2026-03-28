export type Achievement = {
  name: string
  icon: string
}

export function getAchievements(): Achievement[] {
  const data = localStorage.getItem('achievements')
  return data ? JSON.parse(data) : []
}

export function unlockAchievement(name: string, icon: string) {
  const achievements = getAchievements()

  const exists = achievements.find(a => a.name === name)

  if (!exists) {
    const updated = [...achievements, { name, icon }]
    localStorage.setItem('achievements', JSON.stringify(updated))
    return true
  }

  return false
}
