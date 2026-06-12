export type PrototypeCatalogItem = {
  id: string
  code: string
  description: string
  unit: string
  unitPrice: number
  source: string
  status: 'Activo' | 'Revision' | 'Inactivo'
}

export type PrototypeRubroComponent = PrototypeCatalogItem & {
  quantity: number
  performance: number
  subtotal: number
}

export type PrototypeRubro = {
  id: string
  code: string
  description: string
  unit: string
  performance: number
  indirectPercentage: number
  materials: PrototypeRubroComponent[]
  labor: PrototypeRubroComponent[]
  equipment: PrototypeRubroComponent[]
}

export type PrototypeBudgetItem = {
  id: string
  number: string
  code: string
  description: string
  unit: string
  quantity: number
  unitPrice: number
  type: 'chapter' | 'rubro'
}

export const prototypeMaterials: PrototypeCatalogItem[] = [
  {
    id: 'mat-001',
    code: 'MAT-0001',
    description: 'Cemento portland tipo GU',
    unit: 'saco',
    unitPrice: 8.95,
    source: 'Base IESS HG',
    status: 'Activo',
  },
  {
    id: 'mat-002',
    code: 'MAT-0002',
    description: 'Arena fina lavada',
    unit: 'm3',
    unitPrice: 18.5,
    source: 'Base IESS HG',
    status: 'Activo',
  },
  {
    id: 'mat-003',
    code: 'MAT-0003',
    description: 'Ripio triturado 3/4',
    unit: 'm3',
    unitPrice: 24.25,
    source: 'Proveedor demo',
    status: 'Revision',
  },
  {
    id: 'mat-004',
    code: 'MAT-0004',
    description: 'Bloque liviano 15 cm',
    unit: 'u',
    unitPrice: 0.58,
    source: 'Proveedor demo',
    status: 'Activo',
  },
]

export const prototypeLabor: PrototypeCatalogItem[] = [
  {
    id: 'lab-001',
    code: 'MO-0001',
    description: 'Albanil',
    unit: 'hora',
    unitPrice: 4.75,
    source: 'Tabla salarial demo',
    status: 'Activo',
  },
  {
    id: 'lab-002',
    code: 'MO-0002',
    description: 'Peon',
    unit: 'hora',
    unitPrice: 3.65,
    source: 'Tabla salarial demo',
    status: 'Activo',
  },
  {
    id: 'lab-003',
    code: 'MO-0003',
    description: 'Maestro mayor',
    unit: 'hora',
    unitPrice: 6.4,
    source: 'Tabla salarial demo',
    status: 'Activo',
  },
]

export const prototypeEquipment: PrototypeCatalogItem[] = [
  {
    id: 'eq-001',
    code: 'EQ-0001',
    description: 'Concretera 1 saco',
    unit: 'hora',
    unitPrice: 3.2,
    source: 'Base equipos demo',
    status: 'Activo',
  },
  {
    id: 'eq-002',
    code: 'EQ-0002',
    description: 'Vibrador de hormigon',
    unit: 'hora',
    unitPrice: 2.85,
    source: 'Base equipos demo',
    status: 'Activo',
  },
  {
    id: 'eq-003',
    code: 'EQ-0003',
    description: 'Herramienta menor',
    unit: '%',
    unitPrice: 5,
    source: 'Base equipos demo',
    status: 'Revision',
  },
]

export const prototypeRubros: PrototypeRubro[] = [
  {
    id: 'rubro-001',
    code: 'R-001',
    description: 'Hormigon simple f c 210 kg/cm2',
    unit: 'm3',
    performance: 1,
    indirectPercentage: 20,
    materials: [
      componentFromCatalog(prototypeMaterials[0], 7.5, 1),
      componentFromCatalog(prototypeMaterials[1], 0.52, 1),
      componentFromCatalog(prototypeMaterials[2], 0.8, 1),
    ],
    labor: [componentFromCatalog(prototypeLabor[0], 1.8, 1), componentFromCatalog(prototypeLabor[1], 2.4, 1)],
    equipment: [componentFromCatalog(prototypeEquipment[0], 0.65, 1), componentFromCatalog(prototypeEquipment[1], 0.4, 1)],
  },
  {
    id: 'rubro-002',
    code: 'R-002',
    description: 'Mamposteria de bloque 15 cm',
    unit: 'm2',
    performance: 9,
    indirectPercentage: 20,
    materials: [
      componentFromCatalog(prototypeMaterials[0], 0.08, 1),
      componentFromCatalog(prototypeMaterials[1], 0.018, 1),
      componentFromCatalog(prototypeMaterials[3], 12.5, 1),
    ],
    labor: [componentFromCatalog(prototypeLabor[0], 0.33, 1), componentFromCatalog(prototypeLabor[1], 0.42, 1)],
    equipment: [componentFromCatalog(prototypeEquipment[2], 1, 1)],
  },
  {
    id: 'rubro-003',
    code: 'R-003',
    description: 'Enlucido vertical mortero 1:3',
    unit: 'm2',
    performance: 12,
    indirectPercentage: 20,
    materials: [componentFromCatalog(prototypeMaterials[0], 0.12, 1), componentFromCatalog(prototypeMaterials[1], 0.025, 1)],
    labor: [componentFromCatalog(prototypeLabor[0], 0.28, 1), componentFromCatalog(prototypeLabor[1], 0.36, 1)],
    equipment: [componentFromCatalog(prototypeEquipment[2], 1, 1)],
  },
]

export const prototypeBudgetItems: PrototypeBudgetItem[] = [
  {
    id: 'chapter-1',
    number: '1',
    code: 'CAP-01',
    description: 'PRELIMINARES',
    unit: '',
    quantity: 0,
    unitPrice: 0,
    type: 'chapter',
  },
  {
    id: 'item-1',
    number: '1.1',
    code: 'R-003',
    description: 'Enlucido vertical mortero 1:3',
    unit: 'm2',
    quantity: 180,
    unitPrice: 7.22,
    type: 'rubro',
  },
  {
    id: 'chapter-2',
    number: '2',
    code: 'CAP-02',
    description: 'ESTRUCTURA',
    unit: '',
    quantity: 0,
    unitPrice: 0,
    type: 'chapter',
  },
  {
    id: 'item-2',
    number: '2.1',
    code: 'R-001',
    description: 'Hormigon simple f c 210 kg/cm2',
    unit: 'm3',
    quantity: 42.5,
    unitPrice: 104.38,
    type: 'rubro',
  },
  {
    id: 'item-3',
    number: '2.2',
    code: 'R-002',
    description: 'Mamposteria de bloque 15 cm',
    unit: 'm2',
    quantity: 260,
    unitPrice: 12.84,
    type: 'rubro',
  },
]

export function formatMoney(value: number) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function getRubroDirectCost(rubro: PrototypeRubro) {
  return sumComponents(rubro.materials) + sumComponents(rubro.labor) + sumComponents(rubro.equipment)
}

export function getRubroUnitPrice(rubro: PrototypeRubro) {
  const directCost = getRubroDirectCost(rubro)
  return directCost * (1 + rubro.indirectPercentage / 100)
}

export function getBudgetDirectCost(items = prototypeBudgetItems) {
  return items.reduce((total, item) => {
    if (item.type === 'chapter') return total
    return total + item.quantity * item.unitPrice
  }, 0)
}

function componentFromCatalog(item: PrototypeCatalogItem, quantity: number, performance: number): PrototypeRubroComponent {
  return {
    ...item,
    quantity,
    performance,
    subtotal: quantity * item.unitPrice * performance,
  }
}

function sumComponents(items: PrototypeRubroComponent[]) {
  return items.reduce((total, item) => total + item.subtotal, 0)
}
