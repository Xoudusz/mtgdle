import { Readable } from 'stream'
import { createGunzip } from 'zlib'

export interface BulkEntry {
  type: string
  jsonl_download_uri?: string
  download_uri?: string
}

export interface BulkDownload {
  url: string
  format: 'jsonl.gz' | 'json'
}

// Scryfall serves bulk files as gzipped JSON lines (`jsonl_download_uri`); the old
// `download_uri` (one big JSON array) was removed in 2026. Keep the old field as a fallback.
export function pickBulkDownload(index: { data: BulkEntry[] }, type = 'default_cards'): BulkDownload {
  const entry = index.data.find(d => d.type === type)
  if (!entry) throw new Error(`Could not find ${type} bulk entry`)
  if (entry.jsonl_download_uri) return { url: entry.jsonl_download_uri, format: 'jsonl.gz' }
  if (entry.download_uri) return { url: entry.download_uri, format: 'json' }
  throw new Error(`${type} bulk entry has no download URI`)
}

// Gunzip a JSON-lines stream and yield one parsed object per non-empty line.
// Iterates the gunzip stream directly so source/gzip errors reject the loop.
export async function* readJsonlGz<T>(stream: Readable): AsyncGenerator<T> {
  const gunzip = createGunzip()
  stream.on('error', err => gunzip.destroy(err))
  stream.pipe(gunzip)
  gunzip.setEncoding('utf8')
  let buf = ''
  for await (const chunk of gunzip as AsyncIterable<string>) {
    buf += chunk
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line) as T
    }
  }
  if (buf.trim()) yield JSON.parse(buf) as T
}
