let audioCache: Record<string, HTMLAudioElement> = {}
let audioPool: Record<string, HTMLAudioElement[]> = {}

const SOUND_EFFECTS = {
  missionAffirm: "/sounds/journey-selected.mp3",
  missionSetback: "/sounds/swipe.mp3",
  missionAdvance: "/sounds/level-up.mp3",
  missionPulse: "/sounds/tap.mp3",
} as const

function configureAudio(audio: HTMLAudioElement, src: string) {
  audio.preload = "auto"
  audio.setAttribute("playsinline", "true")

  if (src.includes("journey-selected")) audio.volume = 0.16
  else if (src.includes("correct")) audio.volume = 0.28
  else if (src.includes("wrong")) audio.volume = 0.1
  else if (src.includes("click")) audio.volume = 0.06
  else if (src.includes("tap")) audio.volume = 0.05
  else if (src.includes("swipe")) audio.volume = 0.07
  else if (src.includes("level-up")) audio.volume = 0.12
  else audio.volume = 0.1
}

export function playSound(src: string) {
  if (typeof window === "undefined") return

  const enabled = localStorage.getItem("sound") !== "off"
  if (!enabled) return

  let audio = audioCache[src]

  if (!audio) {
    audio = new Audio(src)
    configureAudio(audio, src)
    audioCache[src] = audio
  }

  let pool = audioPool[src]
  if (!pool) {
    pool = [audio]
    audioPool[src] = pool
  }

  let playbackAudio = pool.find((item) => item.paused || item.ended)

  if (!playbackAudio) {
    playbackAudio = new Audio(src)
    configureAudio(playbackAudio, src)
    playbackAudio.load()
    pool.push(playbackAudio)
  }

  playbackAudio.currentTime = 0
  playbackAudio.play().catch(() => {})
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

export function preloadMissionSounds() {
  if (typeof window === "undefined") return

  Object.values(SOUND_EFFECTS).forEach((src) => {
    let audio = audioCache[src]

    if (!audio) {
      audio = new Audio(src)
      configureAudio(audio, src)
      audioCache[src] = audio
    }

    let pool = audioPool[src]
    if (!pool) {
      pool = [audio]
      audioPool[src] = pool
    }

    audio.load()

    // Keep one extra preloaded instance ready so confirmation playback
    // can start immediately on the first tap without clone-time delay.
    if (pool.length < 2) {
      const standbyAudio = new Audio(src)
      configureAudio(standbyAudio, src)
      standbyAudio.load()
      pool.push(standbyAudio)
    }
  })
}

export function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
  if (typeof window === "undefined") return

  if (!("vibrate" in navigator)) return

  if (type === "light") navigator.vibrate(10)
  else if (type === "medium") navigator.vibrate(25)
  else if (type === "heavy") navigator.vibrate(50)
}
