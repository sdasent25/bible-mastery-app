import BookCampaignPage, {
  UnavailableBookCampaignPage,
} from "@/components/training/BookCampaignPage"
import {
  getTrainingDaysForBook,
  getTrainingBookLabel,
  isTrainingBookSlug,
} from "@/lib/training/bibleStructure"
import {
  getTrainingBookMetadata,
  getTrainingMissionMetadata,
} from "@/lib/training/trainingMetadata"
import {
  getTrainingAccessState,
  listTrainingDays,
} from "@/lib/training/loadTrainingDay"

type TrainingBookPageProps = {
  params: Promise<{
    book: string
  }>
}

export default async function TrainingBookPage({
  params,
}: TrainingBookPageProps) {
  const resolvedParams = await params
  const bookSlug = resolvedParams.book.toLowerCase()

  const [days, access] = await Promise.all([
    listTrainingDays(),
    getTrainingAccessState(),
  ])

  if (!isTrainingBookSlug(bookSlug)) {
    const fallbackLabel =
      bookSlug.length > 0
        ? bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1)
        : "This Book"

    return <UnavailableBookCampaignPage access={access} bookLabel={fallbackLabel} />
  }

  const bookDays = getTrainingDaysForBook(days, bookSlug)
  const bookMetadata = getTrainingBookMetadata(bookSlug)

  if (bookDays.length === 0) {
    return (
      <UnavailableBookCampaignPage
        access={access}
        bookLabel={getTrainingBookLabel(bookSlug)}
      />
    )
  }

  const missionMetaByDay = Object.fromEntries(
    bookDays.map((day) => [day.day, getTrainingMissionMetadata(day, bookSlug)])
  )

  return (
    <BookCampaignPage
      access={access}
      bookSlug={bookSlug}
      book={bookMetadata}
      days={bookDays}
      missionMetaByDay={missionMetaByDay}
    />
  )
}
