export function getCompletedLevels(programId: string) {
  return JSON.parse(localStorage.getItem(`program_${programId}`) || "[]")
}

export function completeLevel(programId: string, levelIndex: number) {
  const existing = getCompletedLevels(programId)

  if (!existing.includes(levelIndex)) {
    existing.push(levelIndex)
    localStorage.setItem(`program_${programId}`, JSON.stringify(existing))
  }
}
