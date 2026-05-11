export type WhoSaidItUnlockState = {
  reliableJourneySource: boolean
  reachedBookOrder: number
}

export function getWhoSaidItUnlockState(): WhoSaidItUnlockState {
  // Safe temporary fallback:
  // the current app has Journey node coverage across Scripture,
  // but the active progress source in use is still Genesis-only
  // (`user_program_progress` with `program_id = "genesis"`).
  // Until Journey exposes a reliable reached-book source across all books,
  // Who Said It unlocks Genesis by default and keeps later books locked.
  return {
    reliableJourneySource: false,
    reachedBookOrder: 1,
  }
}

export function isWhoSaidItBookUnlocked(bookOrder: number) {
  return bookOrder <= getWhoSaidItUnlockState().reachedBookOrder
}
