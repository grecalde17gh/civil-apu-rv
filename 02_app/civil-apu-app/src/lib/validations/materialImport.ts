export type MaterialImportRow = {
  rowNumber: number
  Code?: string | null
  Description?: string | null
  Unit?: string | null
  UnitPrice?: number | null
  Category?: string | null
  Source?: string | null
  Note?: string | null
  IsActive?: boolean | null
}

export type MaterialRowValidation = {
  valid: boolean
  errors: string[]
}

export function validateMaterialRow(row: MaterialImportRow): MaterialRowValidation {
  const errors: string[] = []
  if (!row.Description || String(row.Description).trim() === '') {
    errors.push('Falta Description')
  }
  if (!row.Unit || String(row.Unit).trim() === '') {
    errors.push('Falta Unit')
  }
  if (row.UnitPrice == null) {
    errors.push('Falta UnitPrice o formato inválido')
  } else if (typeof row.UnitPrice === 'number' && row.UnitPrice < 0) {
    errors.push('UnitPrice debe ser >= 0')
  }

  return { valid: errors.length === 0, errors }
}

export default validateMaterialRow
