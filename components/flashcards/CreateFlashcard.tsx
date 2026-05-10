"use client"

import { type FormEvent, useState } from "react"
import { createFlashcard } from "@/lib/flashcards"

type CreateFlashcardProps = {
  onCreated: () => void | Promise<void>
  submitLabel?: string
  savingLabel?: string
}

export default function CreateFlashcard({
  onCreated,
  submitLabel = "Save Verse",
  savingLabel = "Saving Verse...",
}: CreateFlashcardProps) {
  const [verseText, setVerseText] = useState("")
  const [reference, setReference] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedReference = reference.trim()
    const trimmedVerseText = verseText.trim()
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (!trimmedReference || !trimmedVerseText) {
      setError("Reference and verse text are required.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await createFlashcard({
        verse_text: trimmedVerseText,
        reference: trimmedReference,
        tags,
      })

      setReference("")
      setVerseText("")
      setTagsInput("")
      await onCreated()
    } catch (submissionError) {
      console.error(submissionError)
      setError("We couldn't save that verse right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="reference" className="text-sm font-semibold text-amber-100">
          Reference
        </label>
        <input
          id="reference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="John 3:16"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/30"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="verse-text" className="text-sm font-semibold text-amber-100">
          Verse Text
        </label>
        <textarea
          id="verse-text"
          value={verseText}
          onChange={(event) => setVerseText(event.target.value)}
          placeholder="Paste the verse text from your preferred Bible translation."
          className="min-h-[180px] w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/30"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-semibold text-amber-100">
          Category / Tags
          <span className="ml-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Optional
          </span>
        </label>
        <input
          id="tags"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          placeholder="Faith, courage, prayer"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/30"
        />
        <p className="text-sm leading-6 text-slate-400">
          Separate tags with commas to organize your verse library.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-4">
        <p className="text-sm leading-6 text-amber-50/90">
          Bible Athlete stores the verse text you provide for personal memory training. Paste from the
          translation you personally use.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-5 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-200"
      >
        {loading ? savingLabel : submitLabel}
      </button>
    </form>
  )
}
