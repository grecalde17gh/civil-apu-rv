export function buildCopyName(name: string): string {
  return `Copia de ${name}`
}

export function buildCopyCode(code: string, suffixIndex: number): string {
  return suffixIndex === 0 ? `${code}-COPIA` : `${code}-COPIA-${suffixIndex}`
}

export async function generateCopyCode(originalCode: string | null | undefined, exists: (code: string) => Promise<boolean>): Promise<string | undefined> {
  if (!originalCode?.trim()) {
    return undefined
  }

  const baseCode = originalCode.trim()
  let suffixIndex = 0
  let candidate = buildCopyCode(baseCode, suffixIndex)

  while (await exists(candidate)) {
    suffixIndex += 1
    candidate = buildCopyCode(baseCode, suffixIndex)
  }

  return candidate
}
