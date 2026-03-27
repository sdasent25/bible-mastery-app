export function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

export function getDailyProgress() {
  const key = getTodayKey()
  const data = localStorage.getItem(`daily-${key}`)

  return data
    ? JSON.parse(data)
    : { count: 0, completed: false }
}

export function updateDailyProgress() {
  const key = getTodayKey()
  const data = getDailyProgress()

  const updated = {
    count: data.count + 1,
    completed: data.count + 1 >= 5
  }

  localStorage.setItem(`daily-${key}`, JSON.stringify(updated))

  return updated
}
