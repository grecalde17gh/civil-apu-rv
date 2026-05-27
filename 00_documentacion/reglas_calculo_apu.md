# Reglas de Cálculo APU — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define las reglas de cálculo que utilizará el sistema para elaborar Análisis de Precios Unitarios y presupuestos de obra.

Su objetivo es convertir la lógica técnica utilizada actualmente en Excel en reglas claras, verificables y programables dentro de la aplicación.

Estas reglas deberán ser revisadas y validadas por Franklin Recalde, usuario experto del proyecto.

---

## 2. Conceptos principales

## 2.1. Análisis de Precio Unitario

El Análisis de Precio Unitario, o APU, permite calcular el costo de una unidad de un rubro de construcción.

Ejemplos de rubros:

- Enlucido vertical por metro cuadrado.
- Hormigón simple por metro cúbico.
- Acero de refuerzo por kilogramo.
- Pintura de paredes por metro cuadrado.
- Retiro de pintura por metro cuadrado.

Cada APU se compone principalmente de:

1. Equipos y herramientas.
2. Mano de obra.
3. Materiales.
4. Transporte, si aplica.
5. Costos directos.
6. Costos indirectos.
7. Precio unitario final.

---

## 3. Estructura general del cálculo

El cálculo general de un APU seguirá esta secuencia:

```text
1. Calcular subtotal de equipos.
2. Calcular subtotal de mano de obra.
3. Calcular subtotal de materiales.
4. Calcular subtotal de transporte, si aplica.
5. Calcular costo directo.
6. Calcular costo indirecto.
7. Calcular precio unitario final.
```

## 3.1. Reglas validadas por Franklin

Estas reglas han sido validadas por Franklin y definen el comportamiento actual del MVP:

- El rendimiento se expresa por unidad.
- El costo de mano de obra se calcula por hora.
- Los equipos se calculan por hora.
- El transporte se maneja como una sección separada.
- El porcentaje de costos indirectos por defecto es 20%, pero puede variar.
- El porcentaje de indirectos cambia por proyecto, no por rubro.
- El presupuesto final no debe incluir IVA.
- El VAE es informativo y no participa en el cálculo del precio unitario.

> Deuda técnica: actualmente el sistema guarda `indirectPercentage` en el rubro como solución temporal. Según la validación, los costos indirectos deben definirse a nivel de Proyecto o Presupuesto.

---

## 4. Datos generales del rubro

Cada rubro debe tener como mínimo los siguientes datos:

- Código del rubro.
- Descripción del rubro.
- Unidad de medida.
- Rendimiento.
- Porcentaje de costos indirectos.
- Componentes de equipo.
- Componentes de mano de obra.
- Componentes de materiales.
- Componentes de transporte, si aplica.

Ejemplo:

| Campo | Ejemplo |
|---|---|
| Código | RALB0007 |
| Descripción | Enlucido vertical |
| Unidad | m2 |
| Rendimiento | 1.00 |
| Costos indirectos | 15% |

---

## 5. Cálculo de equipos y herramientas

## 5.1. Campos requeridos

Cada componente de equipo debe tener:

- Descripción del equipo.
- Cantidad.
- Tarifa.
- Tiempo de uso o rendimiento aplicado.
- Costo calculado.

## 5.2. Fórmula base

```text
costo_equipo = cantidad × tarifa × tiempo_uso
```

También puede manejarse como:

```text
costo_equipo = cantidad × tarifa × factor_rendimiento
```

Actualmente la implementación del MVP usa la fórmula validada:

```text
costo_equipo = equipmentQuantity × rateSnapshot × timeRequired
```

La definición exacta del uso de `tiempo_uso` o `factor_rendimiento` deberá validarse con Franklin según la lógica del Excel base.

## 5.3. Subtotal de equipos

```text
subtotal_equipos = suma(costo_equipo_i)
```

Donde `i` representa cada equipo o herramienta asociada al rubro.

## 5.4. Validaciones para equipos

El sistema debe validar que:

1. La descripción del equipo no esté vacía.
2. La cantidad sea mayor o igual a cero.
3. La tarifa sea mayor o igual a cero.
4. El tiempo de uso o factor de rendimiento sea mayor o igual a cero.
5. No se permita calcular un costo negativo.

---

## 6. Cálculo de mano de obra

## 6.1. Campos requeridos

Cada componente de mano de obra debe tener:

- Tipo de trabajador o cargo.
- Cantidad de trabajadores.
- Costo por hora.
- Rendimiento o tiempo requerido.
- Costo calculado.

## 6.2. Fórmula base

```text
costo_mano_obra = cantidad_trabajadores × costo_hora × tiempo_requerido
```

Actualmente la implementación del MVP usa la fórmula validada:

```text
costo_mano_obra = workerQuantity × hourlyCostSnapshot × timeRequired
```

En caso de que el Excel maneje el rendimiento como producción por jornada, se deberá convertir correctamente el rendimiento a tiempo requerido.

Una posible variante será:

```text
tiempo_requerido = 1 / rendimiento
```

Y por tanto:

```text
costo_mano_obra = cantidad_trabajadores × costo_hora × tiempo_requerido
```

Esta regla debe ser confirmada con Franklin, porque el rendimiento es uno de los elementos más sensibles del cálculo.

## 6.3. Subtotal de mano de obra

```text
subtotal_mano_obra = suma(costo_mano_obra_i)
```

## 6.4. Validaciones para mano de obra

El sistema debe validar que:

1. El cargo o tipo de trabajo no esté vacío.
2. La cantidad de trabajadores sea mayor o igual a cero.
3. El costo por hora sea mayor o igual a cero.
4. El rendimiento o tiempo requerido sea mayor a cero cuando sea obligatorio.
5. No se permita calcular un costo negativo.

---

## 7. Cálculo de materiales

## 7.1. Campos requeridos

Cada componente de material debe tener:

- Descripción del material.
- Unidad.
- Cantidad requerida.
- Costo unitario.
- Costo calculado.

## 7.2. Fórmula base

```text
costo_material = cantidad_requerida × costo_unitario
```

## 7.3. Subtotal de materiales

```text
subtotal_materiales = suma(costo_material_i)
```

## 7.4. Validaciones para materiales

El sistema debe validar que:

1. La descripción del material no esté vacía.
2. La unidad no esté vacía.
3. La cantidad requerida sea mayor o igual a cero.
4. El costo unitario sea mayor o igual a cero.
5. No se permita calcular un costo negativo.

---

## 8. Cálculo de transporte

## 8.1. Aplicación

El transporte se utilizará únicamente cuando el rubro lo requiera.

Puede aplicar para:

- Transporte de materiales.
- Desalojo de escombros.
- Movilización de equipos.
- Acarreo interno.

## 8.2. Campos requeridos

Cada componente de transporte debe tener:

- Descripción.
- Unidad.
- Cantidad.
- Costo unitario.
- Costo calculado.

## 8.3. Fórmula base

```text
costo_transporte = cantidad × costo_unitario
```

Actualmente la implementación del MVP usa la fórmula validada:

```text
costo_transporte = quantity × unitCost
```

## 8.4. Subtotal de transporte

```text
subtotal_transporte = suma(costo_transporte_i)
```

Si el rubro no tiene transporte:

```text
subtotal_transporte = 0
```

---

## 9. Costo directo

## 9.1. Definición

El costo directo representa la suma de todos los costos directamente asociados a la ejecución del rubro.

## 9.2. Fórmula

```text
costo_directo = subtotal_equipos + subtotal_mano_obra + subtotal_materiales + subtotal_transporte
```

## 9.3. Validaciones

El sistema debe validar que:

1. El costo directo no sea negativo.
2. El costo directo no sea cero si el rubro tiene componentes obligatorios.
3. Todos los subtotales hayan sido calculados correctamente.

---

## 10. Costos indirectos

## 10.1. Definición

Los costos indirectos representan un porcentaje adicional aplicado sobre el costo directo para cubrir gastos generales, administración, utilidad u otros costos no directamente asignados al rubro.

## 10.2. Fórmula

```text
costo_indirecto = costo_directo × porcentaje_indirectos
```

Donde:

```text
porcentaje_indirectos = porcentaje / 100
```

Ejemplo:

```text
costo_directo = 100.00
porcentaje_indirectos = 15%
costo_indirecto = 100.00 × 0.15 = 15.00
```

## 10.3. Validaciones

El sistema debe validar que:

1. El porcentaje de indirectos no sea negativo.
2. El porcentaje de indirectos tenga un límite máximo configurable.
3. El costo indirecto no sea negativo.

Valor inicial sugerido para límite máximo:

```text
porcentaje_indirectos_maximo = 100%
```

Este límite podrá ajustarse según criterio técnico.

---

## 11. Precio unitario final

## 11.1. Fórmula base

```text
precio_unitario = costo_directo + costo_indirecto
```

También puede expresarse como:

```text
precio_unitario = costo_directo × (1 + porcentaje_indirectos)
```

## 11.2. Redondeo

El sistema deberá definir una regla de redondeo uniforme.

Regla inicial sugerida:

```text
precio_unitario = redondear(precio_unitario, 2 decimales)
```

Ejemplo:

```text
6.1267 → 6.13
4.0911 → 4.09
200.705 → 200.71
```

La regla de redondeo deberá ser validada con Franklin.

---

## 12. Cálculo de presupuesto

## 12.1. Datos requeridos por ítem

Cada ítem del presupuesto debe tener:

- Número de ítem.
- Código del rubro.
- Descripción del rubro.
- Unidad.
- Cantidad de obra.
- Precio unitario.
- Precio total.

## 12.2. Fórmula por ítem

```text
precio_total_item = cantidad_obra × precio_unitario
```

## 12.3. Total general del presupuesto

```text
total_presupuesto = suma(precio_total_item_i)
```

## 12.4. Redondeo de presupuesto

Regla inicial sugerida:

```text
precio_total_item = redondear(precio_total_item, 2 decimales)
total_presupuesto = redondear(suma(precio_total_item_i), 2 decimales)
```

---

## 13. Manejo de precios históricos

Para evitar cambios inesperados en presupuestos antiguos, el sistema deberá guardar una copia del precio usado al momento de agregar un rubro al presupuesto.

Esto se conoce como `snapshot` del precio.

Ejemplo:

- Precio actual del rubro: 10.50
- Precio usado en presupuesto anterior: 9.80

El presupuesto anterior debe conservar el valor 9.80, aunque el rubro haya sido actualizado después.

Campos sugeridos:

- `unit_price_snapshot`
- `material_cost_snapshot`
- `labor_cost_snapshot`
- `equipment_cost_snapshot`
- `created_at`

---

## 14. Manejo de actualización de precios

Cuando se actualice el costo de un material, mano de obra o equipo, el sistema deberá permitir:

1. Actualizar el precio en la base de datos.
2. Recalcular rubros afectados, si el usuario lo decide.
3. Mantener presupuestos anteriores sin modificación automática.
4. Registrar fecha de actualización.

Regla recomendada:

> La actualización de un insumo no debe modificar automáticamente presupuestos ya emitidos.

---

## 15. Estados de un rubro

Cada rubro podrá tener uno de los siguientes estados:

## 15.1. Borrador

Rubro en construcción. Puede tener datos incompletos.

## 15.2. Validado

Rubro revisado y aprobado técnicamente por Franklin o por un usuario autorizado.

## 15.3. Archivado

Rubro que ya no se usa, pero se conserva por trazabilidad.

---

## 16. Estados de un presupuesto

Cada presupuesto podrá tener uno de los siguientes estados:

## 16.1. Borrador

Presupuesto en construcción.

## 16.2. Revisado

Presupuesto revisado internamente.

## 16.3. Emitido

Presupuesto entregado al cliente o usado oficialmente.

## 16.4. Archivado

Presupuesto cerrado o histórico.

---

## 17. Validaciones críticas antes de emitir un presupuesto

Antes de emitir un presupuesto, el sistema deberá verificar:

1. Que el presupuesto tenga al menos un rubro.
2. Que todos los rubros tengan precio unitario.
3. Que no existan cantidades negativas.
4. Que no existan precios negativos.
5. Que todos los rubros tengan unidad de medida.
6. Que el total general sea mayor a cero.
7. Que los rubros estén en estado validado o que el usuario acepte trabajar con rubros no validados.

---

## 18. Reglas para duplicar rubros

El sistema deberá permitir duplicar un rubro existente para crear uno nuevo.

Al duplicar un rubro:

1. Se copiarán materiales, mano de obra, equipos y transporte.
2. Se copiará el porcentaje de costos indirectos.
3. Se copiará el rendimiento.
4. El nuevo rubro deberá quedar en estado `borrador`.
5. El usuario deberá asignar un nuevo código o aceptar un código generado automáticamente.

---

## 19. Reglas para duplicar presupuestos

El sistema deberá permitir duplicar un presupuesto existente.

Al duplicar un presupuesto:

1. Se copiarán los ítems del presupuesto.
2. Se conservarán las cantidades.
3. Se conservarán los precios unitarios como snapshot inicial.
4. El nuevo presupuesto deberá quedar en estado `borrador`.
5. El usuario podrá decidir si desea recalcular los precios con valores actuales.

---

## 20. Manejo de errores comunes

El sistema deberá mostrar mensajes claros cuando exista un problema.

Ejemplos:

| Situación | Mensaje sugerido |
|---|---|
| Material sin costo | El material seleccionado no tiene costo unitario registrado. |
| Rubro sin componentes | El rubro no tiene materiales, mano de obra ni equipos asociados. |
| Cantidad negativa | La cantidad no puede ser negativa. |
| Precio cero | Revise el precio unitario antes de continuar. |
| Presupuesto vacío | Agregue al menos un rubro antes de exportar. |

---

## 21. Casos de prueba iniciales

Se deberán seleccionar al menos 10 rubros del Excel base para comparar los cálculos.

Casos iniciales sugeridos:

| Código | Descripción | Unidad |
|---|---|---|
| RP0009 | Retiro de pintura en superficies verticales y horizontales | m2 |
| RP0033 | Curado y resane de paredes con humedad | m2 |
| RALB0007 | Enlucido vertical | m2 |
| RRA0008 | Pintura látex vinil acrílico elastomérica | m2 |
| RCM0004 | Pintura anticorrosiva en rejas | m2 |
| REHA0005 | Hormigón simple f'c=210kg/cm2 en columnas | m3 |
| REHA0006 | Acero de refuerzo fy=4200kg/cm2 | kg |

Franklin deberá completar o aprobar la lista definitiva de rubros de prueba.

---

## 22. Preguntas pendientes para Franklin

Estas preguntas deben resolverse antes de implementar el motor definitivo:

1. ¿Cómo se interpreta exactamente el rendimiento en cada tipo de rubro?
2. ¿El rendimiento se expresa por hora, por jornada o por unidad producida?
3. ¿El costo de mano de obra debe calcularse por hora, jornada o cuadrilla?
4. ¿Los equipos se calculan por hora, día o porcentaje de uso?
5. ¿El transporte siempre se maneja separado o puede estar incluido en materiales?
6. ¿Qué porcentaje de costos indirectos se usa por defecto?
7. ¿El porcentaje de indirectos cambia por proyecto o por rubro?
8. ¿Debe incluirse IVA en el presupuesto final?
9. ¿Cómo se maneja VAE en el cálculo o solo es informativo?
10. ¿Cómo se debe redondear el precio unitario final?
11. ¿Qué formato final debe tener el PDF de APU?
12. ¿Qué formato final debe tener el Excel exportado?

---

## 23. Reglas que no deben romperse

1. Un presupuesto emitido no debe cambiar automáticamente por actualización de precios.
2. Un rubro validado no debe modificarse sin registrar el cambio.
3. No se deben permitir costos negativos.
4. No se debe exportar un presupuesto vacío.
5. No se debe ocultar al usuario cómo se calculó el precio unitario.
6. El sistema debe permitir revisar los componentes de cada precio unitario.
7. La lógica técnica validada por Franklin tiene prioridad sobre cualquier sugerencia automática del sistema.

---

## 24. Futuras reglas para asistencia con IA

En fases futuras, si se integra inteligencia artificial, deberá cumplir estas reglas:

1. La IA podrá sugerir rubros, pero no validarlos automáticamente.
2. La IA podrá advertir inconsistencias, pero el usuario experto decidirá.
3. La IA no deberá modificar precios sin autorización.
4. La IA deberá explicar sus sugerencias.
5. Todo rubro generado por IA deberá quedar en estado `borrador`.
6. Ningún presupuesto generado con asistencia de IA deberá emitirse sin revisión humana.

---

## 25. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

