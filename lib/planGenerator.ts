export type GeneratedPlan = {
  timeline: number
  segmentsPerDay: number
  trainingEnabled: boolean
  estimatedDays: number
}

export function generatePlan(days: number, trainingEnabled: boolean): GeneratedPlan {
  const totalSegments = 365
  const segmentsPerDay = totalSegments / days

  return {
    timeline: days,
    segmentsPerDay: Math.ceil(segmentsPerDay),
    trainingEnabled,
    estimatedDays: days,
  }
}
