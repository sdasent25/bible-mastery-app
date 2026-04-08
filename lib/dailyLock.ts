export function isLocked(lastCompletedAt: string | null) {
  if (!lastCompletedAt) return false;

  const last = new Date(lastCompletedAt);
  const now = new Date();

  return (
    last.getDate() === now.getDate() &&
    last.getMonth() === now.getMonth() &&
    last.getFullYear() === now.getFullYear()
  );
}

export function getNextUnlockTime(lastCompletedAt: string) {
  const last = new Date(lastCompletedAt);

  const next = new Date(last);
  next.setDate(last.getDate() + 1);
  next.setHours(0, 0, 0, 0);

  return next;
}
