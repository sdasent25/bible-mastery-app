"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { createFlashcard } from "@/lib/flashcards"

export default function FlashcardsCreatePage() {
  const router = useRouter()
  const [accessLoading, setAccessLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [verse, setVerse] = useState("")
  const [reference, setReference] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("user_access")
        .select("final_plan")
        .single()

      if (data?.final_plan === "pro" || data?.final_plan === "pro_plus") {
        setHasAccess(true)
      } else {
        router.push("/pricing?source=flashcards_locked")
      }

      setAccessLoading(false)
    }

    void checkAccess()
  }, [router])

  if (accessLoading) {
    return <div className="text-white text-center mt-10">Loading...</div>
  }

  if (!hasAccess) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!verse.trim() || !reference.trim()) return

    setLoading(true)

    try {
      await createFlashcard({
        verse_text: verse,
        reference,
        tags: category ? [category] : [],
      })

      router.push("/flashcards")
    } catch (err) {
      console.error(err)
      alert("Failed to save flashcard")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/flashcards")}
          className="text-sm text-gray-300"
        >
          ← Flashcards
        </button>

        <div className="text-sm text-white/80">
          Create
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-xl mx-auto w-full space-y-5">
        <h1 className="text-2xl font-bold text-white text-center">
          Add Flashcard
        </h1>

        <p className="text-center text-white/80 text-sm">
          Add a verse you want to memorize
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            placeholder="Enter verse text..."
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none text-base"
          />

          <input
            placeholder="Reference (John 3:16)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none text-base"
          />

          <input
            placeholder="Category (optional, e.g. Faith)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none text-base"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 transition py-4 rounded-xl font-semibold"
          >
            {loading ? "Saving..." : "Save Flashcard"}
          </button>
        </form>
      </div>
    </div>
  )
}
