export type GeneratedPlan = {
  readingTime: number
  segmentsPerDay: number
  trainingEnabled: boolean
  estimatedDays: number
}

export function generatePlan(readingTime: number, trainingEnabled: boolean): GeneratedPlan {
  const normalizedReadingTime = readingTime >= 20 ? 20 : readingTime

  let segmentsPerDay = 1

  if (normalizedReadingTime === 15) {
    segmentsPerDay = 1.5
  }

  if (normalizedReadingTime === 20) {
    segmentsPerDay = 2
  }

  const totalSegments = 396
  const days = totalSegments / segmentsPerDay

  return {
    readingTime: normalizedReadingTime,
    segmentsPerDay,
    trainingEnabled,
    estimatedDays: Math.round(days),
  }
}
