require("dotenv").config()

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

// 🔍 DEBUG ENV (safe to keep for now)
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Loaded" : "Missing")
console.log("SERVICE KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "Missing")

// ❗ VALIDATION (prevents confusing errors)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env")
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env")
}

// 🔑 CREATE CLIENT
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 📂 FOLDER PATH
const folderPath = "./data/questions"

async function uploadAll() {
  try {
    const files = fs.readdirSync(folderPath)

    for (const file of files) {
      if (!file.endsWith(".json")) continue

      const fullPath = path.join(folderPath, file)
      const raw = fs.readFileSync(fullPath, "utf-8")
      const questions = JSON.parse(raw)

      console.log(`📤 Uploading ${file}...`)

      const { error } = await supabase
        .from("questions")
        .insert(questions)

      if (error) {
        console.error(`❌ Error in ${file}:`, error.message)
        return
      } else {
        console.log(`✅ Success: ${file}`)
      }
    }

    console.log("🎉 Genesis upload complete")
  } catch (err) {
    console.error("❌ Script failed:", err.message)
  }
}

uploadAll()