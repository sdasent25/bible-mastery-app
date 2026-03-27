import { getTodayKey } from './daily'

export function hasClaimedReward() {
  const key = getTodayKey()
  return localStorage.getItem(`reward-${key}`) === 'true'
}

export function claimReward() {
  const key = getTodayKey()
  localStorage.setItem(`reward-${key}`, 'true')
}
