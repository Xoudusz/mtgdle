import { getPocketBase } from '@/lib/pocketbase'

export async function POST(req: Request) {
  const pb = getPocketBase()
  if (!pb) return Response.json({ ok: false }, { status: 503 })
  const body = await req.json()
  await pb.collection('guesses').create(body)
  return Response.json({ ok: true })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode')
  const date = searchParams.get('date')
  const pb = getPocketBase()
  if (!pb || !mode || !date) return Response.json({ total: 0, solves: 0 })
  const result = await pb.collection('guesses').getList(1, 500, {
    filter: pb.filter('mode = {:mode} && date = {:date}', { mode, date }),
    fields: 'solved',
  })
  const items = result.items
  return Response.json({
    total: items.length,
    solves: items.filter(i => i.solved).length,
  })
}
