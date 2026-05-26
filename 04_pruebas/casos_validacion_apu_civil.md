# Casos de Validación — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define los casos de validación iniciales para comprobar que la aplicación calcula correctamente los Análisis de Precios Unitarios y presupuestos de obra.

La validación se realizará comparando:

1. Resultados del Excel base.
2. Resultados calculados por la aplicación.
3. Revisión técnica de Franklin Recalde.

El objetivo es asegurar que el sistema no solo funcione visualmente, sino que calcule correctamente.

---

## 2. Archivo base de referencia

Archivo utilizado como fuente inicial:

```text
01_excel_base/APUS_RUBROS_IESS_HG.xlsm
```

Este archivo será usado para seleccionar rubros reales y comparar resultados.

---

## 3. Principio de validación

La regla principal será:

> Un cálculo solo será aceptado si coincide con el Excel base o si la diferencia está técnicamente justificada y validada por Franklin.

No se debe asumir que el Excel siempre está correcto. Si se detectan errores de fórmula o referencias rotas, deberán documentarse.

---

## 4. Objetivos de la validación

1. Validar que los catálogos se importen correctamente.
2. Validar que los rubros se estructuren correctamente.
3. Validar que los componentes del APU sean correctos.
4. Validar que los subtotales sean correctos.
5. Validar que el costo directo sea correcto.
6. Validar que los costos indirectos sean correctos.
7. Validar que el precio unitario final sea correcto.
8. Validar que el presupuesto total sea correcto.
9. Validar que las exportaciones mantengan los valores correctos.
10. Registrar diferencias y decisiones técnicas.

---

## 5. Tipos de pruebas

Se realizarán cinco tipos de pruebas:

1. Pruebas de catálogos.
2. Pruebas de cálculo APU.
3. Pruebas de presupuesto.
4. Pruebas de exportación.
5. Pruebas de regresión.

---

## 6. Pruebas de catálogos

## 6.1. Materiales

Objetivo:

Verificar que los materiales importados o cargados manualmente tengan datos correctos.

Checklist:

| Criterio | Resultado | Observaciones |
|---|---|---|
| Descripción cargada correctamente |  |  |
| Unidad cargada correctamente |  |  |
| Costo unitario cargado correctamente |  |  |
| CPC cargado si existe |  |  |
| VAE cargado si existe |  |  |
| No hay duplicados críticos |  |  |
| No hay costos negativos |  |  |

---

## 6.2. Mano de obra

Checklist:

| Criterio | Resultado | Observaciones |
|---|---|---|
| Cargo cargado correctamente |  |  |
| Costo hora cargado correctamente |  |  |
| CPC cargado si existe |  |  |
| VAE cargado si existe |  |  |
| No hay costos negativos |  |  |
| La unidad de cálculo es entendible |  |  |

---

## 6.3. Equipos

Checklist:

| Criterio | Resultado | Observaciones |
|---|---|---|
| Descripción cargada correctamente |  |  |
| Tarifa cargada correctamente |  |  |
| Tipo de tarifa identificado |  |  |
| CPC cargado si existe |  |  |
| VAE cargado si existe |  |  |
| No hay tarifas negativas |  |  |

---

## 7. Rubros iniciales de validación

Se tomarán rubros reales del Excel base.

## 7.1. Lista inicial sugerida

| Caso | Código | Descripción | Unidad | Precio Unitario Excel | Precio Unitario App | Diferencia | Estado |
|---:|---|---|---|---:|---:|---:|---|
| 1 | RP0009 | Retiro de pintura en superficies verticales y horizontales | m2 | 4.09 |  |  | Pendiente |
| 2 | RP0033 | Curado y resane de paredes con humedad | m2 | 6.13 |  |  | Pendiente |
| 3 | RALB0007 | Enlucido vertical | m2 | 6.32 |  |  | Pendiente |
| 4 | RRA0008 | Pintura látex vinil acrílico elastomérica | m2 | 11.31 |  |  | Pendiente |
| 5 | RCM0004 | Pintura anticorrosiva en rejas | m2 | 15.24 |  |  | Pendiente |
| 6 | REHA0005 | Hormigón simple f'c=210kg/cm2 en columnas | m3 | 200.71 |  |  | Pendiente |
| 7 | REHA0006 | Acero de refuerzo fy=4200kg/cm2 | kg | 2.30 |  |  | Pendiente |
| 8 | Por definir | Rubro adicional seleccionado por Franklin |  |  |  |  | Pendiente |
| 9 | Por definir | Rubro adicional seleccionado por Franklin |  |  |  |  | Pendiente |
| 10 | Por definir | Rubro adicional seleccionado por Franklin |  |  |  |  | Pendiente |

---

## 8. Criterio para seleccionar los 10 rubros

Los 10 rubros de prueba deberán cubrir diferentes situaciones.

Criterios sugeridos:

1. Rubros con materiales simples.
2. Rubros con mano de obra relevante.
3. Rubros con equipos.
4. Rubros con transporte, si existe.
5. Rubros con diferente unidad de medida.
6. Rubros de bajo costo.
7. Rubros de alto costo.
8. Rubros frecuentes en obra.
9. Rubros con fórmulas claras.
10. Rubros con posibles errores para probar robustez.

---

## 9. Ficha de validación por rubro

Cada rubro deberá tener una ficha de validación.

## 9.1. Formato de ficha

```text
Código del rubro:
Descripción:
Unidad:
Hoja de Excel origen:
Precio unitario Excel:
Precio unitario App:
Diferencia:
Estado:
Validador:
Fecha de validación:
Observaciones:
```

## 9.2. Validación de componentes

| Sección | Validación | Observaciones |
|---|---|---|
| Equipos |  |  |
| Mano de obra |  |  |
| Materiales |  |  |
| Transporte |  |  |
| Costos directos |  |  |
| Costos indirectos |  |  |
| Precio unitario |  |  |

---

## 10. Fórmulas a verificar por rubro

## 10.1. Materiales

```text
costo_material = cantidad × costo_unitario
```

## 10.2. Mano de obra

```text
costo_mano_obra = cantidad_trabajadores × costo_hora × tiempo_requerido
```

Esta fórmula está pendiente de validación según interpretación del rendimiento.

## 10.3. Equipos

```text
costo_equipo = cantidad_equipos × tarifa × tiempo_requerido
```

Esta fórmula está pendiente de validación según interpretación del rendimiento.

## 10.4. Transporte

```text
costo_transporte = cantidad × costo_unitario
```

## 10.5. Costo directo

```text
costo_directo = subtotal_materiales + subtotal_mano_obra + subtotal_equipos + subtotal_transporte
```

## 10.6. Costo indirecto

```text
costo_indirecto = costo_directo × porcentaje_indirectos
```

## 10.7. Precio unitario

```text
precio_unitario = costo_directo + costo_indirecto
```

---

## 11. Tolerancia de comparación

Para comparar Excel vs aplicación se usará una tolerancia inicial de:

```text
±0.01 USD
```

## 11.1. Estados de comparación

```text
coincide
coincide_por_redondeo
diferencia_menor
diferencia_requiere_revision
error_excel_detectado
error_app_detectado
pendiente_validacion
```

## 11.2. Interpretación

| Diferencia | Estado sugerido | Acción |
|---:|---|---|
| 0.00 | coincide | Aprobar si componentes correctos. |
| 0.01 o menos | coincide_por_redondeo | Revisar redondeo. |
| Entre 0.02 y 0.10 | diferencia_menor | Revisar fórmula y redondeos. |
| Mayor a 0.10 | diferencia_requiere_revision | Revisar componentes y fórmula. |

Estos rangos podrán ajustarse según criterio de Franklin.

---

## 12. Registro de diferencias

Cada diferencia debe documentarse.

| Código | Precio Excel | Precio App | Diferencia | Causa probable | Acción | Responsable |
|---|---:|---:|---:|---|---|---|
|  |  |  |  |  |  |  |

Causas posibles:

1. Redondeo.
2. Fórmula distinta.
3. Error en Excel.
4. Error en aplicación.
5. Costo base distinto.
6. Rendimiento interpretado diferente.
7. Componente faltante.
8. Componente duplicado.
9. Unidad mal interpretada.
10. Dato no importado.

---

## 13. Caso de validación de presupuesto

Además de validar rubros individuales, se deberá crear un presupuesto completo de prueba.

## 13.1. Presupuesto de prueba mínimo

Nombre sugerido:

```text
Presupuesto de validación MVP 0.1
```

Debe contener al menos 5 rubros de los casos seleccionados.

Ejemplo:

| Ítem | Código | Descripción | Unidad | Cantidad | Precio Unitario | Total |
|---|---|---|---|---:|---:|---:|
| 1 | RP0009 | Retiro de pintura en superficies verticales y horizontales | m2 | 100 | 4.09 | 409.00 |
| 2 | RP0033 | Curado y resane de paredes con humedad | m2 | 50 | 6.13 | 306.50 |
| 3 | RALB0007 | Enlucido vertical | m2 | 80 | 6.32 | 505.60 |
| 4 | RRA0008 | Pintura látex vinil acrílico elastomérica | m2 | 120 | 11.31 | 1357.20 |
| 5 | REHA0006 | Acero de refuerzo fy=4200kg/cm2 | kg | 500 | 2.30 | 1150.00 |

Total esperado:

```text
3728.30
```

Este ejemplo usa cantidades ficticias solo para probar el motor de presupuesto.

---

## 14. Validaciones del presupuesto

| Criterio | Resultado | Observaciones |
|---|---|---|
| Los rubros se agregan correctamente |  |  |
| Las cantidades se guardan correctamente |  |  |
| El total por ítem es correcto |  |  |
| El total general es correcto |  |  |
| Los precios unitarios quedan como snapshot |  |  |
| El presupuesto no cambia si cambia un rubro después |  |  |
| El presupuesto puede duplicarse |  |  |
| El presupuesto puede emitirse |  |  |

---

## 15. Prueba de snapshots

Objetivo:

Validar que un presupuesto emitido no cambie automáticamente cuando se actualiza un rubro.

## 15.1. Pasos

1. Crear un rubro con precio unitario de 10.00.
2. Agregarlo a un presupuesto con cantidad 5.
3. Verificar total:

```text
5 × 10.00 = 50.00
```

4. Emitir o guardar el presupuesto.
5. Cambiar el precio del rubro a 12.00.
6. Verificar que el presupuesto anterior siga mostrando:

```text
50.00
```

7. Crear un nuevo presupuesto con el mismo rubro.
8. Verificar que el nuevo presupuesto use:

```text
12.00
```

## 15.2. Resultado esperado

El presupuesto histórico debe mantener el precio original.

---

## 16. Prueba de actualización de precios

Objetivo:

Validar que el sistema permita actualizar costos de materiales, mano de obra o equipos sin romper cálculos existentes.

## 16.1. Pasos

1. Seleccionar un material usado en un rubro.
2. Cambiar su costo unitario.
3. Verificar que el sistema pregunte o permita decidir si se recalcula el rubro.
4. Recalcular el rubro en borrador.
5. Verificar nuevo precio unitario.
6. Verificar que presupuestos emitidos no cambien automáticamente.

---

## 17. Pruebas de exportación

## 17.1. Excel

Validar:

| Criterio | Resultado | Observaciones |
|---|---|---|
| El archivo se genera |  |  |
| Se abre correctamente en Excel |  |  |
| Muestra rubros completos |  |  |
| Muestra cantidades |  |  |
| Muestra precios unitarios |  |  |
| Muestra totales |  |  |
| El total coincide con la app |  |  |

---

## 17.2. PDF

Validar:

| Criterio | Resultado | Observaciones |
|---|---|---|
| El PDF se genera |  |  |
| Tiene formato profesional |  |  |
| Muestra datos del proyecto |  |  |
| Muestra tabla de presupuesto |  |  |
| Muestra total general |  |  |
| El total coincide con la app |  |  |

---

## 17.3. APU individual PDF

Validar:

| Criterio | Resultado | Observaciones |
|---|---|---|
| Muestra datos generales del rubro |  |  |
| Muestra equipos |  |  |
| Muestra mano de obra |  |  |
| Muestra materiales |  |  |
| Muestra transporte si aplica |  |  |
| Muestra costo directo |  |  |
| Muestra costo indirecto |  |  |
| Muestra precio unitario |  |  |

---

## 18. Pruebas de validación de errores

El sistema debe impedir o advertir errores comunes.

| Caso | Entrada | Resultado esperado |
|---|---|---|
| Material con costo negativo | -5.00 | Error: costo no puede ser negativo |
| Rubro sin descripción | vacío | Error: descripción obligatoria |
| Rubro sin unidad | vacío | Error: unidad obligatoria |
| Presupuesto sin rubros | vacío | No permitir exportar |
| Cantidad negativa en presupuesto | -10 | Error: cantidad no puede ser negativa |
| Rubro sin componentes | sin datos | Advertencia o bloqueo según estado |
| Precio unitario cero | 0.00 | Advertencia antes de emitir |

---

## 19. Pruebas de regresión

Cada vez que se cambie una fórmula o regla de cálculo, se deberán repetir los casos de validación.

## 19.1. Cuándo repetir pruebas

Repetir pruebas cuando:

1. Cambie la fórmula de mano de obra.
2. Cambie la fórmula de equipos.
3. Cambie la regla de rendimiento.
4. Cambie el redondeo.
5. Cambie el cálculo de indirectos.
6. Cambie la importación desde Excel.
7. Cambie el modelo de datos.
8. Cambie el motor de presupuesto.

## 19.2. Resultado esperado

No debe romperse ningún caso previamente validado.

---

## 20. Registro de ejecución de pruebas

| Fecha | Versión | Prueba ejecutada | Resultado | Responsable | Observaciones |
|---|---|---|---|---|---|
|  | MVP 0.1 | Catálogos |  |  |  |
|  | MVP 0.1 | Rubros APU |  |  |  |
|  | MVP 0.1 | Presupuesto |  |  |  |
|  | MVP 0.1 | Exportación Excel |  |  |  |
|  | MVP 0.1 | Exportación PDF |  |  |  |

---

## 21. Criterios de aceptación general

El sistema podrá considerarse validado en su MVP si:

1. Se cargan correctamente los catálogos iniciales.
2. Se validan al menos 10 rubros reales.
3. Los precios unitarios coinciden con el Excel o sus diferencias están justificadas.
4. Se crea al menos un presupuesto de prueba.
5. El presupuesto calcula correctamente los totales.
6. Los snapshots funcionan correctamente.
7. Las exportaciones mantienen los valores correctos.
8. No existen errores críticos pendientes.
9. Franklin aprueba la versión.

---

## 22. Resultado de validación final

Formato sugerido:

```text
Versión evaluada:
Fecha:
Validador técnico:
Resultado:
- Aprobado
- Aprobado con observaciones
- No aprobado

Observaciones generales:
Acciones pendientes:
```

---

## 23. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

