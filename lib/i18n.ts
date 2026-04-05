export const locales = ["en", "es"] as const

export function getLocale() {
  if (typeof window === "undefined") return "en"
  return localStorage.getItem("locale") || "en"
}

export function setLocale(locale: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("locale", locale)
  window.location.reload()
}

export async function getMessages(locale: string) {
  switch (locale) {
    case "es":
      return (await import("@/messages/es.json")).default
    default:
      return (await import("@/messages/en.json")).default
  }
}
