import { describe, expect, it } from 'vitest'
import { validateRubroEquipmentUpdateInput } from '../rubroEquipment'
import { validateRubroLaborUpdateInput } from '../rubroLabor'
import { validateRubroMaterialUpdateInput } from '../rubroMaterial'
import { validateRubroTransportUpdateInput } from '../rubroTransport'

describe('rubro line update validations', () => {
  it('accepts zero values when editing numeric fields', () => {
    expect(
      validateRubroMaterialUpdateInput({
        id: 'line-1',
        rubroId: 'rubro-1',
        quantity: '0',
        unitCostSnapshot: '0',
      }).quantity,
    ).toBe(0)

    expect(
      validateRubroLaborUpdateInput({
        id: 'line-2',
        rubroId: 'rubro-1',
        workerQuantity: '0',
        timeRequired: '0',
        hourlyCostSnapshot: '0',
      }).hourlyCostSnapshot,
    ).toBe(0)

    expect(
      validateRubroEquipmentUpdateInput({
        id: 'line-3',
        rubroId: 'rubro-1',
        equipmentQuantity: '0',
        timeRequired: '0',
        rateSnapshot: '0',
        notes: 'Equipo ajustado inline',
      }).rateSnapshot,
    ).toBe(0)

    expect(
      validateRubroEquipmentUpdateInput({
        id: 'line-3',
        rubroId: 'rubro-1',
        equipmentQuantity: '1',
        timeRequired: '2',
        rateSnapshot: '12',
        notes: 'Observacion editada',
      }).notes,
    ).toBe('Observacion editada')

    expect(
      validateRubroTransportUpdateInput({
        id: 'line-4',
        rubroId: 'rubro-1',
        description: 'Transporte',
        unit: 'u',
        quantity: '0',
        unitCost: '0',
      }).unitCost,
    ).toBe(0)
  })

  it('rejects negative edited numeric fields', () => {
    expect(() =>
      validateRubroMaterialUpdateInput({
        id: 'line-1',
        rubroId: 'rubro-1',
        quantity: '-1',
        unitCostSnapshot: '0',
      }),
    ).toThrow()

    expect(() =>
      validateRubroLaborUpdateInput({
        id: 'line-2',
        rubroId: 'rubro-1',
        workerQuantity: '1',
        timeRequired: '1',
        hourlyCostSnapshot: '-1',
      }),
    ).toThrow()
  })
})
