export async function POST(req: Request) {
  const pbUrl = process.env.POCKETBASE_URL
  if (!pbUrl) return Response.json({ ok: false }, { status: 503 })
  const body = await req.json()
  await fetch(`${pbUrl}/api/collections/guesses/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return Response.json({ ok: true })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode')
  const date = searchParams.get('date')
  const pbUrl = process.env.POCKETBASE_URL
  if (!pbUrl || !mode || !date) return Response.json({ total: 0, solves: 0 })
  const filter = encodeURIComponent(`mode='${mode}'&&date='${date}'`)
  const res = await fetch(
    `${pbUrl}/api/collections/guesses/records?filter=${filter}&fields=solved&perPage=500`,
    { cache: 'no-store' }
  )
  if (!res.ok) return Response.json({ total: 0, solves: 0 })
  const { items = [] } = await res.json()
  return Response.json({
    total: items.length,
    solves: items.filter((i: { solved: boolean }) => i.solved).length,
  })
}
