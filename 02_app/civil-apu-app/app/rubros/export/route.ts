import { getRubros } from '@/src/lib/db/rubros'
import { safeExcelFileName, workbookToBuffer } from '@/src/lib/export/excel'
import { buildRubrosSummaryWorkbook } from '@/src/lib/export/rubrosExcel'

export async function GET() {
  const rubros = await getRubros()
  const workbook = buildRubrosSummaryWorkbook(rubros)
  const buffer = await workbookToBuffer(workbook)
  const fileName = safeExcelFileName('rubros-apu')

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
