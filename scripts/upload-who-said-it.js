import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

const DATA_DIR = path.join(process.cwd(), "data/quests/who-said-it")
const TABLE_NAME = "who_said_it_questions"
const REQUIRED_FIELDS = [
  "type",
  "book",
  "book_order",
  "testament",
  "category",
  "speaker",
  "speaker_type",
  "reference",
  "quote_text",
  "prompt_context",
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_answer",
  "difficulty",
  "tags",
  "source_key",
]
const ALLOWED_TESTAMENTS = new Set(["old_testament", "new_testament"])
const ALLOWED_SPEAKER_TYPES = new Set([
  "person",
  "group",
  "divine",
  "angel",
  "narrator",
  "unknown_or_contextual",
])
const ALLOWED_DIFFICULTIES = new Set(["easy", "medium", "hard"])
const LETTER_ANSWERS = new Set(["A", "B", "C", "D"])
const CLI_ARGS = process.argv.slice(2)
const DRY_RUN = CLI_ARGS.includes("--dry-run")
const TARGET_FILE_ARG = CLI_ARGS.find((arg) => !arg.startsWith("--")) || null

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Who Said It data directory not found: ${dir}`)
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => path.join(dir, file))
}

function resolveInputFiles(targetArg) {
  if (!targetArg) {
    return listJsonFiles(DATA_DIR)
  }

  const resolvedPath = path.isAbsolute(targetArg)
    ? targetArg
    : path.resolve(process.cwd(), targetArg)

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Who Said It file not found: ${resolvedPath}`)
  }

  const fileStat = fs.statSync(resolvedPath)

  if (!fileStat.isFile()) {
    throw new Error(`Expected a JSON file path, received: ${resolvedPath}`)
  }

  if (path.extname(resolvedPath).toLowerCase() !== ".json") {
    throw new Error(`Expected a .json file, received: ${resolvedPath}`)
  }

  return [resolvedPath]
}

function parseJsonArray(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").trim()

  if (!raw) {
    throw new Error(`File is empty: ${filePath}`)
  }

  let parsed

  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array in ${filePath}`)
  }

  parsed.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Expected object at ${filePath} item ${index + 1}`)
    }
  })

  return parsed
}

function normalizeRecord(record) {
  return {
    type: record.type,
    book: record.book,
    book_order: record.book_order,
    testament: record.testament,
    category: record.category,
    speaker: record.speaker,
    speaker_type: record.speaker_type,
    reference: record.reference,
    quote_text: record.quote_text,
    prompt_context: record.prompt_context,
    question: record.question,
    option_a: record.option_a,
    option_b: record.option_b,
    option_c: record.option_c,
    option_d: record.option_d,
    correct_answer: record.correct_answer,
    difficulty: record.difficulty,
    tags: record.tags,
    source_key: record.source_key,
  }
}

function validateRecord(record, filePath, index) {
  const errors = []
  const label = `${path.basename(filePath)}#${index + 1}`

  for (const field of REQUIRED_FIELDS) {
    if (!(field in record)) {
      errors.push(`${label}: missing field "${field}"`)
      continue
    }

    const value = record[field]

    if (typeof value === "string" && value.trim().length === 0) {
      errors.push(`${label}: field "${field}" must be non-empty`)
    }
  }

  if (record.type !== "who_said_it") {
    errors.push(`${label}: type must equal "who_said_it"`)
  }

  if (!ALLOWED_TESTAMENTS.has(record.testament)) {
    errors.push(`${label}: invalid testament "${record.testament}"`)
  }

  if (!ALLOWED_SPEAKER_TYPES.has(record.speaker_type)) {
    errors.push(`${label}: invalid speaker_type "${record.speaker_type}"`)
  }

  if (!ALLOWED_DIFFICULTIES.has(record.difficulty)) {
    errors.push(`${label}: invalid difficulty "${record.difficulty}"`)
  }

  if (!Array.isArray(record.tags)) {
    errors.push(`${label}: tags must be an array`)
  }

  if (!isNonEmptyString(record.source_key)) {
    errors.push(`${label}: source_key must be a non-empty string`)
  }

  if (!isNonEmptyString(record.reference)) {
    errors.push(`${label}: reference must be a non-empty string`)
  }

  if (!isNonEmptyString(record.question)) {
    errors.push(`${label}: question must be a non-empty string`)
  }

  const options = [
    record.option_a,
    record.option_b,
    record.option_c,
    record.option_d,
  ]

  for (const [optionIndex, option] of options.entries()) {
    if (!isNonEmptyString(option)) {
      errors.push(`${label}: option_${String.fromCharCode(97 + optionIndex)} must be non-empty`)
    }
  }

  if (LETTER_ANSWERS.has(record.correct_answer)) {
    errors.push(`${label}: correct_answer must not be A/B/C/D`)
  }

  if (!options.includes(record.correct_answer)) {
    errors.push(`${label}: correct_answer must exactly match one option`)
  }

  if (record.speaker !== record.correct_answer) {
    errors.push(`${label}: speaker must equal correct_answer`)
  }

  if (new Set(options).size !== options.length) {
    errors.push(`${label}: option text must be unique within a question`)
  }

  return errors
}

function validateAcrossRecords(records) {
  const errors = []
  const bySourceKey = new Map()
  const byQuestion = new Map()
  const byReferenceQuestion = new Map()

  for (const record of records) {
    const sourceLabel = `${path.basename(record.__file)}#${record.__index + 1}`
    const referenceQuestionKey = `${record.reference}||${record.question}`

    if (bySourceKey.has(record.source_key)) {
      errors.push(
        `${sourceLabel}: duplicate source_key "${record.source_key}" also seen in ${bySourceKey.get(record.source_key)}`
      )
    } else {
      bySourceKey.set(record.source_key, sourceLabel)
    }

    if (byQuestion.has(record.question)) {
      errors.push(
        `${sourceLabel}: duplicate question also seen in ${byQuestion.get(record.question)}`
      )
    } else {
      byQuestion.set(record.question, sourceLabel)
    }

    if (byReferenceQuestion.has(referenceQuestionKey)) {
      errors.push(
        `${sourceLabel}: duplicate reference+question also seen in ${byReferenceQuestion.get(referenceQuestionKey)}`
      )
    } else {
      byReferenceQuestion.set(referenceQuestionKey, sourceLabel)
    }
  }

  return errors
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient(url, serviceRoleKey)
}

async function uploadRecords(records) {
  const supabase = createSupabaseClient()
  const payload = records.map((record) => {
    const { __file, __index, ...cleanRecord } = record
    return normalizeRecord(cleanRecord)
  })

  const { error, data } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: "source_key" })
    .select("source_key")

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  return data?.length ?? payload.length
}

async function main() {
  try {
    const files = resolveInputFiles(TARGET_FILE_ARG)
    const records = []
    const validationErrors = []

    console.log(`Who Said It files read: ${files.length}`)
    console.log("Files processed:")
    files.forEach((filePath) => console.log(`- ${path.relative(process.cwd(), filePath)}`))

    for (const filePath of files) {
      const items = parseJsonArray(filePath)
      console.log(`Loaded ${items.length} records from ${path.basename(filePath)}`)

      items.forEach((item, index) => {
        const record = {
          ...item,
          __file: filePath,
          __index: index,
        }

        records.push(record)
        validationErrors.push(...validateRecord(record, filePath, index))
      })
    }

    validationErrors.push(...validateAcrossRecords(records))

    console.log(`Total records loaded: ${records.length}`)
    console.log(`Total valid records: ${validationErrors.length === 0 ? records.length : 0}`)

    if (validationErrors.length > 0) {
      console.error("Validation failures:")
      validationErrors.forEach((error) => console.error(`- ${error}`))
      process.exitCode = 1
      return
    }

    if (DRY_RUN) {
      console.log("Dry run enabled. Validation passed, no upload performed.")
      return
    }

    const uploadedCount = await uploadRecords(records)
    console.log(`Uploaded/upserted count: ${uploadedCount}`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

void main()
