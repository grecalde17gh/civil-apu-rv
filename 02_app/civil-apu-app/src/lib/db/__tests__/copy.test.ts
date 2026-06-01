import { describe, expect, it } from 'vitest'
import { buildCopyCode, buildCopyName, generateCopyCode } from '../copy'

describe('copy helpers', () => {
  it('builds copy names and code suffixes', () => {
    expect(buildCopyName('Hormigon simple')).toBe('Copia de Hormigon simple')
    expect(buildCopyCode('H-001', 0)).toBe('H-001-COPIA')
    expect(buildCopyCode('H-001', 2)).toBe('H-001-COPIA-2')
  })

  it('generates the next available copy code', async () => {
    const usedCodes = new Set(['H-001-COPIA', 'H-001-COPIA-1'])

    const code = await generateCopyCode('H-001', async (candidate) => usedCodes.has(candidate))

    expect(code).toBe('H-001-COPIA-2')
  })

  it('returns undefined when original code is empty', async () => {
    await expect(generateCopyCode('', async () => false)).resolves.toBeUndefined()
  })
})
