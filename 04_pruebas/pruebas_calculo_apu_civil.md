# Pruebas de Cálculo — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define las pruebas técnicas que deberán aplicarse al motor de cálculo del sistema de presupuestos y análisis de precios unitarios.

El objetivo es comprobar que las funciones de cálculo trabajen correctamente antes de conectarlas con la interfaz de usuario.

Estas pruebas servirán como guía para crear pruebas unitarias en el código.

---

## 2. Principio técnico

La regla principal será:

> La interfaz no debe calcular directamente. Todos los cálculos deben ejecutarse mediante funciones centralizadas y probadas.

Esto permite que el sistema sea más confiable, mantenible y fácil de validar.

---

## 3. Ubicación sugerida del motor de cálculo

Dentro de la aplicación, las funciones de cálculo deberían ubicarse en:

```text
02_app/civil-apu-app/src/lib/calculations/
```

Archivos sugeridos:

```text
materials.ts
labor.ts
equipment.ts
transport.ts
apu.ts
budget.ts
rounding.ts
```

---

## 4. Ubicación sugerida de pruebas

Las pruebas automáticas podrían ubicarse en:

```text
02_app/civil-apu-app/src/lib/calculations/__tests__/
```

Archivos sugeridos:

```text
materials.test.ts
labor.test.ts
equipment.test.ts
transport.test.ts
apu.test.ts
budget.test.ts
rounding.test.ts
```

---

## 5. Librería de pruebas sugerida

Para un proyecto Next.js + TypeScript se puede usar:

```text
Vitest
```

Alternativa:

```text
Jest
```

Recomendación inicial:

```text
Vitest
```

Por ser ligero, moderno y fácil de integrar.

---

## 6. Reglas generales de cálculo

## 6.1. Valores monetarios

Los valores monetarios deben manejarse con precisión decimal.

Regla:

```text
No usar Float para dinero en base de datos.
```

En TypeScript, puede usarse:

- Decimal.js.
- Prisma Decimal.
- Conversión controlada a number solo para operaciones simples y pruebas iniciales.

Para MVP, se puede iniciar con `number` en funciones puras, pero dejando documentado que la base usará `Decimal`.

---

## 6.2. Redondeo

Regla asumida inicial:

```text
Redondear valores monetarios finales a 2 decimales.
```

El redondeo debe centralizarse en una función única.

Función sugerida:

```ts
roundMoney(value: number, decimalPlaces = 2): number
```

---

## 6.3. Valores negativos

El sistema no debe permitir:

- Cantidades negativas.
- Costos negativos.
- Tarifas negativas.
- Rendimientos negativos.
- Porcentajes negativos.

---

## 7. Pruebas de redondeo

## 7.1. Función esperada

```ts
roundMoney(value: number, decimalPlaces?: number): number
```

## 7.2. Casos de prueba

| Caso | Entrada | Decimales | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 4.0911 | 2 | 4.09 |
| 2 | 6.1267 | 2 | 6.13 |
| 3 | 200.705 | 2 | 200.71 |
| 4 | 2.3 | 2 | 2.30 |
| 5 | 0 | 2 | 0.00 |
| 6 | 123.456789 | 4 | 123.4568 |

## 7.3. Casos borde

| Caso | Entrada | Resultado esperado |
|---:|---:|---:|
| 1 | valor negativo | Error o rechazo previo |
| 2 | NaN | Error |
| 3 | Infinity | Error |

---

## 8. Pruebas de materiales

## 8.1. Función esperada

```ts
calculateMaterialCost(quantity: number, unitCost: number): number
```

## 8.2. Fórmula

```text
costo_material = cantidad × costo_unitario
```

## 8.3. Casos de prueba

| Caso | Cantidad | Costo unitario | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 10 | 2.50 | 25.00 |
| 2 | 1.5 | 4.00 | 6.00 |
| 3 | 0 | 10.00 | 0.00 |
| 4 | 100 | 0.15 | 15.00 |
| 5 | 2.333 | 1.25 | 2.92 |

## 8.4. Casos inválidos

| Caso | Cantidad | Costo unitario | Resultado esperado |
|---:|---:|---:|---|
| 1 | -1 | 2.50 | Error |
| 2 | 10 | -2.50 | Error |
| 3 | NaN | 2.50 | Error |
| 4 | 10 | NaN | Error |

---

## 9. Pruebas de mano de obra

## 9.1. Función esperada inicial

```ts
calculateLaborCost(params: {
  workerQuantity: number;
  hourlyCost: number;
  timeRequired?: number;
  performanceValue?: number;
  performanceMode: PerformanceMode;
}): number
```

## 9.2. Modos de rendimiento

Modos asumidos:

```text
MANUAL_TIME
HOURS_PER_UNIT
UNITS_PER_HOUR
UNITS_PER_DAY
```

---

## 9.3. Modo MANUAL_TIME

Fórmula:

```text
costo_mano_obra = cantidad_trabajadores × costo_hora × tiempo_requerido
```

Casos:

| Caso | Trabajadores | Costo hora | Tiempo requerido | Resultado esperado |
|---:|---:|---:|---:|---:|
| 1 | 1 | 5.00 | 2 | 10.00 |
| 2 | 2 | 4.50 | 3 | 27.00 |
| 3 | 1.5 | 6.00 | 2 | 18.00 |
| 4 | 0 | 5.00 | 2 | 0.00 |

---

## 9.4. Modo UNITS_PER_HOUR

Regla asumida:

```text
tiempo_requerido = 1 / rendimiento
```

Fórmula:

```text
costo_mano_obra = cantidad_trabajadores × costo_hora × (1 / rendimiento)
```

Casos:

| Caso | Trabajadores | Costo hora | Rendimiento | Resultado esperado |
|---:|---:|---:|---:|---:|
| 1 | 1 | 5.00 | 2 | 2.50 |
| 2 | 2 | 5.00 | 4 | 2.50 |
| 3 | 1 | 8.00 | 0.5 | 16.00 |

Pendiente:

Esta interpretación debe ser validada por Franklin.

---

## 9.5. Modo UNITS_PER_DAY

Regla asumida:

```text
tiempo_requerido = horas_por_jornada / rendimiento
```

Con:

```text
horas_por_jornada = 8
```

Fórmula:

```text
costo_mano_obra = cantidad_trabajadores × costo_hora × (horas_por_jornada / rendimiento)
```

Casos:

| Caso | Trabajadores | Costo hora | Rendimiento día | Horas día | Resultado esperado |
|---:|---:|---:|---:|---:|---:|
| 1 | 1 | 5.00 | 8 | 8 | 5.00 |
| 2 | 2 | 5.00 | 8 | 8 | 10.00 |
| 3 | 1 | 6.00 | 4 | 8 | 12.00 |

Pendiente:

Esta interpretación debe ser validada por Franklin.

---

## 9.6. Casos inválidos de mano de obra

| Caso | Entrada inválida | Resultado esperado |
|---:|---|---|
| 1 | trabajadores negativos | Error |
| 2 | costo hora negativo | Error |
| 3 | tiempo requerido negativo | Error |
| 4 | rendimiento cero | Error |
| 5 | rendimiento negativo | Error |
| 6 | modo de rendimiento inválido | Error |
| 7 | MANUAL_TIME sin tiempo requerido | Error |

---

## 10. Pruebas de equipos

## 10.1. Función esperada inicial

```ts
calculateEquipmentCost(params: {
  equipmentQuantity: number;
  rate: number;
  timeRequired?: number;
  performanceValue?: number;
  performanceMode: PerformanceMode;
  rateType: RateType;
  hoursPerDay?: number;
}): number
```

---

## 10.2. Tarifa horaria con tiempo manual

Fórmula:

```text
costo_equipo = cantidad_equipos × tarifa_hora × tiempo_requerido
```

Casos:

| Caso | Equipos | Tarifa hora | Tiempo | Resultado esperado |
|---:|---:|---:|---:|---:|
| 1 | 1 | 10.00 | 2 | 20.00 |
| 2 | 2 | 15.00 | 3 | 90.00 |
| 3 | 0.5 | 20.00 | 4 | 40.00 |

---

## 10.3. Tarifa diaria convertida a hora

Regla asumida:

```text
tarifa_hora_equivalente = tarifa_diaria / horas_por_jornada
```

Con:

```text
horas_por_jornada = 8
```

Fórmula:

```text
costo_equipo = cantidad_equipos × tarifa_hora_equivalente × tiempo_requerido
```

Casos:

| Caso | Equipos | Tarifa diaria | Horas día | Tiempo | Resultado esperado |
|---:|---:|---:|---:|---:|---:|
| 1 | 1 | 80.00 | 8 | 2 | 20.00 |
| 2 | 2 | 160.00 | 8 | 1 | 40.00 |
| 3 | 1 | 100.00 | 10 | 5 | 50.00 |

Pendiente:

Validar con Franklin si esta conversión aplica a todos los equipos.

---

## 10.4. Tarifa fija

Fórmula asumida:

```text
costo_equipo = cantidad_equipos × tarifa_fija
```

Casos:

| Caso | Equipos | Tarifa fija | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 1 | 50.00 | 50.00 |
| 2 | 2 | 50.00 | 100.00 |
| 3 | 0.5 | 80.00 | 40.00 |

---

## 10.5. Casos inválidos de equipos

| Caso | Entrada inválida | Resultado esperado |
|---:|---|---|
| 1 | cantidad negativa | Error |
| 2 | tarifa negativa | Error |
| 3 | tiempo negativo | Error |
| 4 | horas por día igual a cero | Error |
| 5 | rendimiento cero | Error cuando aplique |
| 6 | tipo de tarifa inválido | Error |

---

## 11. Pruebas de transporte

## 11.1. Función esperada

```ts
calculateTransportCost(quantity: number, unitCost: number): number
```

## 11.2. Fórmula

```text
costo_transporte = cantidad × costo_unitario
```

## 11.3. Casos de prueba

| Caso | Cantidad | Costo unitario | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 1 | 25.00 | 25.00 |
| 2 | 3 | 10.00 | 30.00 |
| 3 | 0 | 15.00 | 0.00 |
| 4 | 2.5 | 8.00 | 20.00 |

## 11.4. Casos inválidos

| Caso | Entrada inválida | Resultado esperado |
|---:|---|---|
| 1 | cantidad negativa | Error |
| 2 | costo unitario negativo | Error |
| 3 | NaN | Error |

---

## 12. Pruebas de subtotal por sección

## 12.1. Función esperada

```ts
sumCosts(costs: number[]): number
```

## 12.2. Casos

| Caso | Costos | Resultado esperado |
|---:|---|---:|
| 1 | [10, 20, 30] | 60.00 |
| 2 | [0, 5.5, 4.5] | 10.00 |
| 3 | [] | 0.00 |
| 4 | [2.333, 1.111] | 3.44 |

## 12.3. Casos inválidos

| Caso | Entrada | Resultado esperado |
|---:|---|---|
| 1 | contiene negativo | Error |
| 2 | contiene NaN | Error |
| 3 | contiene Infinity | Error |

---

## 13. Pruebas de costo directo

## 13.1. Función esperada

```ts
calculateDirectCost(params: {
  materialsSubtotal: number;
  laborSubtotal: number;
  equipmentSubtotal: number;
  transportSubtotal: number;
}): number
```

## 13.2. Fórmula

```text
costo_directo = materiales + mano_obra + equipos + transporte
```

## 13.3. Casos

| Caso | Materiales | Mano obra | Equipos | Transporte | Resultado esperado |
|---:|---:|---:|---:|---:|---:|
| 1 | 100 | 50 | 25 | 0 | 175.00 |
| 2 | 0 | 50 | 25 | 10 | 85.00 |
| 3 | 10.25 | 5.25 | 2.50 | 1.00 | 19.00 |
| 4 | 0 | 0 | 0 | 0 | 0.00 |

---

## 14. Pruebas de costos indirectos

## 14.1. Función esperada

```ts
calculateIndirectCost(directCost: number, indirectPercentage: number): number
```

## 14.2. Fórmula

```text
costo_indirecto = costo_directo × porcentaje_indirectos
```

Donde el porcentaje se interpreta como valor porcentual.

Ejemplo:

```text
15 significa 15%
```

## 14.3. Casos

| Caso | Costo directo | % indirectos | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 100 | 15 | 15.00 |
| 2 | 200 | 10 | 20.00 |
| 3 | 50 | 0 | 0.00 |
| 4 | 123.45 | 15 | 18.52 |

## 14.4. Casos inválidos

| Caso | Entrada inválida | Resultado esperado |
|---:|---|---|
| 1 | costo directo negativo | Error |
| 2 | porcentaje negativo | Error |
| 3 | porcentaje no numérico | Error |

---

## 15. Pruebas de precio unitario

## 15.1. Función esperada

```ts
calculateUnitPrice(directCost: number, indirectPercentage: number): number
```

## 15.2. Fórmula

```text
precio_unitario = costo_directo + costo_indirecto
```

O:

```text
precio_unitario = costo_directo × (1 + porcentaje_indirectos / 100)
```

## 15.3. Casos

| Caso | Costo directo | % indirectos | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 100 | 15 | 115.00 |
| 2 | 200 | 10 | 220.00 |
| 3 | 50 | 0 | 50.00 |
| 4 | 123.45 | 15 | 141.97 |

---

## 16. Pruebas de APU completo

## 16.1. Función esperada

```ts
calculateAPU(params: {
  materials: number[];
  labor: number[];
  equipment: number[];
  transport: number[];
  indirectPercentage: number;
}): {
  materialsSubtotal: number;
  laborSubtotal: number;
  equipmentSubtotal: number;
  transportSubtotal: number;
  directCost: number;
  indirectCost: number;
  unitPrice: number;
}
```

## 16.2. Caso base

Entrada:

```text
materials = [60, 40]
labor = [25, 25]
equipment = [10]
transport = [5]
indirectPercentage = 15
```

Cálculos esperados:

```text
materialsSubtotal = 100.00
laborSubtotal = 50.00
equipmentSubtotal = 10.00
transportSubtotal = 5.00
directCost = 165.00
indirectCost = 24.75
unitPrice = 189.75
```

---

## 16.3. Caso sin transporte

Entrada:

```text
materials = [100]
labor = [50]
equipment = [25]
transport = []
indirectPercentage = 10
```

Resultado esperado:

```text
materialsSubtotal = 100.00
laborSubtotal = 50.00
equipmentSubtotal = 25.00
transportSubtotal = 0.00
directCost = 175.00
indirectCost = 17.50
unitPrice = 192.50
```

---

## 16.4. Caso con solo materiales

Entrada:

```text
materials = [100]
labor = []
equipment = []
transport = []
indirectPercentage = 15
```

Resultado esperado:

```text
materialsSubtotal = 100.00
laborSubtotal = 0.00
equipmentSubtotal = 0.00
transportSubtotal = 0.00
directCost = 100.00
indirectCost = 15.00
unitPrice = 115.00
```

---

## 17. Pruebas de presupuesto

## 17.1. Función esperada

```ts
calculateBudgetItemTotal(quantity: number, unitPrice: number): number
```

## 17.2. Fórmula

```text
total_item = cantidad × precio_unitario
```

## 17.3. Casos

| Caso | Cantidad | Precio unitario | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 100 | 4.09 | 409.00 |
| 2 | 50 | 6.13 | 306.50 |
| 3 | 80 | 6.32 | 505.60 |
| 4 | 120 | 11.31 | 1357.20 |
| 5 | 500 | 2.30 | 1150.00 |

---

## 18. Prueba de presupuesto completo

## 18.1. Función esperada

```ts
calculateBudgetTotal(items: { quantity: number; unitPrice: number }[]): number
```

## 18.2. Caso base

Entrada:

```text
items = [
  { quantity: 100, unitPrice: 4.09 },
  { quantity: 50, unitPrice: 6.13 },
  { quantity: 80, unitPrice: 6.32 },
  { quantity: 120, unitPrice: 11.31 },
  { quantity: 500, unitPrice: 2.30 }
]
```

Resultado esperado:

```text
total = 3728.30
```

---

## 19. Pruebas de IVA

El IVA se manejará como configurable.

## 19.1. Función esperada

```ts
calculateTaxAmount(subtotal: number, taxPercentage: number): number
```

## 19.2. Fórmula

```text
iva = subtotal × porcentaje_iva / 100
```

## 19.3. Casos

| Caso | Subtotal | IVA % | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 100 | 15 | 15.00 |
| 2 | 1000 | 15 | 150.00 |
| 3 | 3728.30 | 15 | 559.25 |
| 4 | 100 | 0 | 0.00 |

Pendiente:

Franklin debe validar si el IVA se incluye en presupuestos finales o solo se muestra separado.

---

## 20. Pruebas de total con IVA

## 20.1. Función esperada

```ts
calculateBudgetGrandTotal(subtotal: number, taxPercentage: number): number
```

## 20.2. Fórmula

```text
total = subtotal + iva
```

## 20.3. Casos

| Caso | Subtotal | IVA % | Resultado esperado |
|---:|---:|---:|---:|
| 1 | 100 | 15 | 115.00 |
| 2 | 1000 | 15 | 1150.00 |
| 3 | 3728.30 | 15 | 4287.55 |
| 4 | 100 | 0 | 100.00 |

---

## 21. Pruebas de snapshots

## 21.1. Objetivo

Comprobar que los precios guardados en presupuestos no cambien automáticamente si se actualiza un rubro.

## 21.2. Caso

1. Crear rubro con precio unitario 10.00.
2. Agregarlo a presupuesto con cantidad 5.
3. Total esperado:

```text
50.00
```

4. Cambiar precio actual del rubro a 12.00.
5. Verificar que el ítem del presupuesto mantenga `unitPriceSnapshot = 10.00`.
6. Verificar que el total siga siendo:

```text
50.00
```

---

## 22. Pruebas de errores críticos

| Caso | Entrada | Resultado esperado |
|---:|---|---|
| 1 | cantidad negativa | Error |
| 2 | costo negativo | Error |
| 3 | porcentaje negativo | Error |
| 4 | rendimiento cero | Error cuando aplique |
| 5 | tiempo requerido vacío en modo manual | Error |
| 6 | presupuesto vacío | Error o advertencia antes de exportar |
| 7 | APU sin componentes | Advertencia o error según estado |
| 8 | valor no numérico | Error |
| 9 | Infinity | Error |
| 10 | NaN | Error |

---

## 23. Pruebas con rubros reales del Excel

Estas pruebas se completarán después de extraer los datos del archivo Excel.

| Código | Precio Excel | Precio App | Diferencia | Estado | Observaciones |
|---|---:|---:|---:|---|---|
| RP0009 | 4.09 |  |  | Pendiente |  |
| RP0033 | 6.13 |  |  | Pendiente |  |
| RALB0007 | 6.32 |  |  | Pendiente |  |
| RRA0008 | 11.31 |  |  | Pendiente |  |
| RCM0004 | 15.24 |  |  | Pendiente |  |
| REHA0005 | 200.71 |  |  | Pendiente |  |
| REHA0006 | 2.30 |  |  | Pendiente |  |

---

## 24. Comandos sugeridos para pruebas

Cuando se configure Vitest, se podrán usar comandos como:

```bash
npm run test
```

O:

```bash
npx vitest
```

Para pruebas con reporte:

```bash
npx vitest --coverage
```

---

## 25. Prompt sugerido para Codex

```text
Actúa como desarrollador senior TypeScript especializado en pruebas unitarias.

Necesito crear el motor de cálculo para una aplicación de presupuestos y análisis de precios unitarios de ingeniería civil.

Crea funciones puras en:
src/lib/calculations/

Archivos requeridos:
- rounding.ts
- materials.ts
- labor.ts
- equipment.ts
- transport.ts
- apu.ts
- budget.ts

También crea pruebas unitarias con Vitest en:
src/lib/calculations/__tests__/

Reglas:
- No mezclar cálculos con interfaz.
- No usar valores negativos.
- Validar NaN e Infinity.
- Redondear valores monetarios a 2 decimales por defecto.
- Implementar funciones reutilizables.
- Incluir pruebas para materiales, mano de obra, equipos, transporte, APU completo, presupuesto, IVA y snapshots.
- Documentar que las fórmulas de rendimiento quedan pendientes de validación con Franklin.
```

---

## 26. Criterios de aceptación de las pruebas de cálculo

Las pruebas de cálculo se considerarán aceptadas cuando:

1. Todas las funciones principales existan.
2. Todas las funciones tengan pruebas unitarias.
3. No se permitan valores negativos.
4. Se controlen NaN e Infinity.
5. Los resultados esperados coincidan con este documento.
6. El motor de cálculo esté separado de la interfaz.
7. Los casos de presupuesto coincidan con los resultados esperados.
8. Los casos reales del Excel puedan añadirse como pruebas de regresión.

---

## 27. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

