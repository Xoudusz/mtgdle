import { Readable } from 'stream'
import { gzipSync } from 'zlib'
import { describe, expect, it } from 'vitest'
import { pickBulkDownload, readJsonlGz } from './scryfall-bulk'

describe('pickBulkDownload', () => {
  it('prefers the gzipped JSON-lines file', () => {
    const index = { data: [{ type: 'default_cards', jsonl_download_uri: 'https://x/a.jsonl.gz', download_uri: 'https://x/a.json' }] }
    expect(pickBulkDownload(index)).toEqual({ url: 'https://x/a.jsonl.gz', format: 'jsonl.gz' })
  })

  it('falls back to the legacy JSON array file', () => {
    const index = { data: [{ type: 'default_cards', download_uri: 'https://x/a.json' }] }
    expect(pickBulkDownload(index)).toEqual({ url: 'https://x/a.json', format: 'json' })
  })

  it('throws when the entry or its URI is missing', () => {
    expect(() => pickBulkDownload({ data: [{ type: 'oracle_cards' }] })).toThrow(/default_cards bulk entry/)
    expect(() => pickBulkDownload({ data: [{ type: 'default_cards' }] })).toThrow(/no download URI/)
  })
})

describe('readJsonlGz', () => {
  it('yields one object per non-empty line', async () => {
    const gz = gzipSync('{"name":"A"}\n\n{"name":"B"}\n')
    const out: Array<{ name: string }> = []
    for await (const card of readJsonlGz<{ name: string }>(Readable.from([gz]))) out.push(card)
    expect(out.map(c => c.name)).toEqual(['A', 'B'])
  })

  it('handles a last line without newline and lines split across chunks', async () => {
    const gz = gzipSync('{"name":"Æther"}\n{"name":"B"}')
    const chunks = [gz.subarray(0, 7), gz.subarray(7)]
    const out: Array<{ name: string }> = []
    for await (const card of readJsonlGz<{ name: string }>(Readable.from(chunks))) out.push(card)
    expect(out.map(c => c.name)).toEqual(['Æther', 'B'])
  })

  it('rejects on a truncated gzip stream', async () => {
    const gz = gzipSync('{"name":"A"}\n'.repeat(50))
    const consume = async () => {
      for await (const _ of readJsonlGz(Readable.from([gz.subarray(0, gz.length - 10)]))) { /* drain */ }
    }
    await expect(consume()).rejects.toThrow()
  })
})
