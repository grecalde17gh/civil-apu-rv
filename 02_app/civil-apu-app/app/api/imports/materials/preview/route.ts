import { NextResponse } from 'next/server'
import { previewMaterialsFromBuffer } from '@/src/lib/imports/materialsImport'

export async function POST(request: Request) {
  const form = await request.formData()
  const fileEntry = form.get('file')
  if (!fileEntry || typeof (fileEntry as File).arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'Falta archivo' }, { status: 400 })
  }

  const arrayBuffer = await (fileEntry as File).arrayBuffer()
  const preview = await previewMaterialsFromBuffer(arrayBuffer)
  return NextResponse.json({ preview })
}
