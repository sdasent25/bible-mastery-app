export function addIncorrectQuestion(id: string) {
  const existing = JSON.parse(localStorage.getItem("incorrect") || "[]")
  if (!existing.includes(id)) {
    existing.push(id)
    localStorage.setItem("incorrect", JSON.stringify(existing))
  }
}

export function getIncorrectQuestions() {
  return JSON.parse(localStorage.getItem("incorrect") || "[]")
}

export function clearIncorrectQuestions() {
  localStorage.removeItem("incorrect")
}
