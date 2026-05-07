let audioCache: Record<string, HTMLAudioElement> = {}

const SOUND_EFFECTS = {
  missionAffirm: "/sounds/journey-selected.mp3",
  missionSetback: "/sounds/swipe.mp3",
  missionAdvance: "/sounds/level-up.mp3",
  missionPulse: "/sounds/tap.mp3",
} as const

export function playSound(src: string) {
  if (typeof window === "undefined") return

  const enabled = localStorage.getItem("sound") !== "off"
  if (!enabled) return

  let audio = audioCache[src]

  if (!audio) {
    audio = new Audio(src)
    audio.preload = "auto"

    if (src.includes("journey-selected")) audio.volume = 0.16
    else if (src.includes("correct")) audio.volume = 0.28
    else if (src.includes("wrong")) audio.volume = 0.1
    else if (src.includes("click")) audio.volume = 0.06
    else if (src.includes("tap")) audio.volume = 0.05
    else if (src.includes("swipe")) audio.volume = 0.07
    else if (src.includes("level-up")) audio.volume = 0.12
    else audio.volume = 0.1

    audioCache[src] = audio
  }

  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function playMissionAffirmSound() {
  playSound(SOUND_EFFECTS.missionAffirm)
}

export function playMissionSetbackSound() {
  playSound(SOUND_EFFECTS.missionSetback)
}

export function playMissionAdvanceSound() {
  playSound(SOUND_EFFECTS.missionAdvance)
}

export function playMissionPulseSound() {
  playSound(SOUND_EFFECTS.missionPulse)
}

export function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
  if (typeof window === "undefined") return

  if (!("vibrate" in navigator)) return

  if (type === "light") navigator.vibrate(10)
  else if (type === "medium") navigator.vibrate(25)
  else if (type === "heavy") navigator.vibrate(50)
}
