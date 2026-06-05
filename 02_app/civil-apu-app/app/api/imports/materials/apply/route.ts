import { NextResponse } from 'next/server'
import { applyMaterialsImport } from '../../../../../src/lib/imports/materialsImport'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rows = body.rows
    if (!Array.isArray(rows)) return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })

    const result = await applyMaterialsImport(rows)
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `No se pudo importar materiales: ${error.message}` : 'No se pudo importar materiales' },
      { status: 500 },
    )
  }
}
