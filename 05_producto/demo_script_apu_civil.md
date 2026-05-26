# Guion de Demo — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define el guion base para presentar el sistema de presupuestos y análisis de precios unitarios a usuarios expertos, posibles clientes o aliados técnicos.

El objetivo es tener una demostración clara, breve y convincente, enfocada en el valor práctico del producto.

La demo debe mostrar que el sistema:

- Ahorra tiempo.
- Reduce errores.
- Organiza la información.
- Calcula de forma transparente.
- Permite reutilizar rubros.
- Genera presupuestos exportables.
- Tiene base técnica validada por un ingeniero civil.

---

## 2. Audiencia objetivo de la demo

La demo podrá dirigirse a:

1. Franklin como usuario experto.
2. Ingenieros civiles independientes.
3. Fiscalizadores de obra.
4. Pequeñas y medianas constructoras.
5. Oficinas técnicas.
6. Consultores que elaboran presupuestos.
7. Potenciales socios o clientes piloto.

---

## 3. Duración sugerida

Duración ideal:

```text
10 a 15 minutos
```

Duración extendida:

```text
30 minutos
```

La demo debe ser directa. No se debe explicar toda la arquitectura técnica a menos que la audiencia lo pida.

---

## 4. Mensaje central

Mensaje recomendado:

> Esta aplicación permite crear presupuestos y análisis de precios unitarios de forma más ordenada, rápida y confiable que un Excel manual, manteniendo la lógica técnica validada por un ingeniero civil experto.

---

## 5. Posicionamiento del producto

No presentar como:

```text
Una app de IA para ingeniería civil
```

Presentar como:

```text
Un sistema técnico para presupuestos y APUs, con base de datos estructurada, cálculos transparentes y posibilidad futura de asistencia inteligente.
```

La IA puede mencionarse como una fase futura, no como el centro de la demo inicial.

---

## 6. Estructura de la demo corta

## 6.1. Minuto 0 a 2 — Problema

Explicar brevemente el problema actual.

Guion sugerido:

```text
Hoy muchos presupuestos y análisis de precios unitarios se trabajan en Excel. Excel es flexible, pero con el tiempo se vuelve difícil de mantener: fórmulas rotas, datos duplicados, precios desactualizados, rubros difíciles de reutilizar y poca trazabilidad.

La idea de este sistema es mantener la lógica técnica del APU, pero llevarla a una aplicación más ordenada, fácil de usar y preparada para crecer.
```

---

## 6.2. Minuto 2 a 3 — Propuesta de valor

Guion sugerido:

```text
El sistema permite administrar materiales, mano de obra, equipos, rubros y presupuestos desde una base de datos. Cada rubro puede tener su propio análisis de precio unitario, y luego esos rubros se utilizan para construir presupuestos de obra.

La prioridad no es que se vea bonito solamente, sino que calcule bien y que un ingeniero civil pueda confiar en los resultados.
```

---

## 6.3. Minuto 3 a 5 — Catálogos base

Mostrar:

1. Materiales.
2. Mano de obra.
3. Equipos.

Puntos a destacar:

- Los insumos ya no están dispersos en varias hojas de Excel.
- Se pueden buscar y actualizar.
- Se pueden desactivar sin borrar historial.
- Los precios actualizados no rompen presupuestos antiguos.

Guion sugerido:

```text
Aquí tenemos la base de materiales, mano de obra y equipos. Estos catálogos son la base para construir los APUs. Si cambia el precio de un material, se actualiza aquí, y luego se puede decidir si recalcular o no los rubros afectados.
```

---

## 6.4. Minuto 5 a 8 — Crear o revisar un rubro

Mostrar un rubro ejemplo.

Rubros sugeridos para demo:

```text
RALB0007 — Enlucido vertical
RP0009 — Retiro de pintura en superficies verticales y horizontales
REHA0006 — Acero de refuerzo fy=4200kg/cm2
```

Mostrar secciones:

1. Equipos.
2. Mano de obra.
3. Materiales.
4. Transporte, si aplica.
5. Costo directo.
6. Costos indirectos.
7. Precio unitario.

Guion sugerido:

```text
Este es un rubro. A diferencia de una celda final en Excel, aquí podemos ver de dónde sale el precio unitario: qué materiales usa, qué mano de obra requiere, qué equipos intervienen y cómo se aplican los costos indirectos.

El sistema no oculta el cálculo. Al contrario, lo hace más transparente.
```

---

## 6.5. Minuto 8 a 11 — Crear presupuesto

Mostrar:

1. Crear presupuesto.
2. Agregar rubros.
3. Ingresar cantidades.
4. Ver total por ítem.
5. Ver total general.

Guion sugerido:

```text
Una vez que los rubros están creados, se pueden reutilizar en distintos presupuestos. El usuario solo selecciona el rubro, ingresa la cantidad y el sistema calcula el total.

Además, el precio unitario queda guardado como snapshot, es decir, si después cambia el precio del rubro, este presupuesto no se altera automáticamente.
```

---

## 6.6. Minuto 11 a 13 — Exportación

Mostrar:

1. Exportar a Excel.
2. Exportar a PDF.
3. Exportar APU individual, si está disponible.

Guion sugerido:

```text
Finalmente, el presupuesto se puede exportar a Excel o PDF para revisión, presentación o envío al cliente. La idea es que el usuario no tenga que reconstruir formatos manualmente cada vez.
```

---

## 6.7. Minuto 13 a 15 — Cierre

Guion sugerido:

```text
Este MVP busca validar primero lo más importante: que el sistema calcule correctamente y que el flujo sea útil para un ingeniero civil.

Después de validar el motor de cálculo y los rubros con Franklin, el producto puede evolucionar hacia una versión comercial, con mejores reportes, plantillas profesionales y asistencia inteligente para sugerir rubros o detectar inconsistencias.
```

---

## 7. Demo extendida de 30 minutos

## 7.1. Bloque 1 — Contexto y problema

Duración:

```text
5 minutos
```

Contenido:

- Problemas del Excel manual.
- Falta de trazabilidad.
- Riesgo de fórmulas rotas.
- Dificultad para reutilizar rubros.
- Necesidad de validación técnica.

---

## 7.2. Bloque 2 — Catálogos

Duración:

```text
5 minutos
```

Mostrar:

- Materiales.
- Mano de obra.
- Equipos.
- Búsquedas.
- Edición de costos.
- Estados activo/inactivo.

---

## 7.3. Bloque 3 — Rubros y APU

Duración:

```text
8 minutos
```

Mostrar:

- Crear rubro.
- Agregar componentes.
- Ver subtotales.
- Calcular precio unitario.
- Validar rubro.
- Comparar con Excel.

---

## 7.4. Bloque 4 — Presupuesto

Duración:

```text
7 minutos
```

Mostrar:

- Crear proyecto.
- Crear presupuesto.
- Agregar rubros.
- Ingresar cantidades.
- Calcular total.
- Probar snapshot.

---

## 7.5. Bloque 5 — Exportación y roadmap

Duración:

```text
5 minutos
```

Mostrar:

- Exportación Excel.
- Exportación PDF.
- Próximas funcionalidades.
- Asistencia inteligente futura.

---

## 8. Historia de usuario para la demo

## 8.1. Escenario

Un ingeniero civil necesita preparar un presupuesto preliminar para trabajos de mantenimiento y adecuación.

El presupuesto incluye:

- Retiro de pintura.
- Resane de humedad.
- Enlucido vertical.
- Pintura exterior.
- Acero de refuerzo.

## 8.2. Flujo

```text
1. Revisar catálogos de insumos.
2. Revisar rubros existentes.
3. Confirmar precio unitario de un rubro.
4. Crear presupuesto.
5. Agregar rubros.
6. Ingresar cantidades.
7. Calcular total.
8. Exportar.
```

---

## 9. Datos sugeridos para demo

## 9.1. Rubros

| Código | Descripción | Unidad | Precio Unitario Referencial |
|---|---|---|---:|
| RP0009 | Retiro de pintura en superficies verticales y horizontales | m2 | 4.09 |
| RP0033 | Curado y resane de paredes con humedad | m2 | 6.13 |
| RALB0007 | Enlucido vertical | m2 | 6.32 |
| RRA0008 | Pintura látex vinil acrílico elastomérica | m2 | 11.31 |
| REHA0006 | Acero de refuerzo fy=4200kg/cm2 | kg | 2.30 |

---

## 9.2. Presupuesto demo

| Ítem | Código | Descripción | Unidad | Cantidad | Precio Unitario | Total |
|---|---|---|---|---:|---:|---:|
| 1 | RP0009 | Retiro de pintura en superficies verticales y horizontales | m2 | 100 | 4.09 | 409.00 |
| 2 | RP0033 | Curado y resane de paredes con humedad | m2 | 50 | 6.13 | 306.50 |
| 3 | RALB0007 | Enlucido vertical | m2 | 80 | 6.32 | 505.60 |
| 4 | RRA0008 | Pintura látex vinil acrílico elastomérica | m2 | 120 | 11.31 | 1357.20 |
| 5 | REHA0006 | Acero de refuerzo fy=4200kg/cm2 | kg | 500 | 2.30 | 1150.00 |

Total demo:

```text
3728.30
```

---

## 10. Puntos diferenciadores a mencionar

1. Base de datos estructurada.
2. Rubros reutilizables.
3. Cálculo transparente del precio unitario.
4. Validación técnica por ingeniero civil.
5. Presupuestos con snapshots de precio.
6. Exportación a Excel y PDF.
7. Preparado para asistencia inteligente futura.
8. Enfoque local para necesidades de Ecuador.

---

## 11. Frases útiles para demo

## 11.1. Sobre Excel

```text
Excel seguirá siendo útil, pero ya no debería ser el lugar donde todo depende de celdas ocultas y fórmulas frágiles.
```

## 11.2. Sobre confianza técnica

```text
La prioridad del sistema es que el ingeniero pueda entender y confiar en el cálculo.
```

## 11.3. Sobre IA

```text
La inteligencia artificial no reemplaza el criterio técnico. En este producto será una asistencia futura, no el piloto automático.
```

## 11.4. Sobre validación

```text
Cada rubro puede pasar por validación técnica antes de usarse como base confiable.
```

## 11.5. Sobre snapshots

```text
Si un presupuesto fue emitido con un precio, ese precio queda protegido. El sistema no lo cambia silenciosamente.
```

---

## 12. Preguntas frecuentes esperadas

## 12.1. ¿Esto reemplaza completamente Excel?

Respuesta sugerida:

```text
No necesariamente al inicio. La idea es que Excel pueda seguir siendo formato de salida o apoyo, pero que la lógica principal, los datos y los cálculos vivan en una aplicación más controlada.
```

---

## 12.2. ¿Los precios se actualizan automáticamente?

Respuesta sugerida:

```text
Los precios pueden actualizarse en los catálogos, pero el sistema no cambia presupuestos ya emitidos automáticamente. Eso evita alterar propuestas históricas.
```

---

## 12.3. ¿La aplicación calcula igual que el Excel?

Respuesta sugerida:

```text
La primera validación se hace comparando contra el Excel base. Si hay diferencias, se revisa si son errores de fórmula, redondeo o interpretación técnica. No copiamos ciegamente el Excel; lo usamos como punto de partida.
```

---

## 12.4. ¿La IA crea presupuestos sola?

Respuesta sugerida:

```text
No en la primera versión. Primero validamos el motor técnico. Más adelante la IA podrá sugerir rubros o detectar inconsistencias, pero siempre con revisión humana.
```

---

## 12.5. ¿Se puede usar para contratación pública?

Respuesta sugerida:

```text
El sistema puede prepararse para generar formatos útiles para propuestas técnicas o económicas. Sin embargo, los requisitos específicos de contratación pública deben validarse según el formato y normativa aplicable.
```

---

## 13. Señales de éxito durante la demo

La demo será exitosa si la audiencia:

1. Entiende rápidamente el problema que resuelve.
2. Ve utilidad práctica frente al Excel.
3. Confía en que el cálculo es revisable.
4. Pregunta por casos reales de uso.
5. Pregunta si puede probarlo.
6. Sugiere rubros o procesos propios.
7. Percibe que ahorra tiempo.
8. Percibe que reduce errores.

---

## 14. Errores que deben evitarse en la demo

1. Hablar demasiado de tecnología y poco del problema.
2. Presentar la IA como elemento principal antes de validar el motor.
3. Mostrar pantallas incompletas sin explicar que es MVP.
4. No tener datos precargados.
5. Improvisar rubros en vivo sin pruebas.
6. No saber explicar una diferencia de cálculo.
7. Mostrar exportaciones mal formateadas.
8. Dejar que la demo dependa de internet si se puede correr localmente.

---

## 15. Checklist antes de una demo

| Elemento | Listo | Observaciones |
|---|---|---|
| App corre correctamente |  |  |
| Base de datos tiene datos demo |  |  |
| Hay al menos 5 rubros cargados |  |  |
| Hay presupuesto demo creado |  |  |
| Cálculos revisados |  |  |
| Exportación Excel probada |  |  |
| Exportación PDF probada |  |  |
| Guion repasado |  |  |
| Preguntas frecuentes preparadas |  |  |
| Plan B listo si algo falla |  |  |

---

## 16. Plan B si falla la app durante demo

Si la aplicación falla, usar:

1. Capturas de pantalla.
2. Excel comparativo.
3. PDF exportado previamente.
4. Video corto de uso.
5. Explicación del flujo con datos reales.

Regla:

```text
Nunca depender de una sola forma de mostrar el producto.
```

---

## 17. Demo orientada a Franklin

Con Franklin, la demo debe enfocarse en:

1. Fórmulas.
2. Rendimientos.
3. Componentes por rubro.
4. Diferencias contra Excel.
5. Facilidad de edición.
6. Formato final del APU.
7. Utilidad real para su trabajo.

Pregunta clave para Franklin:

```text
¿Esto te ahorra tiempo y mantiene el criterio técnico que necesitas?
```

---

## 18. Demo orientada a cliente externo

Con cliente externo, la demo debe enfocarse en:

1. Ahorro de tiempo.
2. Orden.
3. Facilidad de uso.
4. Reducción de errores.
5. Exportación.
6. Reutilización de rubros.
7. Confianza técnica.

Pregunta clave para cliente externo:

```text
¿En qué parte de tu proceso actual esto te ahorraría más tiempo?
```

---

## 19. Cierre comercial preliminar

Guion sugerido:

```text
Estamos validando esta primera versión con casos reales. La idea es probarla con usuarios técnicos, ajustar el flujo y luego ofrecer una versión piloto acompañada para ingenieros o pequeñas constructoras que trabajen con presupuestos y APUs de forma recurrente.
```

---

## 20. Próximos pasos después de la demo

Después de cada demo, registrar:

1. Qué entendió el usuario.
2. Qué le interesó más.
3. Qué le generó dudas.
4. Qué funcionalidades pidió.
5. Si lo usaría en un caso real.
6. Si pagaría por el producto o por implementación acompañada.
7. Qué objeciones tuvo.
8. Qué cambios son prioritarios.

---

## 21. Registro de feedback de demo

| Fecha | Persona | Perfil | Interés | Observaciones | Próxima acción |
|---|---|---|---|---|---|
|  |  |  | Alto/Medio/Bajo |  |  |

---

## 22. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

