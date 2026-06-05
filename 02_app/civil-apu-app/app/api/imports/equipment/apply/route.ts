import { NextResponse } from 'next/server'
import { applyEquipmentImport } from '../../../../../src/lib/imports/equipmentImport'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rows = body.rows
    if (!Array.isArray(rows)) return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })

    const result = await applyEquipmentImport(rows)
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `No se pudo importar equipos: ${error.message}` : 'No se pudo importar equipos' },
      { status: 500 },
    )
  }
}
