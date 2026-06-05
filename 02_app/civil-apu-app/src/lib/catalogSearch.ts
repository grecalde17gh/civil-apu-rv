export type CatalogSearchOption = {
  id: string
  label: string
  searchText: string
  disabled?: boolean
  disabledReason?: string
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function filterCatalogOptions(
  options: CatalogSearchOption[],
  query: string,
  limit = 25,
): CatalogSearchOption[] {
  const normalizedQuery = normalize(query)
  const source = normalizedQuery
    ? options.filter((option) => normalize(`${option.label} ${option.searchText}`).includes(normalizedQuery))
    : options

  return source.slice(0, limit)
}

export function formatCatalogOption(parts: Array<string | null | undefined>, price?: string | null): string {
  const label = parts.map((part) => part?.trim()).filter(Boolean).join(' | ')
  return price && price.trim() !== '' ? `${label} | ${price}` : label
}
