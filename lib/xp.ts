import { supabase } from "./supabase"

const MAX_XP_PER_EVENT = 50
const DAILY_XP_CAP = 120
const ALLOWED_XP_SOURCES = new Set([
  "quiz",
  "quiz_answer",
  "quiz_completion",
  "program_completion",
  "flashcards",
  "flashcard_study",
  "flashcard_sprint",
  "fill_in_the_blank",
  "game",
  "side_quest",
  "daily",
  "bonus",
  "recall",
  "unknown",
])

async function getTodayXp(userId: string) {
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("daily_xp")
    .select("xp")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle()

  return data?.xp || 0
}

async function addDailyXp(userId: string, amount: number) {
  const today = new Date().toISOString().split("T")[0]

  const { data: existing } = await supabase
    .from("daily_xp")
    .select("xp")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle()

  const next = (existing?.xp || 0) + amount

  await supabase.from("daily_xp").upsert(
    {
      user_id: userId,
      date: today,
      xp: next,
    },
    { onConflict: "user_id,date" }
  )
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0]
}

function getYesterdayDate() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

function getCurrentWeekStart(): string {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return weekStart.toISOString().split("T")[0]
}

async function addWeeklyXp(userId: string, amount: number) {
  const weekStart = getCurrentWeekStart()

  const { data: existing, error: fetchError } = await supabase
    .from("weekly_xp")
    .select("xp")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle<{ xp: number | null }>()

  if (fetchError) {
    console.error("Error reading weekly XP:", fetchError)
    return
  }

  const nextXp = (existing?.xp || 0) + amount

  const { error: upsertError } = await supabase
    .from("weekly_xp")
    .upsert(
      {
        user_id: userId,
        week_start: weekStart,
        xp: nextXp,
      },
      { onConflict: "user_id,week_start" }
    )

  if (upsertError) {
    console.error("Error writing weekly XP:", upsertError)
  }
}

function syncLocalStreak(streak: number, today: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("streak", String(streak))
  localStorage.setItem("last-completed-date", today)
}

export async function getXp(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data, error } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .maybeSingle()

    if (error || !data) return 0
    return data.xp || 0
  } catch (error) {
    console.error("Error getting XP:", error)
    return 0
  }
}

export async function addXp(amount: number, source = "unknown"): Promise<number> {
  if (
    typeof amount !== "number" ||
    Number.isNaN(amount) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return await getXp()
  }

  const normalizedAmount = Math.min(Math.floor(amount), MAX_XP_PER_EVENT)
  const normalizedSource = ALLOWED_XP_SOURCES.has(source) ? source : "unknown"

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("xp, streak, last_active_date")
      .eq("id", user.id)
      .maybeSingle<{ xp: number | null; streak: number | null; last_active_date: string | null }>()

    if (fetchError) throw fetchError

    const currentXp = profile?.xp || 0
    const currentStreak = profile?.streak || 0
    const lastDate = profile?.last_active_date
    const today = getTodayDate()
    const yesterday = getYesterdayDate()

    let newStreak = currentStreak

    if (!lastDate) {
      newStreak = 1
    } else if (lastDate === today) {
      newStreak = currentStreak
    } else if (lastDate === yesterday) {
      newStreak = currentStreak + 1
    } else {
      newStreak = 1
    }

    const todayXp = await getTodayXp(user.id)

    if (todayXp >= DAILY_XP_CAP) {
      return currentXp
    }

    const allowedAmount = Math.min(
      normalizedAmount,
      DAILY_XP_CAP - todayXp
    )

    const updated = currentXp + allowedAmount

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        xp: updated,
        streak: newStreak,
        last_active_date: today,
      })

    if (updateError) throw updateError

    await addDailyXp(user.id, allowedAmount)

    syncLocalStreak(newStreak, today)

    await addWeeklyXp(user.id, normalizedAmount)

    console.info("XP awarded", {
      userId: user.id,
      source: normalizedSource,
      amount: normalizedAmount,
      streak: newStreak,
    })

    return updated
  } catch (error) {
    console.error("Error adding XP:", error)
    return await getXp()
  }
}
