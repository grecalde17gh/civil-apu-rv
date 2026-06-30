import { NextResponse } from 'next/server'
import { applyLaborImport } from '../../../../../src/lib/imports/laborImport'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rows = body.rows
    if (!Array.isArray(rows)) return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })

    const result = await applyLaborImport(rows, {
      updateMode: body.updateMode,
      overwriteFields: Array.isArray(body.overwriteFields) ? body.overwriteFields : [],
      createMissingDenominations: Boolean(body.createMissingDenominations),
    })
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `No se pudo importar mano de obra: ${error.message}` : 'No se pudo importar mano de obra' },
      { status: 500 },
    )
  }
}
