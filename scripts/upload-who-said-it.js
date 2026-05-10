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
const BOOK_METADATA = {
  Genesis: {
    tag: "genesis",
    book_order: 1,
    testament: "old_testament",
    category: "pentateuch",
  },
  Exodus: {
    tag: "exodus",
    book_order: 2,
    testament: "old_testament",
    category: "pentateuch",
  },
  "1 Samuel": {
    tag: "1_samuel",
    book_order: 9,
    testament: "old_testament",
    category: "historical",
  },
  "2 Samuel": {
    tag: "2_samuel",
    book_order: 10,
    testament: "old_testament",
    category: "historical",
  },
  "1 Kings": {
    tag: "1_kings",
    book_order: 11,
    testament: "old_testament",
    category: "historical",
  },
  "2 Kings": {
    tag: "2_kings",
    book_order: 12,
    testament: "old_testament",
    category: "historical",
  },
  Nehemiah: {
    tag: "nehemiah",
    book_order: 16,
    testament: "old_testament",
    category: "historical",
  },
  Job: {
    tag: "job",
    book_order: 18,
    testament: "old_testament",
    category: "wisdom",
  },
  Jeremiah: {
    tag: "jeremiah",
    book_order: 24,
    testament: "old_testament",
    category: "major_prophets",
  },
  Daniel: {
    tag: "daniel",
    book_order: 27,
    testament: "old_testament",
    category: "major_prophets",
  },
  Matthew: {
    tag: "matthew",
    book_order: 40,
    testament: "new_testament",
    category: "gospels",
  },
  Mark: {
    tag: "mark",
    book_order: 41,
    testament: "new_testament",
    category: "gospels",
  },
  Luke: {
    tag: "luke",
    book_order: 42,
    testament: "new_testament",
    category: "gospels",
  },
  John: {
    tag: "john",
    book_order: 43,
    testament: "new_testament",
    category: "gospels",
  },
  Acts: {
    tag: "acts",
    book_order: 44,
    testament: "new_testament",
    category: "acts",
  },
  Revelation: {
    tag: "revelation",
    book_order: 66,
    testament: "new_testament",
    category: "apocalyptic",
  },
}
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

function formatDifficultyMix(records) {
  const counts = { easy: 0, medium: 0, hard: 0 }

  for (const record of records) {
    if (counts[record.difficulty] !== undefined) {
      counts[record.difficulty] += 1
    }
  }

  return `easy=${counts.easy}, medium=${counts.medium}, hard=${counts.hard}`
}

function summarizeByBook(records) {
  const byBook = new Map()

  for (const record of records) {
    if (!byBook.has(record.book)) {
      byBook.set(record.book, [])
    }

    byBook.get(record.book).push(record)
  }

  return [...byBook.entries()].sort(([a], [b]) => a.localeCompare(b))
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
  } else {
    const seenTags = new Set()

    for (const tag of record.tags) {
      if (typeof tag !== "string") {
        errors.push(`${label}: tags must contain only non-empty strings`)
        continue
      }

      const trimmedTag = tag.trim()

      if (!trimmedTag) {
        errors.push(`${label}: tags must contain only non-empty strings`)
        continue
      }

      if (seenTags.has(trimmedTag)) {
        errors.push(`${label}: duplicate tag value "${trimmedTag}"`)
      } else {
        seenTags.add(trimmedTag)
      }
    }

    if (!seenTags.has("speaker_recognition")) {
      errors.push(`${label}: missing speaker_recognition tag`)
    }
  }

  const expectedMetadata = BOOK_METADATA[record.book]

  if (!expectedMetadata) {
    errors.push(`${label}: unsupported book "${record.book}"`)
  } else {
    if (record.book_order !== expectedMetadata.book_order) {
      errors.push(
        `${label}: invalid book_order "${record.book_order}" for book "${record.book}", expected "${expectedMetadata.book_order}"`
      )
    }

    if (record.testament !== expectedMetadata.testament) {
      errors.push(
        `${label}: invalid testament "${record.testament}" for book "${record.book}", expected "${expectedMetadata.testament}"`
      )
    }

    if (record.category !== expectedMetadata.category) {
      errors.push(
        `${label}: invalid category "${record.category}" for book "${record.book}", expected "${expectedMetadata.category}"`
      )
    }

    if (Array.isArray(record.tags) && !record.tags.includes(expectedMetadata.tag)) {
      errors.push(`${label}: missing normalized book tag "${expectedMetadata.tag}"`)
    }
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

    if (files.length === 1) {
      const onlyFile = path.basename(files[0])
      const books = [...new Set(records.map((record) => record.book))].sort()
      console.log("Single-file summary:")
      console.log(`- file name: ${onlyFile}`)
      console.log(`- detected book(s): ${books.join(", ")}`)
      console.log(`- record count: ${records.length}`)
      console.log(`- difficulty mix: ${formatDifficultyMix(records)}`)
      console.log("- required tag validation passed")
    } else {
      console.log("All-file summary:")
      console.log(`- total files: ${files.length}`)
      console.log(`- total records: ${records.length}`)
      console.log("- totals by book:")
      for (const [book, bookRecords] of summarizeByBook(records)) {
        console.log(`  - ${book}: ${bookRecords.length}`)
      }
      console.log("- difficulty mix by book:")
      for (const [book, bookRecords] of summarizeByBook(records)) {
        console.log(`  - ${book}: ${formatDifficultyMix(bookRecords)}`)
      }
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
