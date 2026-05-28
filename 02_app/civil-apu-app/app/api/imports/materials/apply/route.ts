import { NextResponse } from 'next/server'
import { applyMaterialsImport } from '@/src/lib/imports/materialsImport'

export async function POST(request: Request) {
  const body = await request.json()
  const rows = body.rows
  if (!Array.isArray(rows)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const result = await applyMaterialsImport(rows)
  return NextResponse.json({ result })
}
