"use client"

import { useState } from "react"

type TrainingImageOptionProps = {
  imageUrl: string
  alt: string
  label: string
  isCorrect?: boolean
}

export default function TrainingImageOption({
  imageUrl,
  alt,
  label,
  isCorrect = false,
}: TrainingImageOptionProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`overflow-hidden rounded-[1.4rem] border ${
        isCorrect
          ? "border-emerald-300/60 bg-emerald-300/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {failed ? (
        <div className="flex aspect-square items-center justify-center bg-[linear-gradient(180deg,rgba(20,25,38,0.98),rgba(10,13,22,0.98))] px-4 text-center text-sm font-medium text-slate-300">
          Image unavailable
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          className="aspect-square w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">{label}</p>
          {isCorrect ? (
            <span className="rounded-full border border-emerald-300/40 bg-emerald-300/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100">
              Correct
            </span>
          ) : null}
        </div>
        <p className="text-xs leading-5 text-slate-400">{alt}</p>
      </div>
    </div>
  )
}
