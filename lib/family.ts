export function getFamily() {
  const data = localStorage.getItem('family')
  return data ? JSON.parse(data) : null
}

export function createFamily(name: string) {
  const family = {
    name,
    members: [
      { name: 'You', score: 0 },
      { name: 'Family Member 1', score: 30 },
      { name: 'Family Member 2', score: 50 }
    ]
  }

  localStorage.setItem('family', JSON.stringify(family))
  return family
}
