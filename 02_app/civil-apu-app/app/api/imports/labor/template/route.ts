import { LABOR_TEMPLATE_FILE_NAME, buildLaborTemplateBuffer } from '../../../../../src/lib/imports/laborImport'

export async function GET() {
  const buffer = await buildLaborTemplateBuffer()

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${LABOR_TEMPLATE_FILE_NAME}"`,
    },
  })
}
