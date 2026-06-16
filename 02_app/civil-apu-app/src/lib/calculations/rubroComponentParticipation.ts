export type NpEpNd = 'NP' | 'EP' | 'ND'

export function calculateRelativeWeight(componentTotal: number, rubroDirectTotal: number): number {
  if (!Number.isFinite(componentTotal) || !Number.isFinite(rubroDirectTotal) || rubroDirectTotal <= 0) {
    return 0
  }

  return componentTotal / rubroDirectTotal
}

export function calculateNpEpNd(vae: unknown): NpEpNd {
  const numericVae = toFiniteNumber(vae)

  if (numericVae === 1) {
    return 'EP'
  }

  if (numericVae === 0) {
    return 'NP'
  }

  return 'ND'
}

export function calculateVaeElement(relativeWeight: number, vae: unknown): number {
  if (!Number.isFinite(relativeWeight)) {
    return 0
  }

  const numericVae = toFiniteNumber(vae)
  return relativeWeight * (numericVae ?? 0)
}

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
    const numericValue = Number(value.toString())
    return Number.isFinite(numericValue) ? numericValue : null
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}
