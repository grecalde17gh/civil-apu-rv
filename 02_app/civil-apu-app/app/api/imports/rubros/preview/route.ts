import { NextResponse } from 'next/server'
import { previewRubrosImportFromExcelBuffer } from '@/src/lib/imports/rubrosImport'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const fileEntry = form.get('file')

    if (!fileEntry || typeof (fileEntry as File).arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    const fileName = (fileEntry as File).name ?? ''
    if (!/\.(xlsx|xls)$/i.test(fileName)) {
      return NextResponse.json({ error: 'El archivo debe tener extension .xlsx o .xls' }, { status: 400 })
    }

    const arrayBuffer = await (fileEntry as File).arrayBuffer()
    const preview = await previewRubrosImportFromExcelBuffer(arrayBuffer)

    return NextResponse.json({ preview })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? `No se pudo validar el Excel: ${error.message}` : 'No se pudo validar el Excel' },
      { status: 500 },
    )
  }
}
