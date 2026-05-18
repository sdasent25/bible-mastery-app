import { getGenesisMissionMeta } from "@/lib/genesisCampaign"

import type { TrainingDaySummary } from "./types"

import type { TrainingBookSlug } from "./bibleStructure"

export type TrainingBookMetadata = {
  slug: TrainingBookSlug
  title: string
  subtitle: string
  description: string
  heroImage: string
  crestImage: string
  sectionTitle: string
}

export type TrainingMissionMetadata = {
  title: string
  description: string
}

const TRAINING_BOOK_METADATA: Record<TrainingBookSlug, TrainingBookMetadata> = {
  genesis: {
    slug: "genesis",
    title: "Genesis",
    subtitle: "Creation • Covenant • Beginnings",
    description:
      "Trace the first great book of Scripture through origins, promise, family fracture, and God’s covenant beginnings.",
    heroImage: "/training/hero/genesis-campaign-hero.png",
    crestImage: "/training/books/genesis.png",
    sectionTitle: "Pentateuch",
  },
  exodus: {
    slug: "exodus",
    title: "Exodus",
    subtitle: "Deliverance • Presence • Power",
    description:
      "Move from oppression to confrontation as the Exodus path opens with Moses, Pharaoh, and the first signs of deliverance.",
    heroImage: "/training/exodus/burning-bush-horeb.png",
    crestImage: "/training/books/exodus.png",
    sectionTitle: "Pentateuch",
  },
}

const EXODUS_MISSION_METADATA: Record<string, TrainingMissionMetadata> = {
  exodus_1_3: {
    title: "The Burning Call",
    description: "A deliverer rises as slavery, exile, and holy fire set the campaign in motion.",
  },
  exodus_4_6: {
    title: "Before Pharaoh",
    description: "Moses returns, signs are given, and resistance hardens before the throne.",
  },
  exodus_7_9: {
    title: "The First Plagues",
    description: "Power confronts power as Egypt begins to feel the weight of judgment.",
  },
}

export function getTrainingBookMetadata(slug: TrainingBookSlug) {
  return TRAINING_BOOK_METADATA[slug]
}

function getMissionMetaKey(segmentKey: string) {
  const match = segmentKey.match(/^([a-z]+)-0*(\d+)-0*(\d+)$/i)

  if (!match) return segmentKey.replaceAll("-", "_")

  const [, bookSlug, startChapter, endChapter] = match
  return `${bookSlug.toLowerCase()}_${Number(startChapter)}_${Number(endChapter)}`
}

export function getTrainingMissionMetadata(
  day: TrainingDaySummary,
  bookSlug: TrainingBookSlug
): TrainingMissionMetadata {
  const metaKey = getMissionMetaKey(day.segmentKey)

  if (bookSlug === "genesis") {
    const meta = getGenesisMissionMeta(metaKey)
    return {
      title: meta.title,
      description: meta.subtitle,
    }
  }

  if (bookSlug === "exodus") {
    return (
      EXODUS_MISSION_METADATA[metaKey] ?? {
        title: day.reference,
        description: "Continue the Exodus campaign through the next Scripture mission.",
      }
    )
  }

  return {
    title: day.reference,
    description: "Continue the next Scripture mission in this campaign path.",
  }
}
