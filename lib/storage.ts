const STORAGE_KEY = 'mtgdle_results'

export interface DailyResult {
  date: string
  mode: string
  solved: boolean
  guesses: string[]
}

function getKey(date: string, mode: string) {
  return `${STORAGE_KEY}_${date}_${mode}`
}

export function loadResult(date: string, mode: string): DailyResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getKey(date, mode))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveResult(result: DailyResult): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getKey(result.date, result.mode), JSON.stringify(result))
}
