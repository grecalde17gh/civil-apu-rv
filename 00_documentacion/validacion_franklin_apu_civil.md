# Validación Técnica Franklin — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define el proceso de validación técnica que realizará Franklin Recalde como usuario experto del sistema.

El objetivo es asegurar que la aplicación calcule correctamente los Análisis de Precios Unitarios, presupuestos de obra y reportes generados, tomando como referencia el criterio técnico del experto y el archivo Excel base.

La validación técnica será obligatoria antes de considerar que el sistema está listo para uso real o demostración comercial.

---

## 2. Rol de Franklin en el proyecto

Franklin actuará como usuario experto y validador técnico del producto.

Su función no será programar, sino confirmar que el sistema representa correctamente la lógica de trabajo real de un ingeniero civil.

## 2.1. Responsabilidades principales

Franklin deberá validar:

1. Estructura de los rubros.
2. Fórmulas de cálculo.
3. Rendimientos.
4. Unidades de medida.
5. Composición de materiales.
6. Composición de mano de obra.
7. Composición de equipos y herramientas.
8. Tratamiento de transporte.
9. Costos indirectos.
10. Redondeos.
11. Uso o no uso de VAE y CPC en cálculos.
12. Formatos de exportación.
13. Coherencia del presupuesto final.

---

## 3. Principio de validación

La regla principal será:

> Ninguna fórmula técnica será considerada definitiva hasta ser validada por Franklin.

Sin embargo, para avanzar con el desarrollo, algunas reglas podrán implementarse como supuestos configurables.

Estas reglas quedarán marcadas como:

```text
Pendiente de validación técnica
```

---

## 4. Tipos de validación

La validación se dividirá en cinco niveles:

1. Validación de datos base.
2. Validación de fórmulas.
3. Validación de rubros.
4. Validación de presupuestos.
5. Validación de exportaciones.

---

## 5. Validación de datos base

## 5.1. Materiales

Franklin deberá revisar que los materiales cargados desde el Excel o registrados manualmente tengan información coherente.

Checklist:

| Criterio | Sí/No | Observaciones |
|---|---|---|
| La descripción del material es clara. |  |  |
| La unidad de medida es correcta. |  |  |
| El costo unitario es razonable. |  |  |
| El CPC, si existe, está correctamente asignado. |  |  |
| El VAE, si existe, está correctamente asignado. |  |  |
| El material no está duplicado innecesariamente. |  |  |
| El material puede ser usado en APUs reales. |  |  |

---

## 5.2. Mano de obra

Checklist:

| Criterio | Sí/No | Observaciones |
|---|---|---|
| El cargo o tipo de trabajo es correcto. |  |  |
| El costo por hora es correcto o razonable. |  |  |
| La unidad de cálculo es correcta. |  |  |
| El registro representa una persona, cargo o cuadrilla. |  |  |
| El CPC, si existe, está correctamente asignado. |  |  |
| El VAE, si existe, está correctamente asignado. |  |  |

---

## 5.3. Equipos y herramientas

Checklist:

| Criterio | Sí/No | Observaciones |
|---|---|---|
| La descripción del equipo es clara. |  |  |
| La tarifa corresponde a hora, día o uso fijo. |  |  |
| El costo es razonable. |  |  |
| El equipo está bien clasificado. |  |  |
| El mantenimiento requerido está bien identificado, si aplica. |  |  |
| El CPC, si existe, está correctamente asignado. |  |  |
| El VAE, si existe, está correctamente asignado. |  |  |

---

## 6. Validación de fórmulas

Franklin deberá confirmar o corregir las fórmulas utilizadas por el sistema.

## 6.1. Materiales

Fórmula asumida:

```text
costo_material = cantidad × costo_unitario
```

Validación:

| Pregunta | Respuesta Franklin | Observaciones |
|---|---|---|
| ¿La fórmula es correcta? |  |  |
| ¿Existen casos especiales? |  |  |
| ¿Debe considerarse desperdicio? |  |  |
| ¿El desperdicio debe ser por material o por rubro? |  |  |

---

## 6.2. Mano de obra

Fórmula asumida inicial:

```text
costo_mano_obra = cantidad_trabajadores × costo_hora × tiempo_requerido
```

Si el rendimiento se expresa como unidades por hora:

```text
tiempo_requerido = 1 / rendimiento
```

Validación:

| Pregunta | Respuesta Franklin | Observaciones |
|---|---|---|
| ¿El rendimiento se interpreta como unidades por hora? |  |  |
| ¿El rendimiento se interpreta como horas por unidad? |  |  |
| ¿El rendimiento se interpreta como unidades por jornada? |  |  |
| ¿La mano de obra se calcula por persona o cuadrilla? |  |  |
| ¿Se debe considerar jornada de 8 horas? |  |  |
| ¿Existen rubros con forma especial de cálculo? |  |  |

---

## 6.3. Equipos

Fórmula asumida inicial:

```text
costo_equipo = cantidad_equipos × tarifa × tiempo_requerido
```

Validación:

| Pregunta | Respuesta Franklin | Observaciones |
|---|---|---|
| ¿La tarifa del equipo se maneja por hora? |  |  |
| ¿La tarifa del equipo se maneja por día? |  |  |
| ¿Hay equipos con costo fijo por rubro? |  |  |
| ¿El tiempo del equipo depende del rendimiento? |  |  |
| ¿Se usa la misma jornada de trabajo que mano de obra? |  |  |

---

## 6.4. Transporte

Fórmula asumida:

```text
costo_transporte = cantidad × costo_unitario
```

Validación:

| Pregunta | Respuesta Franklin | Observaciones |
|---|---|---|
| ¿El transporte debe ir como sección separada? |  |  |
| ¿El transporte puede estar incluido en materiales? |  |  |
| ¿Depende de distancia, volumen, peso o viaje? |  |  |
| ¿Aplica solo a ciertos rubros? |  |  |

---

## 6.5. Costos indirectos

Fórmula asumida:

```text
costo_indirecto = costo_directo × porcentaje_indirectos
```

Validación:

| Pregunta | Respuesta Franklin | Observaciones |
|---|---|---|
| ¿La fórmula es correcta? |  |  |
| ¿Qué porcentaje se usa normalmente? |  |  |
| ¿El porcentaje depende del proyecto? |  |  |
| ¿El porcentaje depende del rubro? |  |  |
| ¿Debe separarse administración, utilidad e imprevistos? |  |  |

---

## 6.6. Precio unitario

Fórmula asumida:

```text
precio_unitario = costo_directo + costo_indirecto
```

Validación:

| Pregunta | Respuesta Franklin | Observaciones |
|---|---|---|
| ¿La fórmula final es correcta? |  |  |
| ¿Debe incluir IVA en el precio unitario? |  |  |
| ¿Debe incluir otros cargos? |  |  |
| ¿Cómo debe redondearse? |  |  |

---

## 7. Validación de rubros de prueba

Se utilizarán rubros reales del Excel base para comparar resultados entre:

1. Excel original.
2. Aplicación desarrollada.
3. Criterio técnico de Franklin.

## 7.1. Rubros iniciales sugeridos

| N.º | Código | Descripción | Unidad | Precio Excel | Precio App | Diferencia | Validado |
|---:|---|---|---|---:|---:|---:|---|
| 1 | RP0009 | Retiro de pintura en superficies verticales y horizontales | m2 |  |  |  |  |
| 2 | RP0033 | Curado y resane de paredes con humedad | m2 |  |  |  |  |
| 3 | RALB0007 | Enlucido vertical | m2 |  |  |  |  |
| 4 | RRA0008 | Pintura látex vinil acrílico elastomérica | m2 |  |  |  |  |
| 5 | RCM0004 | Pintura anticorrosiva en rejas | m2 |  |  |  |  |
| 6 | REHA0005 | Hormigón simple f'c=210kg/cm2 en columnas | m3 |  |  |  |  |
| 7 | REHA0006 | Acero de refuerzo fy=4200kg/cm2 | kg |  |  |  |  |
| 8 | Pendiente | Rubro adicional seleccionado por Franklin |  |  |  |  |  |
| 9 | Pendiente | Rubro adicional seleccionado por Franklin |  |  |  |  |  |
| 10 | Pendiente | Rubro adicional seleccionado por Franklin |  |  |  |  |  |

---

## 8. Criterio de aceptación por rubro

Un rubro se considerará validado cuando cumpla:

1. La descripción es técnicamente correcta.
2. La unidad es correcta.
3. Los materiales son adecuados.
4. La mano de obra es adecuada.
5. Los equipos son adecuados.
6. El rendimiento es correcto o razonable.
7. El costo directo es correcto.
8. El costo indirecto es correcto.
9. El precio unitario coincide con el Excel o la diferencia está justificada.
10. Franklin aprueba el rubro.

---

## 9. Tolerancias de diferencia

Para comparar Excel vs aplicación, se permitirá una diferencia menor asociada a redondeos.

Regla asumida inicial:

```text
tolerancia = ±0.01 USD
```

Si la diferencia supera la tolerancia, deberá registrarse la causa.

Causas posibles:

1. Diferencia de redondeo.
2. Fórmula distinta.
3. Error en Excel.
4. Error en aplicación.
5. Precio actualizado.
6. Rendimiento interpretado de forma distinta.
7. Componente faltante.
8. Componente duplicado.

---

## 10. Validación de presupuesto

Se deberá crear al menos un presupuesto de prueba con varios rubros.

## 10.1. Presupuesto de prueba mínimo

El presupuesto de prueba deberá incluir:

- Al menos 5 rubros.
- Cantidades distintas de cero.
- Al menos un rubro con materiales.
- Al menos un rubro con mano de obra.
- Al menos un rubro con equipos.
- Al menos un rubro con transporte, si aplica.

## 10.2. Checklist de presupuesto

| Criterio | Sí/No | Observaciones |
|---|---|---|
| Los rubros se agregan correctamente. |  |  |
| Las cantidades se ingresan correctamente. |  |  |
| El precio unitario se mantiene como snapshot. |  |  |
| El total por ítem es correcto. |  |  |
| El total general es correcto. |  |  |
| El presupuesto no cambia si se actualiza un rubro después. |  |  |
| El presupuesto puede exportarse correctamente. |  |  |

---

## 11. Validación de exportaciones

## 11.1. Exportación a Excel

Checklist:

| Criterio | Sí/No | Observaciones |
|---|---|---|
| El archivo se genera correctamente. |  |  |
| Las columnas son claras. |  |  |
| Los valores numéricos son correctos. |  |  |
| Los totales coinciden con la aplicación. |  |  |
| El formato es presentable. |  |  |
| Puede abrirse en Microsoft Excel sin errores. |  |  |

---

## 11.2. Exportación a PDF

Checklist:

| Criterio | Sí/No | Observaciones |
|---|---|---|
| El PDF se genera correctamente. |  |  |
| El diseño es profesional. |  |  |
| Los datos del proyecto aparecen correctamente. |  |  |
| Los rubros aparecen ordenados. |  |  |
| Los totales son correctos. |  |  |
| El documento puede presentarse a un cliente o entidad. |  |  |

---

## 11.3. Exportación de APU individual

Checklist:

| Criterio | Sí/No | Observaciones |
|---|---|---|
| Se muestra equipo, mano de obra, materiales y transporte. |  |  |
| Se muestran subtotales correctamente. |  |  |
| Se muestra costo directo. |  |  |
| Se muestra costo indirecto. |  |  |
| Se muestra precio unitario final. |  |  |
| El formato es similar o mejor que el Excel base. |  |  |

---

## 12. Validación de interfaz

Franklin deberá probar si la aplicación es cómoda para un ingeniero civil.

Checklist:

| Criterio | Sí/No | Observaciones |
|---|---|---|
| La navegación es clara. |  |  |
| Es fácil buscar materiales. |  |  |
| Es fácil buscar rubros. |  |  |
| Es fácil crear un APU. |  |  |
| Es fácil crear un presupuesto. |  |  |
| Los cálculos son visibles y entendibles. |  |  |
| La aplicación reduce tiempo frente al Excel. |  |  |
| La aplicación genera confianza técnica. |  |  |

---

## 13. Preguntas clave para sesión con Franklin

Estas preguntas deberán revisarse en una reunión técnica inicial:

1. ¿Cuál es el flujo real que sigues hoy para crear un presupuesto?
2. ¿Primero creas rubros o partes de una lista existente?
3. ¿Cuáles son los errores más comunes en Excel?
4. ¿Qué campos nunca deberían faltar en un APU?
5. ¿Qué rubros usas con más frecuencia?
6. ¿Cómo actualizas precios de materiales?
7. ¿Cómo defines rendimientos?
8. ¿Qué parte del proceso te toma más tiempo?
9. ¿Qué debería hacer la aplicación para que realmente la uses?
10. ¿Qué formato de exportación necesitas para presentar un presupuesto?
11. ¿Qué reportes serían indispensables?
12. ¿Qué funcionalidades de los programas actuales no te gustan?
13. ¿Qué funcionalidad haría que este producto sea vendible?

---

## 14. Matriz de decisiones técnicas

Cada decisión validada con Franklin deberá registrarse en esta tabla.

| Fecha | Tema | Decisión | Validado por | Impacto en sistema |
|---|---|---|---|---|
|  | Rendimiento |  | Franklin | Fórmula de mano de obra/equipos |
|  | Costos indirectos |  | Franklin | Cálculo del precio unitario |
|  | IVA |  | Franklin | Presupuesto final/exportación |
|  | VAE |  | Franklin | Reportes/cálculo |
|  | CPC |  | Franklin | Datos base/reportes |
|  | Transporte |  | Franklin | Estructura APU |
|  | Redondeo |  | Franklin | Resultados finales |
|  | Formato Excel |  | Franklin | Exportación |
|  | Formato PDF |  | Franklin | Exportación |

---

## 15. Clasificación de observaciones

Las observaciones de Franklin se clasificarán así:

## 15.1. Crítica

Impide usar correctamente el sistema.

Ejemplo:

- El precio unitario se calcula mal.
- El rendimiento está interpretado de forma incorrecta.
- El presupuesto total no coincide.

## 15.2. Alta

Debe corregirse antes de una versión comercial.

Ejemplo:

- El PDF no tiene formato adecuado.
- Faltan campos técnicos relevantes.
- La carga de rubros es poco práctica.

## 15.3. Media

Mejora importante, pero no bloquea el MVP.

Ejemplo:

- Mejorar filtros.
- Agregar ordenamiento.
- Mejorar diseño visual.

## 15.4. Baja

Mejora estética o funcional menor.

Ejemplo:

- Cambiar colores.
- Ajustar textos.
- Reordenar columnas.

---

## 16. Registro de observaciones

| N.º | Fecha | Módulo | Observación | Prioridad | Estado | Responsable |
|---:|---|---|---|---|---|---|
| 1 |  |  |  |  | Pendiente |  |
| 2 |  |  |  |  | Pendiente |  |
| 3 |  |  |  |  | Pendiente |  |

Estados sugeridos:

```text
pendiente
en_revision
corregido
validado
descartado
```

---

## 17. Criterios de aprobación del MVP

Franklin podrá aprobar el MVP cuando se cumpla lo siguiente:

1. Al menos 10 rubros reales han sido cargados y validados.
2. Los precios unitarios coinciden con el Excel o las diferencias están justificadas.
3. El sistema permite crear un presupuesto funcional.
4. El presupuesto calcula correctamente los totales.
5. El sistema exporta Excel correctamente.
6. El sistema exporta PDF básico correctamente.
7. La aplicación es entendible para un ingeniero civil.
8. No existen errores críticos abiertos.
9. Las reglas pendientes están documentadas.
10. Franklin considera que el sistema puede probarse en un caso real controlado.

---

## 18. Formato de aprobación

Cuando Franklin apruebe una versión, se registrará así:

```text
Versión validada: MVP 0.1
Fecha de validación:
Validador técnico: Franklin Recalde
Resultado: Aprobado / Aprobado con observaciones / No aprobado
Observaciones generales:
Firma o confirmación:
```

---

## 19. Reglas para cambios posteriores a la validación

Después de que un rubro o presupuesto sea validado:

1. Cualquier cambio deberá registrarse.
2. Si cambia una fórmula, deberán recalcularse los casos de prueba.
3. Si cambia una regla general, deberá actualizarse la documentación.
4. Si cambia el modelo de datos, deberá revisarse el impacto en presupuestos existentes.
5. Si cambia un precio base, no deberá alterar presupuestos emitidos automáticamente.

---

## 20. Uso futuro de IA en validación

En fases posteriores, la IA podrá apoyar a Franklin mediante:

1. Detección de diferencias entre Excel y aplicación.
2. Identificación de rubros con precios atípicos.
3. Revisión de componentes faltantes.
4. Generación de preguntas técnicas para validar rubros.
5. Comparación entre versiones de presupuesto.

Sin embargo:

> La validación técnica final siempre será humana.

---

## 21. Primera reunión sugerida con Franklin

Agenda sugerida:

1. Explicar objetivo del producto.
2. Mostrar estructura inicial de módulos.
3. Revisar el Excel base.
4. Confirmar flujo actual de trabajo.
5. Elegir 10 rubros de prueba.
6. Confirmar interpretación inicial del rendimiento.
7. Confirmar tratamiento de costos indirectos.
8. Confirmar si IVA, CPC y VAE son informativos o calculados.
9. Definir formato esperado de exportación.
10. Registrar observaciones y decisiones.

Duración sugerida:

```text
60 a 90 minutos
```

---

## 22. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

