import 'dotenv/config'
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 🔁 RECURSIVE FILE LOADER
function getAllJsonFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)

  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsonFiles(filePath))
    } else if (file.endsWith(".json")) {
      results.push(filePath)
    }
  })

  return results
}

async function upload() {
  const baseDir = path.join(process.cwd(), "data/quests")
  const files = getAllJsonFiles(baseDir)

  console.log(`Found ${files.length} files`)

  for (const file of files) {
    console.log(`Uploading: ${file}`)

    const raw = fs.readFileSync(file)
    const data = JSON.parse(raw)

    const { error } = await supabase
      .from("quest_questions")
      .insert(data)

    if (error) {
      console.error("❌ Error:", error)
    } else {
      console.log("✅ Uploaded")
    }
  }

  console.log("🚀 Done")
}

upload()