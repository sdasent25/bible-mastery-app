import { updateStreak } from './streak'
import { claimReward, hasClaimedReward } from './rewards'

export function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

export function getDailyProgress() {
  const key = getTodayKey()
  const data = localStorage.getItem(`daily-${key}`)

  return data
    ? JSON.parse(data)
    : { count: 0, completed: false, reward: false }
}

export function updateDailyProgress() {
  const key = getTodayKey()
  const data = getDailyProgress()

  const updated = {
    count: data.count + 1,
    completed: data.count + 1 >= 5,
    reward: false
  }

  localStorage.setItem(`daily-${key}`, JSON.stringify(updated))

  if (updated.completed && !hasClaimedReward()) {
    claimReward()
    updated.reward = true
  } else {
    updated.reward = false
  }

  if (updated.completed) {
    updateStreak(true)
  }

  return updated
}
