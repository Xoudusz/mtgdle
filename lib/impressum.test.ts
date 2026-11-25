import { describe, expect, it } from 'vitest'
import { impressumEnabled } from './impressum'

describe('impressumEnabled', () => {
  it('is on by default when the variable is unset', () => {
    expect(impressumEnabled({})).toBe(true)
  })

  it('stays on for "true" and any value other than false', () => {
    expect(impressumEnabled({ IMPRESSUM_ENABLED: 'true' })).toBe(true)
    expect(impressumEnabled({ IMPRESSUM_ENABLED: '' })).toBe(true)
    expect(impressumEnabled({ IMPRESSUM_ENABLED: '0' })).toBe(true)
  })

  it('turns off only for "false", ignoring case and whitespace', () => {
    expect(impressumEnabled({ IMPRESSUM_ENABLED: 'false' })).toBe(false)
    expect(impressumEnabled({ IMPRESSUM_ENABLED: ' FALSE ' })).toBe(false)
  })
})
