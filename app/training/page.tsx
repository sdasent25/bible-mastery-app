import TrainingHubInteractive from "@/components/training/TrainingHubInteractive"
import {
  getTrainingAccessState,
  listTrainingDays,
} from "@/lib/training/loadTrainingDay"

export default async function TrainingPage() {
  const [days, access] = await Promise.all([
    listTrainingDays(),
    getTrainingAccessState(),
  ])

  return <TrainingHubInteractive days={days} access={access} />
}
