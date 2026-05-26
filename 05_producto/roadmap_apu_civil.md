# Roadmap del Producto — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define el roadmap de desarrollo del sistema de presupuestos y análisis de precios unitarios para ingeniería civil.

El objetivo es ordenar el avance del proyecto por fases, evitando dispersión y priorizando primero un producto técnicamente confiable.

---

## 2. Visión del producto

Crear una aplicación web profesional, amigable y escalable para elaborar presupuestos de obra y análisis de precios unitarios, basada en datos estructurados, cálculos transparentes y validación técnica de un ingeniero civil experto.

El producto deberá iniciar como una herramienta interna validada por Franklin y evolucionar hacia una solución comercial para ingenieros civiles, consultores, fiscalizadores y pequeñas o medianas constructoras en Ecuador.

---

## 3. Principio estratégico

La prioridad será:

> Primero construir un sistema que calcule bien, luego hacerlo bonito, después hacerlo vendible y finalmente agregar IA.

La inteligencia artificial será usada inicialmente como asistente de desarrollo, documentación y generación de código.

La IA dentro del producto se considerará en fases posteriores, cuando el motor técnico esté validado.

---

## 4. Fases del proyecto

El proyecto se organizará en las siguientes fases:

1. Fase 0 — Preparación y documentación.
2. Fase 1 — MVP técnico.
3. Fase 2 — Validación con Franklin.
4. Fase 3 — Producto demo comercial.
5. Fase 4 — Producto vendible.
6. Fase 5 — Asistencia inteligente con IA.
7. Fase 6 — Escalamiento SaaS.

---

## 5. Fase 0 — Preparación y documentación

## 5.1. Objetivo

Ordenar las ideas, documentar requerimientos, entender el Excel base y preparar la estructura técnica del proyecto.

## 5.2. Entregables

```text
00_documentacion/requerimientos_iniciales.md
00_documentacion/reglas_calculo_apu.md
00_documentacion/modelo_datos.md
00_documentacion/validacion_franklin.md
00_documentacion/arquitectura_tecnica.md
03_base_datos/modelo_prisma.md
03_base_datos/estrategia_importacion_excel.md
04_pruebas/casos_validacion.md
04_pruebas/pruebas_calculo.md
05_producto/roadmap.md
```

## 5.3. Estado esperado

Esta fase termina cuando existe suficiente documentación para que Codex pueda iniciar el proyecto base sin improvisar arquitectura ni reglas técnicas.

## 5.4. Riesgo principal

Documentar demasiado sin construir.

## 5.5. Mitigación

Cerrar la documentación inicial cuando cubra el MVP y pasar a implementación.

---

## 6. Fase 1 — MVP técnico

## 6.1. Objetivo

Construir una primera versión funcional de la aplicación que permita registrar insumos, crear rubros, calcular APUs y armar presupuestos básicos.

## 6.2. Alcance funcional

Incluye:

1. Configuración inicial del proyecto Next.js.
2. Configuración de TypeScript.
3. Configuración de Tailwind CSS.
4. Configuración de Prisma.
5. Configuración de PostgreSQL.
6. Modelos de base de datos iniciales.
7. CRUD de materiales.
8. CRUD de mano de obra.
9. CRUD de equipos.
10. CRUD de rubros.
11. Asociación de componentes a rubros.
12. Motor de cálculo APU.
13. Creación básica de proyectos.
14. Creación básica de presupuestos.
15. Cálculo de total por ítem.
16. Cálculo de total de presupuesto.

## 6.3. Fuera del alcance

No incluye todavía:

- IA integrada en el producto.
- Importador visual de Excel.
- Multiempresa avanzado.
- Control avanzado de roles.
- Plantillas PDF profesionales.
- Marketplace de rubros.
- Integraciones externas.

## 6.4. Entregables técnicos

```text
02_app/civil-apu-app/
prisma/schema.prisma
src/lib/calculations/
src/app/materiales/
src/app/mano-obra/
src/app/equipos/
src/app/rubros/
src/app/proyectos/
src/app/presupuestos/
```

## 6.5. Criterios de éxito

1. La app corre localmente.
2. La base de datos se crea con Prisma.
3. Se pueden crear materiales, mano de obra y equipos.
4. Se puede crear un rubro.
5. Se pueden agregar componentes al rubro.
6. Se calcula el precio unitario.
7. Se puede crear un presupuesto.
8. Se calcula el total del presupuesto.

---

## 7. Fase 2 — Validación con Franklin

## 7.1. Objetivo

Validar técnicamente que los cálculos y estructura del sistema representen correctamente la lógica real de presupuestos y APUs.

## 7.2. Actividades

1. Seleccionar 10 rubros reales.
2. Cargar sus componentes.
3. Comparar precio Excel vs precio App.
4. Validar fórmulas.
5. Validar interpretación de rendimiento.
6. Validar costos indirectos.
7. Validar unidades.
8. Validar formato de presupuesto.
9. Registrar observaciones.
10. Corregir diferencias.

## 7.3. Entregables

```text
04_pruebas/comparacion_excel_vs_app.md
04_pruebas/reporte_validacion_franklin.md
04_pruebas/casos_validacion_actualizados.md
```

## 7.4. Criterios de éxito

1. Al menos 10 rubros reales validados.
2. Diferencias explicadas y corregidas.
3. Reglas críticas confirmadas.
4. No existen errores críticos abiertos.
5. Franklin aprueba el MVP para prueba real controlada.

---

## 8. Fase 3 — Producto demo comercial

## 8.1. Objetivo

Convertir el MVP técnico en una demostración atractiva para mostrar a otros ingenieros civiles o potenciales clientes.

## 8.2. Actividades

1. Mejorar diseño visual.
2. Crear dashboard inicial.
3. Mejorar tablas y filtros.
4. Mejorar navegación.
5. Crear exportación básica a Excel.
6. Crear exportación básica a PDF.
7. Crear datos demo.
8. Crear guion de demostración.
9. Preparar presentación comercial.

## 8.3. Entregables

```text
05_producto/demo_script.md
05_producto/propuesta_comercial.md
05_producto/pitch_producto.md
```

## 8.4. Criterios de éxito

1. El sistema se puede mostrar en una demo de 10 a 15 minutos.
2. El usuario entiende el valor rápidamente.
3. La interfaz es clara.
4. Los cálculos son visibles y confiables.
5. La exportación funciona.
6. Franklin considera que puede mostrarse a terceros.

---

## 9. Fase 4 — Producto vendible

## 9.1. Objetivo

Preparar el sistema para ser usado por usuarios externos de forma controlada.

## 9.2. Funcionalidades sugeridas

1. Login estable.
2. Manejo básico de usuarios.
3. Roles.
4. Mejor gestión de proyectos.
5. Mejores exportaciones.
6. Plantillas profesionales.
7. Duplicación de rubros.
8. Duplicación de presupuestos.
9. Búsqueda avanzada.
10. Importación controlada de catálogos.
11. Historial básico de cambios.
12. Respaldo de base de datos.

## 9.3. Entregables

```text
versión beta privada
manual_usuario_basico.md
plantillas_exportacion/
landing_page_producto
```

## 9.4. Criterios de éxito

1. Puede usarse en un caso real controlado.
2. Un usuario externo puede crear un presupuesto sin ayuda directa.
3. Las exportaciones son presentables.
4. Los datos se guardan correctamente.
5. El sistema no pierde información.
6. Se puede cobrar por una prueba piloto o servicio acompañado.

---

## 10. Fase 5 — Asistencia inteligente con IA

## 10.1. Objetivo

Agregar funcionalidades de IA que realmente aporten valor al proceso técnico, sin reemplazar la validación humana.

## 10.2. Principio de IA

La IA actuará como asistente, no como autoridad técnica.

Toda sugerencia generada por IA deberá poder ser revisada, editada y aprobada por un usuario experto.

## 10.3. Funcionalidades candidatas

### 10.3.1. Asistente de creación de rubros

El usuario describe un rubro y la IA sugiere:

- Materiales probables.
- Mano de obra probable.
- Equipos probables.
- Unidad sugerida.
- Observaciones técnicas.

El rubro generado queda en estado:

```text
borrador
```

---

### 10.3.2. Revisor de inconsistencias

La IA revisa un APU y detecta posibles problemas:

- Material faltante.
- Unidad incoherente.
- Rendimiento sospechoso.
- Precio atípico.
- Rubro incompleto.

---

### 10.3.3. Comparador de presupuestos

Permite comparar dos presupuestos y detectar:

- Rubros faltantes.
- Diferencias de cantidades.
- Diferencias de precios unitarios.
- Variaciones importantes.

---

### 10.3.4. Buscador inteligente de rubros

El usuario busca en lenguaje natural:

```text
Necesito rubros para pintura exterior y resane de humedad
```

El sistema sugiere rubros relacionados.

---

### 10.3.5. Generador de observaciones técnicas

El sistema ayuda a generar notas para justificar presupuestos, diferencias o condiciones de ejecución.

---

## 10.4. Riesgos de IA

| Riesgo | Impacto | Mitigación |
|---|---|---|
| IA sugiere rubros incorrectos | Alto | Todo queda en borrador y requiere validación. |
| Usuario confía ciegamente | Alto | Mostrar advertencias y explicación. |
| Datos técnicos insuficientes | Medio | Usar base estructurada y validada. |
| Alucinaciones | Alto | Limitar respuestas a catálogos internos cuando aplique. |

---

## 11. Fase 6 — Escalamiento SaaS

## 11.1. Objetivo

Convertir el producto en una solución SaaS escalable para varios usuarios o empresas.

## 11.2. Funcionalidades futuras

1. Multiempresa.
2. Planes de suscripción.
3. Gestión avanzada de permisos.
4. Catálogo compartido de rubros.
5. Catálogos propios por empresa.
6. Auditoría completa.
7. Backups automáticos.
8. Panel administrativo.
9. Métricas de uso.
10. Integración con pasarela de pagos.
11. Soporte técnico.
12. Base de conocimiento.

## 11.3. Arquitectura futura

Posibles tecnologías:

- Vercel para frontend/backend Next.js.
- Supabase, Neon o Railway para PostgreSQL.
- Almacenamiento de archivos en S3 compatible.
- Servicio de IA vía API.
- Sistema de logs y monitoreo.

---

## 12. Priorización general

## 12.1. Prioridad alta

1. Modelo de datos.
2. Motor de cálculo.
3. CRUD de catálogos.
4. CRUD de rubros.
5. Presupuestos.
6. Validación Franklin.
7. Exportación Excel.

## 12.2. Prioridad media

1. Exportación PDF profesional.
2. Importación desde Excel.
3. Dashboard.
4. Historial de cambios.
5. Duplicación de rubros y presupuestos.
6. Mejoras visuales.

## 12.3. Prioridad baja inicial

1. IA integrada.
2. Multiempresa avanzado.
3. Suscripciones.
4. Integraciones externas.
5. App móvil.
6. Cronograma valorado avanzado.

---

## 13. Sprints sugeridos

## 13.1. Sprint 0 — Preparación

Duración sugerida:

```text
1 semana
```

Objetivo:

Preparar documentación, estructura del repositorio y entorno de desarrollo.

Entregables:

- Documentación base.
- Repositorio GitHub.
- Proyecto Next.js creado.
- Prisma inicializado.
- PostgreSQL configurado.

---

## 13.2. Sprint 1 — Base de datos y catálogos

Duración sugerida:

```text
1 a 2 semanas
```

Objetivo:

Crear modelos y CRUD de insumos.

Entregables:

- Modelo Prisma.
- Migración inicial.
- CRUD materiales.
- CRUD mano de obra.
- CRUD equipos.

---

## 13.3. Sprint 2 — Rubros y motor APU

Duración sugerida:

```text
2 semanas
```

Objetivo:

Crear rubros y calcular precio unitario.

Entregables:

- CRUD rubros.
- Componentes de rubro.
- Motor de cálculo.
- Pruebas unitarias.
- Primeros rubros cargados.

---

## 13.4. Sprint 3 — Presupuestos

Duración sugerida:

```text
1 a 2 semanas
```

Objetivo:

Crear presupuestos de obra con rubros existentes.

Entregables:

- CRUD proyectos.
- CRUD presupuestos.
- Ítems de presupuesto.
- Totales automáticos.
- Snapshot de precios.

---

## 13.5. Sprint 4 — Exportaciones

Duración sugerida:

```text
1 a 2 semanas
```

Objetivo:

Generar salidas profesionales.

Entregables:

- Exportación Excel.
- Exportación PDF básica.
- Exportación APU individual.

---

## 13.6. Sprint 5 — Validación y corrección

Duración sugerida:

```text
1 a 2 semanas
```

Objetivo:

Validar con Franklin y corregir diferencias.

Entregables:

- Reporte de comparación.
- Rubros validados.
- Correcciones al motor de cálculo.
- MVP aprobado o aprobado con observaciones.

---

## 14. Indicadores de avance

## 14.1. Indicadores técnicos

| Indicador | Meta MVP |
|---|---:|
| Tablas principales creadas | 100% |
| CRUD de catálogos | 100% |
| Funciones de cálculo probadas | 100% |
| Rubros reales cargados | mínimo 10 |
| Presupuesto de prueba creado | mínimo 1 |
| Exportación Excel | funcional |
| Exportación PDF | básica funcional |

---

## 14.2. Indicadores de validación

| Indicador | Meta MVP |
|---|---:|
| Rubros validados por Franklin | mínimo 10 |
| Diferencias críticas abiertas | 0 |
| Fórmulas críticas confirmadas | 100% |
| Casos de prueba ejecutados | 100% |
| Aprobación de Franklin | sí / con observaciones |

---

## 14.3. Indicadores de producto

| Indicador | Meta demo |
|---|---:|
| Tiempo para crear un presupuesto simple | menor al Excel manual |
| Facilidad de uso percibida | alta |
| Exportación presentable | sí |
| Valor percibido por usuario experto | alto |
| Potencial comercial | validado cualitativamente |

---

## 15. Decisiones pendientes importantes

| Tema | Decisión pendiente | Responsable |
|---|---|---|
| Rendimiento | Interpretación definitiva | Franklin |
| Costos indirectos | Porcentaje y estructura | Franklin |
| IVA | Incluir o separar | Franklin/Gustavo |
| VAE | Informativo o calculado | Franklin |
| CPC | Obligatorio o informativo | Franklin |
| Transporte | Sección independiente o incluida | Franklin |
| Exportación PDF | Formato oficial | Franklin/Gustavo |
| Modelo comercial | Venta, licencia o SaaS | Gustavo |
| Nombre comercial | Definir marca final | Gustavo |

---

## 16. Estrategia comercial preliminar

## 16.1. Posicionamiento recomendado

No vender como:

```text
Software con IA para ingeniería civil
```

Vender como:

```text
Sistema técnico para presupuestos y APUs, validado por ingenieros civiles, con asistencia inteligente futura.
```

## 16.2. Primer nicho sugerido

- Ingenieros civiles independientes.
- Fiscalizadores.
- Pequeñas constructoras.
- Oficinas técnicas.
- Profesionales que preparan presupuestos para obras públicas o privadas.

## 16.3. Oferta inicial sugerida

Antes de vender SaaS completo, ofrecer:

```text
Implementación acompañada + licencia piloto
```

Esto permite:

- Validar necesidades reales.
- Ajustar el producto.
- Cobrar por configuración.
- Evitar soporte masivo prematuro.

---

## 17. Riesgos del roadmap

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Querer hacer todo desde el inicio | Alto | Respetar fases. |
| Meter IA demasiado pronto | Alto | IA solo después del motor validado. |
| No validar con Franklin | Alto | Validación obligatoria por fase. |
| Copiar errores del Excel | Alto | Comparar y documentar diferencias. |
| Interfaz atractiva pero cálculo débil | Alto | Priorizar motor de cálculo. |
| Subestimar exportaciones | Medio | Diseñarlas desde el MVP. |
| Sobrecargar modelo de datos | Medio | MVP mínimo, expansión posterior. |
| No probar con usuarios reales | Alto | Demo con Franklin y luego piloto externo. |

---

## 18. Regla de avance entre fases

No se debe pasar a la siguiente fase si existen errores críticos en la fase actual.

Especialmente:

- No pasar a demo comercial si los cálculos no están validados.
- No integrar IA si el motor APU no es confiable.
- No vender como SaaS si aún requiere intervención manual constante.

---

## 19. Estado actual del proyecto

Estado actual:

```text
Fase 0 — Preparación y documentación
```

Avances realizados:

- Requerimientos iniciales documentados.
- Reglas de cálculo iniciales documentadas.
- Modelo de datos propuesto.
- Proceso de validación con Franklin definido.
- Arquitectura técnica definida.
- Modelo Prisma propuesto.
- Estrategia de importación Excel definida.
- Casos de validación definidos.
- Pruebas de cálculo definidas.

Siguiente paso:

```text
Crear repositorio, estructura de carpetas y proyecto Next.js base.
```

---

## 20. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

