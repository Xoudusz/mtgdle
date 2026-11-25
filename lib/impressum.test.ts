import { describe, expect, it } from 'vitest'
import { impressumEnabled } from './impressum'

describe('impressumEnabled', () => {
  it('is on by default when the variable is unset', () => {
    expect(impressumEnabled({} as NodeJS.ProcessEnv)).toBe(true)
  })

  it('stays on for "true" and any value other than false', () => {
    expect(impressumEnabled({ IMPRESSUM_ENABLED: 'true' } as NodeJS.ProcessEnv)).toBe(true)
    expect(impressumEnabled({ IMPRESSUM_ENABLED: '' } as NodeJS.ProcessEnv)).toBe(true)
    expect(impressumEnabled({ IMPRESSUM_ENABLED: '0' } as NodeJS.ProcessEnv)).toBe(true)
  })

  it('turns off only for "false", ignoring case and whitespace', () => {
    expect(impressumEnabled({ IMPRESSUM_ENABLED: 'false' } as NodeJS.ProcessEnv)).toBe(false)
    expect(impressumEnabled({ IMPRESSUM_ENABLED: ' FALSE ' } as NodeJS.ProcessEnv)).toBe(false)
  })
})
