import { EQUIPMENT_TEMPLATE_FILE_NAME, buildEquipmentTemplateBuffer } from '../../../../../src/lib/imports/equipmentImport'

export async function GET() {
  const buffer = await buildEquipmentTemplateBuffer()

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${EQUIPMENT_TEMPLATE_FILE_NAME}"`,
    },
  })
}
