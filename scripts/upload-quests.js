import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const baseDir = path.join(process.cwd(), "data/quests")

function getAllJsonFiles(dir) {
  let results = []
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      results = results.concat(getAllJsonFiles(fullPath))
    } else if (file.endsWith(".json")) {
      results.push(fullPath)
    }
  })

  return results
}

async function upload() {
  const booksFile = path.join(baseDir, "books.json")
  const files = getAllJsonFiles(baseDir).filter(file => file !== booksFile)

  console.log(`Found ${files.length} files`)

  for (const file of files) {
    console.log(`Uploading: ${file}`)

    let data

    try {
      const raw = fs.readFileSync(file, "utf-8").trim()

      if (!raw) {
        console.warn(`Skipping empty file: ${file}`)
        continue
      }

      data = JSON.parse(raw)
    } catch (err) {
      console.error(`Invalid JSON in: ${file}`)
      continue
    }

    if (!Array.isArray(data)) {
      console.error(`File must contain array: ${file}`)
      continue
    }

    const { error } = await supabase
      .from("quest_questions")
      .insert(data)

    if (error) {
      console.error("Error inserting:", error.message)
    } else {
      console.log("✅ Uploaded")
    }
  }

  if (fs.existsSync(booksFile)) {
    const raw = fs.readFileSync(booksFile, "utf-8").trim()

    if (raw) {
      const booksData = JSON.parse(raw)

      if (Array.isArray(booksData)) {
        const { error } = await supabase
          .from("quest_questions")
          .insert(booksData)

        if (error) {
          console.error("Error inserting books.json:", error.message)
        } else {
          console.log("✅ Uploaded books.json")
        }
      }
    }
  }

  console.log("🚀 Done")
}

upload()
