export type GeneratedPlan = {
  timelineDays: number
  segmentsPerDay: number
  trainingEnabled: boolean
  estimatedDays: number
}

export function generatePlan(timelineDays: number, trainingEnabled: boolean): GeneratedPlan {
  const totalSegments = 365
  const segmentsPerDay = Math.ceil(totalSegments / timelineDays)

  return {
    timelineDays,
    segmentsPerDay,
    trainingEnabled,
    estimatedDays: timelineDays,
  }
}
