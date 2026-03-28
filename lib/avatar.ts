export function getAvatar() {
  return localStorage.getItem('avatar') || '🙂'
}

export function setAvatar(avatar: string) {
  localStorage.setItem('avatar', avatar)
}
