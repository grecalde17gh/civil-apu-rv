export function resolveRubroTimeRequired(params: {
  rubroPerformanceValue?: number | null
  lineTimeRequired?: number | null
}): number {
  const rubroPerformance = params.rubroPerformanceValue

  if (typeof rubroPerformance === 'number' && Number.isFinite(rubroPerformance) && rubroPerformance > 0) {
    return rubroPerformance
  }

  const lineTimeRequired = params.lineTimeRequired
  if (typeof lineTimeRequired === 'number' && Number.isFinite(lineTimeRequired) && lineTimeRequired >= 0) {
    return lineTimeRequired
  }

  return 0
}

