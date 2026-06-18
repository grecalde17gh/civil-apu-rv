import { describe, expect, it } from 'vitest'
import { validateRubroEquipmentUpdateInput } from '../rubroEquipment'
import { validateRubroLaborUpdateInput } from '../rubroLabor'
import { validateRubroMaterialUpdateInput } from '../rubroMaterial'
import { validateRubroTransportUpdateInput } from '../rubroTransport'

describe('rubro line update validations', () => {
  it('accepts positive values when editing numeric fields', () => {
    expect(
      validateRubroMaterialUpdateInput({
        id: 'line-1',
        rubroId: 'rubro-1',
        quantity: '1',
        priceOption: '1',
      }).quantity,
    ).toBe(1)

    expect(
      validateRubroLaborUpdateInput({
        id: 'line-2',
        rubroId: 'rubro-1',
        workerQuantity: '1',
        timeRequired: '2',
      }).timeRequired,
    ).toBe(2)

    expect(
      validateRubroEquipmentUpdateInput({
        id: 'line-3',
        rubroId: 'rubro-1',
        equipmentQuantity: '1',
        timeRequired: '2',
        notes: 'Equipo ajustado inline',
      }).timeRequired,
    ).toBe(2)

    expect(
      validateRubroEquipmentUpdateInput({
        id: 'line-3',
        rubroId: 'rubro-1',
        equipmentQuantity: '1',
        timeRequired: '2',
        notes: 'Observacion editada',
      }).notes,
    ).toBe('Observacion editada')

    expect(
      validateRubroTransportUpdateInput({
        id: 'line-4',
        rubroId: 'rubro-1',
        description: 'Transporte',
        unit: 'u',
        quantity: '1',
        unitCost: '3',
      }).unitCost,
    ).toBe(3)
  })

  it('rejects zero or negative edited numeric fields', () => {
    expect(() =>
      validateRubroMaterialUpdateInput({
        id: 'line-1',
        rubroId: 'rubro-1',
        quantity: '0',
        priceOption: '1',
      }),
    ).toThrow()

    expect(() =>
      validateRubroMaterialUpdateInput({
        id: 'line-1',
        rubroId: 'rubro-1',
        quantity: '-1',
        priceOption: '1',
      }),
    ).toThrow()

    expect(() =>
      validateRubroLaborUpdateInput({
        id: 'line-2',
        rubroId: 'rubro-1',
        workerQuantity: '1',
        timeRequired: '-1',
      }),
    ).toThrow()

    expect(() =>
      validateRubroMaterialUpdateInput({
        id: 'line-1',
        rubroId: 'rubro-1',
        quantity: '1',
        priceOption: '2',
      }),
    ).not.toThrow()

    expect(() =>
      validateRubroMaterialUpdateInput({
        id: 'line-1',
        rubroId: 'rubro-1',
        quantity: '1',
        priceOption: '4',
      }),
    ).toThrow()
  })
})
