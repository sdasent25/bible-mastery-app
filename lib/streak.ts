import { hasFreeze, useFreeze } from './freeze'

export function getStreak() {
  const streak = localStorage.getItem('streak')
  return streak ? parseInt(streak) : 0
}

export function getLastCompletedDate() {
  return localStorage.getItem('last-completed-date')
}

export function updateStreak(completedToday: boolean) {
  const today = new Date().toISOString().split('T')[0]
  const lastDate = getLastCompletedDate()
  let streak = getStreak()

  if (!completedToday) {
    if (hasFreeze()) {
      useFreeze()
      return streak
    } else {
      streak = 0
    }
  }

  if (lastDate === today) return streak

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().split('T')[0]

  if (lastDate === yesterdayKey) {
    streak += 1
  } else {
    streak = 1
  }

  localStorage.setItem('streak', streak.toString())
  localStorage.setItem('last-completed-date', today)

  return streak
}

export function hasCompletedToday() {
  const today = new Date().toISOString().split('T')[0]
  return getLastCompletedDate() === today
}

export function completeToday() {
  updateStreak(true)
}
