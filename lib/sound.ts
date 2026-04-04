export function playSound(src: string) {
  const enabled = typeof window !== "undefined"
    ? localStorage.getItem("sound") !== "off"
    : true

  if (!enabled) return

  const audio = new Audio(src)
  audio.volume = 0.4
  audio.play().catch(() => {})
}
