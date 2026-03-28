export function saveSession(data: any) {
  localStorage.setItem('resume', JSON.stringify(data))
}

export function getSession() {
  const data = localStorage.getItem('resume')
  return data ? JSON.parse(data) : null
}

export function clearSession() {
  localStorage.removeItem('resume')
}
