import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Category } from '../../engine/types'
import { useFinance } from '../../store/useFinance'

const CATEGORIES: Category[] = ['food', 'transport', 'shopping', 'fun', 'bills', 'other']

export function AddExpense() {
  const addTransaction = useFinance((s) => s.addTransaction)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('food')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than 0')
      return
    }
    addTransaction(value, category, note.trim() || category)
    setAmount('')
    setNote('')
    setError('')
  }

  const field =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4" noValidate>
      <div>
        <label htmlFor="amt" className="mb-1 block text-sm text-slate-300">Amount (₹)</label>
        <input id="amt" inputMode="numeric" className={field} value={amount}
          onChange={(e) => setAmount(e.target.value)} placeholder="150" />
      </div>
      <div>
        <label htmlFor="cat" className="mb-1 block text-sm text-slate-300">Category</label>
        <select id="cat" className={field} value={category}
          onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="note" className="mb-1 block text-sm text-slate-300">Note</label>
        <input id="note" className={field} value={note}
          onChange={(e) => setNote(e.target.value)} placeholder="Lunch with friends" />
      </div>
      <div className="flex items-end">
        <button type="submit"
          className="w-full rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          Add expense
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-rose-300 sm:col-span-4">{error}</p>}
    </form>
  )
}