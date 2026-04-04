let audioCache: Record<string, HTMLAudioElement> = {}

export function playSound(src: string) {
  if (typeof window === "undefined") return

  const enabled = localStorage.getItem("sound") !== "off"
  if (!enabled) return

  let audio = audioCache[src]

  if (!audio) {
    audio = new Audio(src)
    audio.preload = "auto"

    if (src.includes("correct")) audio.volume = 0.5
    else if (src.includes("wrong")) audio.volume = 0.25
    else if (src.includes("click")) audio.volume = 0.2
    else if (src.includes("tap")) audio.volume = 0.15
    else if (src.includes("level-up")) audio.volume = 0.6
    else audio.volume = 0.3

    audioCache[src] = audio
  }

  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
  if (typeof window === "undefined") return

  if (!("vibrate" in navigator)) return

  if (type === "light") navigator.vibrate(10)
  else if (type === "medium") navigator.vibrate(25)
  else if (type === "heavy") navigator.vibrate(50)
}
