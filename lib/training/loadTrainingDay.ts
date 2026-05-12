import "server-only"

import { promises as fs } from "fs"
import path from "path"

import { createClient } from "@/lib/supabase/server"

import type {
  TrainingAccessState,
  TrainingDay,
  TrainingDaySummary,
  TrainingItem,
} from "./types"

const TRAINING_DIR = path.join(process.cwd(), "data", "training")

const PRO_PLUS_PLANS = new Set(["pro_plus", "family_pro_plus"])
const PRO_PLANS = new Set(["pro", "family_pro"])

const CORE_PRO_FORMATS = new Set([
  "multiple_choice",
  "fill_blank",
  "ordering",
  "matching",
  "true_false",
  "spot_error",
])

function isTrainingDay(value: unknown): value is TrainingDay {
  if (!value || typeof value !== "object") return false

  const day = value as Partial<TrainingDay>

  return (
    typeof day.day === "number" &&
    typeof day.segment_key === "string" &&
    typeof day.unlock_key === "string" &&
    !!day.reading &&
    typeof day.reading.reference === "string" &&
    Array.isArray(day.items)
  )
}

export function formatTrainingDayNumber(day: number) {
  return String(day).padStart(3, "0")
}

function getTrainingDayPath(day: number) {
  return path.join(TRAINING_DIR, `day-${formatTrainingDayNumber(day)}.json`)
}

export async function loadTrainingDay(day: number): Promise<TrainingDay | null> {
  if (!Number.isInteger(day) || day < 1) {
    return null
  }

  try {
    const filePath = getTrainingDayPath(day)
    const raw = await fs.readFile(filePath, "utf8")
    const parsed = JSON.parse(raw) as unknown

    if (!isTrainingDay(parsed)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export async function listTrainingDays(): Promise<TrainingDaySummary[]> {
  const entries = await fs.readdir(TRAINING_DIR)
  const files = entries
    .filter((entry) => /^day-\d{3}\.json$/.test(entry))
    .sort()

  const days = await Promise.all(
    files.map(async (fileName) => {
      try {
        const raw = await fs.readFile(path.join(TRAINING_DIR, fileName), "utf8")
        const parsed = JSON.parse(raw) as unknown

        if (!isTrainingDay(parsed)) {
          return null
        }

        return {
          day: parsed.day,
          reference: parsed.reading.reference,
          itemCount: parsed.items.length,
          segmentKey: parsed.segment_key,
        } satisfies TrainingDaySummary
      } catch {
        return null
      }
    })
  )

  return days
    .filter((entry): entry is TrainingDaySummary => entry !== null)
    .sort((a, b) => a.day - b.day)
}

export async function getTrainingAccessState(): Promise<TrainingAccessState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      signedIn: false,
      rawPlan: "free",
      tier: "free",
    }
  }

  const { data } = await supabase
    .from("user_access")
    .select("final_plan")
    .eq("user_id", user.id)
    .single()

  const rawPlan =
    data?.final_plan === "pro" ||
    data?.final_plan === "pro_plus" ||
    data?.final_plan === "family_pro" ||
    data?.final_plan === "family_pro_plus"
      ? data.final_plan
      : "free"

  const tier = PRO_PLUS_PLANS.has(rawPlan)
    ? "pro_plus"
    : PRO_PLANS.has(rawPlan)
      ? "pro"
      : "free"

  return {
    signedIn: true,
    rawPlan,
    tier,
  }
}

export function filterTrainingItemsForAccess(
  items: TrainingItem[],
  tier: TrainingAccessState["tier"]
) {
  if (tier === "pro_plus") {
    return items.slice(0, 20)
  }

  if (tier === "pro") {
    return items
      .filter(
        (item) =>
          (item.difficulty === "easy" || item.difficulty === "medium") &&
          CORE_PRO_FORMATS.has(item.format)
      )
      .slice(0, 10)
  }

  return items
    .filter(
      (item) => item.difficulty === "easy" && item.format !== "image_choice"
    )
    .slice(0, 5)
}
