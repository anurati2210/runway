import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, FinanceState } from '../engine/types'
import type { Decision } from '../engine/simulate'
import { applyHypothetical } from '../engine/simulate'
import { demoState } from '../engine/seed'

interface Actions {
  addTransaction: (amount: number, category: Category, note: string) => void
  setDay: (day: number) => void
  apply: (d: Decision) => void
  reset: () => void
}

export type Store = FinanceState & Actions

export const useFinance = create<Store>()(
  persist(
    (set) => ({
      ...demoState,
      addTransaction: (amount, category, note) =>
        set((s) => ({
          transactions: [
            ...s.transactions,
            { id: crypto.randomUUID(), amount, category, day: s.currentDay, note },
          ],
        })),
      setDay: (day) => set({ currentDay: Math.min(30, Math.max(1, day)) }),
      apply: (d) => set((s) => applyHypothetical(s, d)),
      reset: () => set({ ...demoState }),
    }),
    { name: 'runway-state' },
  ),
)