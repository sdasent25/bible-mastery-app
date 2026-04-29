import { create } from "zustand"

type XPState = {
  xp: number
  setXP: (xp: number) => void
  incrementXP: (amount: number) => void
}

export const useXPStore = create<XPState>((set) => ({
  xp: 0,
  setXP: (xp) => set({ xp }),
  incrementXP: (amount) =>
    set((state) => ({ xp: state.xp + amount })),
}))
