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
  const rootFiles = fs.readdirSync(baseDir)

  for (const file of rootFiles) {
    const fullPath = path.join(baseDir, file)

    if (fs.statSync(fullPath).isFile() && file.endsWith(".json")) {
      const raw = fs.readFileSync(fullPath, "utf-8").trim()
      if (!raw) continue

      const data = JSON.parse(raw)

      if (file === "books.json") {
        const mapped = data.map(b => ({
          book: b.book,
          book_order: b.order,
          testament: b.testament,
          category: b.category,
          theme: b.theme,
        }))

        await supabase.from("books").upsert(mapped, {
          onConflict: "book",
        })
      }
    }
  }

  const files = getAllJsonFiles(baseDir)

  console.log(`Found ${files.length} files`)

  for (const file of files) {
    if (path.dirname(file) === baseDir) {
      continue
    }

    console.log(`Uploading: ${file}`)
    const fileName = path.basename(file)

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

    const { error } = fileName === "books.json"
      ? await supabase.from("books").upsert(
          data.map(b => ({
            book: b.book,
            book_order: b.order,
            testament: b.testament,
            category: b.category,
            theme: b.theme,
          }))
          ,
          {
            onConflict: "book",
          }
        )
      : await supabase.from("quest_questions").upsert(data, {
          onConflict: "question,option_a,option_b,option_c,option_d,correct_answer",
        })

    if (error) {
      console.error("Error inserting:", error.message)
    } else {
      console.log("✅ Uploaded")
    }
  }

  console.log("🚀 Done")
}

upload()
