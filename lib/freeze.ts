export function hasFreeze() {
  const freeze = localStorage.getItem('freeze')
  return freeze !== 'used'
}

export function useFreeze() {
  localStorage.setItem('freeze', 'used')
}
