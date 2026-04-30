import PocketBase from 'pocketbase'

export function getPocketBase() {
  const url = process.env.POCKETBASE_URL
  if (!url) return null
  return new PocketBase(url)
}
