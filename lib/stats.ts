export async function submitStats(payload: {
  mode: string
  date: string
  card_id: string
  guess_count: number
  solved: boolean
}) {
  try {
    await fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // silent fail
  }
}

export async function fetchStats(mode: string, date: string): Promise<{ total: number; solves: number }> {
  try {
    const res = await fetch(`/api/stats?mode=${mode}&date=${date}`)
    if (!res.ok) return { total: 0, solves: 0 }
    return await res.json()
  } catch {
    return { total: 0, solves: 0 }
  }
}
