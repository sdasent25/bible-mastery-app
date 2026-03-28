export function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

export function getWeekKey() {
  const date = new Date()
  const week = Math.floor(date.getDate() / 7)
  return `${date.getFullYear()}-${date.getMonth()}-${week}`
}

export function updateStats(xp: number) {
  const todayKey = getTodayKey()
  const weekKey = getWeekKey()

  const daily = JSON.parse(localStorage.getItem(`stats-${todayKey}`) || '{}')
  const weekly = JSON.parse(localStorage.getItem(`stats-${weekKey}`) || '{}')

  const updatedDaily = {
    xp: (daily.xp || 0) + xp,
    sessions: (daily.sessions || 0) + 1
  }

  const updatedWeekly = {
    xp: (weekly.xp || 0) + xp,
    sessions: (weekly.sessions || 0) + 1
  }

  localStorage.setItem(`stats-${todayKey}`, JSON.stringify(updatedDaily))
  localStorage.setItem(`stats-${weekKey}`, JSON.stringify(updatedWeekly))
}

export function getDailyStats() {
  const key = getTodayKey()
  return JSON.parse(localStorage.getItem(`stats-${key}`) || '{ "xp": 0, "sessions": 0 }')
}

export function getWeeklyStats() {
  const key = getWeekKey()
  return JSON.parse(localStorage.getItem(`stats-${key}`) || '{ "xp": 0, "sessions": 0 }')
}
