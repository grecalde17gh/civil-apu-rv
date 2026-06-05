import { MATERIALS_TEMPLATE_FILE_NAME, buildMaterialsTemplateBuffer } from '../../../../../src/lib/imports/materialsImport'

export async function GET() {
  const buffer = await buildMaterialsTemplateBuffer()

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${MATERIALS_TEMPLATE_FILE_NAME}"`,
    },
  })
}
