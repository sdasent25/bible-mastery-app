"use client"

import { useEffect, useState } from "react"

type InstructionModalProps = {
  title: string
  steps: string[]
  storageKey: string
}

export default function InstructionModal({
  title,
  steps,
  storageKey,
}: InstructionModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(storageKey)

    if (!seen) {
      setOpen(true)
    }
  }, [storageKey])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-6 text-white shadow-2xl">
        <h2 className="mb-4 text-xl font-semibold">
          {title}
        </h2>

        <ul className="mb-6 space-y-2 text-gray-300">
          {steps.map((step, index) => (
            <li key={index}>• {step}</li>
          ))}
        </ul>

        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-sm text-gray-300">
          <div className="mb-2 font-semibold text-white">For best results:</div>
          <div>XP is earned only on your first correct attempt</div>
          <div>Repeats and guesses do not earn XP</div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              localStorage.setItem(storageKey, "true")
              setOpen(false)
            }}
            className="text-sm text-gray-400"
          >
            Don&apos;t show again
          </button>

          <button
            onClick={() => setOpen(false)}
            className="rounded bg-blue-600 px-4 py-2"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  )
}
