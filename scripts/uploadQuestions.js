require("dotenv").config()

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const QUESTIONS_TABLE = "questions"
const QUESTIONS_FOLDER = path.resolve(__dirname, "../data/questions")
const MAX_BATCH_SIZE = 100

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.")
  console.error(
    `NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? "Loaded" : "Missing"}`
  )
  console.error(
    `SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "Missing"}`
  )
  process.exitCode = 1
  return
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

function parseDayNumber(fileName) {
  const match = fileName.match(/day-(\d+)\.json$/i)
  return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER
}

function sortFilesByDay(files) {
  return files.sort((a, b) => {
    const dayA = parseDayNumber(a)
    const dayB = parseDayNumber(b)

    if (dayA !== dayB) {
      return dayA - dayB
    }

    return a.localeCompare(b)
  })
}

function chunkArray(items, size) {
  const chunks = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

function toOptionalString(value) {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toOptionalInteger(value) {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) ? parsed : null
}

function normalizeTags(value) {
  if (!Array.isArray(value)) {
    return []
  }

  const uniqueTags = new Set()

  for (const tag of value) {
    if (typeof tag !== "string") {
      continue
    }

    const trimmed = tag.trim()
    if (trimmed) {
      uniqueTags.add(trimmed)
    }
  }

  return Array.from(uniqueTags)
}

function normalizeQuestion(record, fallbackDay) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null
  }

  const normalized = {
    book: toOptionalString(record.book),
    chapter: toOptionalInteger(record.chapter),
    reference: toOptionalString(record.reference),
    question: toOptionalString(record.question),
    option_a: toOptionalString(record.option_a),
    option_b: toOptionalString(record.option_b),
    option_c: toOptionalString(record.option_c),
    option_d: toOptionalString(record.option_d),
    correct_answer: toOptionalString(record.correct_answer),
    difficulty: toOptionalString(record.difficulty),
    tags: normalizeTags(record.tags),
    day: toOptionalInteger(record.day) ?? fallbackDay
  }

  if (
    !normalized.book ||
    normalized.chapter === null ||
    !normalized.reference ||
    !normalized.question ||
    !normalized.option_a ||
    !normalized.option_b ||
    !normalized.option_c ||
    !normalized.option_d ||
    !normalized.correct_answer ||
    !normalized.difficulty ||
    normalized.day === null
  ) {
    return null
  }

  return normalized
}

async function uploadAll() {
  let totalInserted = 0
  let totalSkipped = 0
  const seenQuestions = new Set()

  try {
    if (!fs.existsSync(QUESTIONS_FOLDER)) {
      console.error(`Questions folder not found: ${QUESTIONS_FOLDER}`)
      process.exitCode = 1
      return
    }

    const files = sortFilesByDay(
      fs
        .readdirSync(QUESTIONS_FOLDER)
        .filter((file) => file.toLowerCase().endsWith(".json"))
    )

    if (files.length === 0) {
      console.warn(`No JSON files found in ${QUESTIONS_FOLDER}`)
      return
    }

    for (const file of files) {
      const filePath = path.join(QUESTIONS_FOLDER, file)
      const fallbackDay = parseDayNumber(file)

      console.log(`Starting file: ${file}`)

      let parsedQuestions

      try {
        const raw = fs.readFileSync(filePath, "utf8")
        parsedQuestions = JSON.parse(raw)
      } catch (error) {
        console.error(`Failed to read ${file}: ${error.message}`)
        continue
      }

      if (!Array.isArray(parsedQuestions)) {
        console.error(`Skipping ${file}: expected a JSON array of questions.`)
        continue
      }

      const validRows = []
      let fileSkippedCount = 0

      for (const question of parsedQuestions) {
        const normalized = normalizeQuestion(question, fallbackDay)

        if (!normalized) {
          fileSkippedCount += 1
          continue
        }

        const duplicateKey = [
          normalized.day,
          normalized.reference,
          normalized.question
        ].join("::")

        if (seenQuestions.has(duplicateKey)) {
          fileSkippedCount += 1
          continue
        }

        seenQuestions.add(duplicateKey)
        validRows.push(normalized)
      }

      totalSkipped += fileSkippedCount

      if (validRows.length === 0) {
        console.warn(`No valid rows to insert for ${file}. Skipped: ${fileSkippedCount}`)
        continue
      }

      const batches = chunkArray(validRows, MAX_BATCH_SIZE)
      let fileInsertedCount = 0

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
        const batch = batches[batchIndex]
        console.log(
          `Batch ${batchIndex + 1}/${batches.length} for ${file}: inserting ${batch.length} rows`
        )

        try {
          const { error } = await supabase.from(QUESTIONS_TABLE).insert(batch)

          if (error) {
            console.error(
              `Insert failed for ${file} batch ${batchIndex + 1}/${batches.length}: ${error.message}`
            )
            continue
          }

          fileInsertedCount += batch.length
          totalInserted += batch.length
          console.log(
            `Batch ${batchIndex + 1}/${batches.length} for ${file} succeeded: ${fileInsertedCount}/${validRows.length} inserted`
          )
        } catch (error) {
          console.error(
            `Unexpected error for ${file} batch ${batchIndex + 1}/${batches.length}: ${error.message}`
          )
        }
      }

      console.log(
        `Completed ${file}: inserted ${fileInsertedCount}, skipped ${fileSkippedCount}`
      )
    }

    console.log(
      `Upload finished. Total inserted: ${totalInserted}. Total skipped: ${totalSkipped}.`
    )
  } catch (error) {
    console.error(`Upload script failed: ${error.message}`)
    process.exitCode = 1
  }
}

uploadAll()
