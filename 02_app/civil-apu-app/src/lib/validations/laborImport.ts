import { isValidCatalogCode } from '../catalogCodes'

export type LaborImportRow = {
  rowNumber: number
  Code?: string | null
  RoleName?: string | null
  Unit?: string | null
  HourlyCost?: number | null
  Cpc?: string | null
  Vae?: number | null
  Category?: string | null
  IsActive?: boolean | null
}

export type LaborRowValidation = {
  valid: boolean
  errors: string[]
}

export function validateLaborImportRow(row: LaborImportRow): LaborRowValidation {
  const errors: string[] = []

  if (row.Code && !isValidCatalogCode(String(row.Code), 'MO')) {
    errors.push('Codigo debe tener formato MO-001')
  }

  if (!row.RoleName || String(row.RoleName).trim() === '') {
    errors.push('Falta rol')
  }

  if (!row.Unit || String(row.Unit).trim() === '') {
    errors.push('Falta unidad')
  }

  if (row.HourlyCost == null) {
    errors.push('Falta costo o formato invalido')
  } else if (row.HourlyCost < 0) {
    errors.push('Costo debe ser >= 0')
  }
  if (row.Cpc != null && Number.isNaN(Number(row.Cpc))) {
    errors.push('CPC debe ser numerico')
  } else if (row.Cpc != null && Number(row.Cpc) < 0) {
    errors.push('CPC debe ser >= 0')
  }
  if (row.Vae != null && row.Vae < 0) {
    errors.push('VAE debe ser >= 0')
  }

  return { valid: errors.length === 0, errors }
}

export default validateLaborImportRow
