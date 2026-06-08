import { isValidCatalogCode } from '../catalogCodes'

export type MaterialImportRow = {
  rowNumber: number
  Code?: string | null
  Description?: string | null
  Unit?: string | null
  UnitPrice?: number | null
  Price2?: number | null
  Price3?: number | null
  Cpc?: string | null
  Vae?: number | null
  Note?: string | null
  Denomination?: string | null
  IsActive?: boolean | null
  UsesCategory1?: boolean | null
  UsesCategory2?: boolean | null
}

export type MaterialRowValidation = {
  valid: boolean
  errors: string[]
}

export function validateMaterialRow(row: MaterialImportRow): MaterialRowValidation {
  const errors: string[] = []

  if (row.Code && !isValidCatalogCode(String(row.Code), 'MAT')) {
    errors.push('Code debe tener formato MAT-001')
  }
  if (!row.Description || String(row.Description).trim() === '') {
    errors.push('Falta Description')
  }
  if (!row.Unit || String(row.Unit).trim() === '') {
    errors.push('Falta Unit')
  }
  if (row.UnitPrice == null) {
    errors.push('Falta Precio 1 o formato invalido')
  } else if (typeof row.UnitPrice === 'number' && row.UnitPrice < 0) {
    errors.push('Precio 1 debe ser >= 0')
  }
  if (row.Price2 != null && row.Price2 < 0) {
    errors.push('Precio 2 debe ser >= 0')
  }
  if (row.Price3 != null && row.Price3 < 0) {
    errors.push('Precio 3 debe ser >= 0')
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

export default validateMaterialRow
