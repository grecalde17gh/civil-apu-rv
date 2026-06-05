import { isValidCatalogCode } from '../catalogCodes'

export type EquipmentImportRow = {
  rowNumber: number
  Code?: string | null
  Description?: string | null
  Unit?: string | null
  HourlyRate?: number | null
  Cpc?: string | null
  Vae?: number | null
  EquipmentType?: string | null
  Category?: string | null
  IsActive?: boolean | null
}

export type EquipmentRowValidation = {
  valid: boolean
  errors: string[]
}

export function validateEquipmentImportRow(row: EquipmentImportRow): EquipmentRowValidation {
  const errors: string[] = []

  if (row.Code && !isValidCatalogCode(String(row.Code), 'EQ')) {
    errors.push('Codigo debe tener formato EQ-001')
  }

  if (!row.Description || String(row.Description).trim() === '') {
    errors.push('Falta descripcion')
  }

  if (!row.Unit || String(row.Unit).trim() === '') {
    errors.push('Falta unidad')
  }

  if (row.HourlyRate == null) {
    errors.push('Falta tarifa o formato invalido')
  } else if (row.HourlyRate < 0) {
    errors.push('Tarifa debe ser >= 0')
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

export default validateEquipmentImportRow
