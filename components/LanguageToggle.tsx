"use client"

import { getLocale, setLocale } from "@/lib/i18n"

export default function LanguageToggle() {
  const locale = getLocale()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLocale("en")}
        className={`px-3 py-1 rounded ${locale === "en" ? "bg-blue-600 text-white" : "bg-neutral-700 text-gray-300"}`}
      >
        EN
      </button>

      <button
        onClick={() => setLocale("es")}
        className={`px-3 py-1 rounded ${locale === "es" ? "bg-blue-600 text-white" : "bg-neutral-700 text-gray-300"}`}
      >
        ES
      </button>
    </div>
  )
}
