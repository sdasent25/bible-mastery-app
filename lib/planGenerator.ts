export type GeneratedPlan = {
  readingTime: number
  segmentsPerDay: number
  trainingEnabled: boolean
  estimatedDays: number
}

export function generatePlan(readingTime: number, trainingEnabled: boolean): GeneratedPlan {
  let segmentsPerDay = 1

  if (readingTime === 15) {
    segmentsPerDay = 1
  }

  if (readingTime === 20) {
    segmentsPerDay = 2
  }

  if (readingTime === 30) {
    segmentsPerDay = 3
  }

  const totalSegments = 396
  const days = totalSegments / segmentsPerDay

  return {
    readingTime,
    segmentsPerDay,
    trainingEnabled,
    estimatedDays: Math.round(days),
  }
}
