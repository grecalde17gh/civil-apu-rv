import { NextResponse } from 'next/server'
import { previewLaborImportFromBuffer } from '../../../../../src/lib/imports/laborImport'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const fileEntry = form.get('file')
    if (!fileEntry || typeof (fileEntry as File).arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Falta archivo' }, { status: 400 })
    }

    const fileName = (fileEntry as File).name ?? ''
    if (!/\.(xlsx|xls)$/i.test(fileName)) {
      return NextResponse.json({ error: 'El archivo debe tener extension .xlsx o .xls' }, { status: 400 })
    }

    const arrayBuffer = await (fileEntry as File).arrayBuffer()
    const result = await previewLaborImportFromBuffer(arrayBuffer)
    const preview = result.preview
    if (preview.length === 0) {
      return NextResponse.json({ error: 'No se detectaron filas. Verifica que la hoja se llame Mano de obra y tenga encabezados validos.' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `No se pudo leer el Excel: ${error.message}` : 'No se pudo leer el Excel' },
      { status: 400 },
    )
  }
}
