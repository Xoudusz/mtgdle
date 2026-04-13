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

const NO_CACHE = process.env.NEXT_PUBLIC_NO_CACHE === 'true'

export function loadResult(date: string, mode: string): DailyResult | null {
  if (typeof window === 'undefined' || NO_CACHE) return null
  try {
    const raw = localStorage.getItem(getKey(date, mode))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveResult(result: DailyResult): void {
  if (typeof window === 'undefined' || NO_CACHE) return
  localStorage.setItem(getKey(result.date, result.mode), JSON.stringify(result))
}
