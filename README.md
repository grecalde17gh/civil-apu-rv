# civil-apu-ecuador

## Sistema de Presupuestos y Análisis de Precios Unitarios para Ingeniería Civil

## 1. Descripción general

`civil-apu-ecuador` es un proyecto para desarrollar una aplicación web orientada a la creación de presupuestos de obra y análisis de precios unitarios para ingeniería civil.

El sistema nace a partir de un archivo Excel técnico utilizado manualmente por un ingeniero civil experto y busca convertir esa lógica en una aplicación estructurada, confiable, escalable y comercializable.

La prioridad inicial es construir un MVP que calcule correctamente, permita reutilizar rubros, administre bases de datos de insumos y genere presupuestos exportables a Excel y PDF.

---

## 2. Objetivo del proyecto

Desarrollar una aplicación web que permita:

1. Administrar materiales.
2. Administrar mano de obra.
3. Administrar equipos y herramientas.
4. Crear y editar rubros.
5. Elaborar análisis de precios unitarios.
6. Calcular precios unitarios automáticamente.
7. Crear presupuestos de obra.
8. Exportar presupuestos y APUs.
9. Validar técnicamente los resultados con un ingeniero civil experto.
10. Preparar el producto para futuras funcionalidades con asistencia inteligente.

---

## 3. Usuario experto validador

El usuario experto del proyecto será:

```text
Franklin Recalde
Ingeniero civil
```

Su rol será validar:

- Fórmulas.
- Rendimientos.
- Unidades de medida.
- Rubros.
- Componentes de APUs.
- Costos indirectos.
- Resultados contra el Excel base.
- Formatos de exportación.

---

## 4. Archivo base inicial

El proyecto parte del archivo:

```text
01_excel_base/APUS_RUBROS_IESS_HG.xlsm
```

Este archivo contiene:

- Base de datos de materiales.
- Base de datos de mano de obra.
- Base de datos de equipos.
- Lista de rubros.
- Hojas individuales de análisis de precios unitarios.
- Cálculos manuales en Excel.

El Excel se utilizará como fuente inicial, pero la aplicación no dependerá permanentemente de él.

---

## 5. Principio central del producto

La regla principal del proyecto es:

```text
Primero calcular bien, luego mejorar la interfaz, después validar comercialmente y finalmente agregar IA.
```

La inteligencia artificial se usará inicialmente como asistencia para:

- Documentación.
- Arquitectura.
- Generación de código.
- Pruebas.
- Revisión de errores.
- Organización del proyecto.

La IA no será parte central del MVP funcional.

---

## 6. Stack tecnológico propuesto

Para el MVP se propone:

```text
Frontend: Next.js + React + TypeScript
Estilos: Tailwind CSS
Componentes UI: shadcn/ui, opcional
Backend: Next.js API Routes / Server Actions
Base de datos: PostgreSQL
ORM: Prisma
Exportación Excel: ExcelJS
Exportación PDF: HTML + PDF o React PDF
Validación de formularios: Zod + React Hook Form
Pruebas: Vitest
Control de versiones: Git + GitHub
```

---

## 7. Estructura del proyecto

```text
civil-apu-ecuador/
│
├── README.md
│
├── 00_documentacion/
│   ├── requerimientos_iniciales.md
│   ├── reglas_calculo_apu.md
│   ├── modelo_datos.md
│   ├── validacion_franklin.md
│   └── arquitectura_tecnica.md
│
├── 01_excel_base/
│   └── APUS_RUBROS_IESS_HG.xlsm
│
├── 02_app/
│   └── civil-apu-app/
│
├── 03_base_datos/
│   ├── modelo_prisma.md
│   ├── estrategia_importacion_excel.md
│   ├── datos_limpios/
│   └── scripts_importacion/
│
├── 04_pruebas/
│   ├── casos_validacion.md
│   └── pruebas_calculo.md
│
└── 05_producto/
    ├── roadmap.md
    ├── demo_script.md
    └── propuesta_comercial.md
```

---

## 8. Documentos principales

## 8.1. Requerimientos iniciales

Archivo:

```text
00_documentacion/requerimientos_iniciales.md
```

Define:

- Contexto del proyecto.
- Problema actual.
- Objetivos.
- Alcance del MVP.
- Módulos funcionales.
- Reglas iniciales.
- Criterios de aceptación.

---

## 8.2. Reglas de cálculo APU

Archivo:

```text
00_documentacion/reglas_calculo_apu.md
```

Define:

- Fórmulas de materiales.
- Fórmulas de mano de obra.
- Fórmulas de equipos.
- Costos directos.
- Costos indirectos.
- Precio unitario.
- Redondeos.
- Reglas pendientes de validación.

---

## 8.3. Modelo de datos

Archivo:

```text
00_documentacion/modelo_datos.md
```

Define:

- Entidades principales.
- Campos sugeridos.
- Relaciones.
- Estados.
- Snapshots.
- Reglas asumidas.

---

## 8.4. Validación Franklin

Archivo:

```text
00_documentacion/validacion_franklin.md
```

Define:

- Proceso de validación técnica.
- Checklists.
- Preguntas clave.
- Matriz de decisiones.
- Criterios de aprobación.

---

## 8.5. Arquitectura técnica

Archivo:

```text
00_documentacion/arquitectura_tecnica.md
```

Define:

- Stack.
- Capas del sistema.
- Estructura de carpetas.
- Motor de cálculo.
- Exportaciones.
- Seguridad.
- Roadmap técnico.

---

## 8.6. Modelo Prisma

Archivo:

```text
03_base_datos/modelo_prisma.md
```

Define:

- Explicación de Prisma.
- Enums.
- Modelos.
- Relaciones.
- Reglas para Codex.
- Prompt para generar `schema.prisma`.

---

## 8.7. Estrategia de importación Excel

Archivo:

```text
03_base_datos/estrategia_importacion_excel.md
```

Define:

- Cómo leer el Excel.
- Cómo extraer catálogos.
- Cómo extraer rubros.
- Cómo extraer APUs.
- Cómo limpiar datos.
- Cómo generar reportes.
- Cómo cargar a PostgreSQL.

---

## 8.8. Casos de validación

Archivo:

```text
04_pruebas/casos_validacion.md
```

Define:

- Rubros reales de prueba.
- Comparación Excel vs App.
- Tolerancias.
- Fichas de validación.
- Prueba de presupuesto.
- Pruebas de exportación.

---

## 8.9. Pruebas de cálculo

Archivo:

```text
04_pruebas/pruebas_calculo.md
```

Define:

- Funciones esperadas.
- Casos de prueba.
- Casos inválidos.
- Pruebas unitarias sugeridas.
- Prompt para Codex.

---

## 8.10. Roadmap

Archivo:

```text
05_producto/roadmap.md
```

Define:

- Fases del proyecto.
- Sprints.
- Entregables.
- Criterios de éxito.
- Estrategia futura.

---

## 8.11. Guion de demo

Archivo:

```text
05_producto/demo_script.md
```

Define:

- Demo corta.
- Demo extendida.
- Historia de usuario.
- Preguntas frecuentes.
- Checklist de demo.

---

## 8.12. Propuesta comercial

Archivo:

```text
05_producto/propuesta_comercial.md
```

Define:

- Público objetivo.
- Propuesta de valor.
- Diferenciadores.
- Oferta piloto.
- Modelo comercial preliminar.
- Pitch comercial.

---

## 9. Módulos funcionales del MVP

El MVP deberá incluir:

1. Login básico.
2. Dashboard inicial.
3. CRUD de materiales.
4. CRUD de mano de obra.
5. CRUD de equipos.
6. CRUD de rubros.
7. Editor de APU.
8. Motor de cálculo.
9. Gestión de proyectos.
10. Gestión de presupuestos.
11. Exportación a Excel.
12. Exportación básica a PDF.
13. Validación con rubros reales.

---

## 10. Módulos fuera del MVP inicial

No forman parte del MVP inicial:

1. IA integrada dentro del producto.
2. Importador visual avanzado de Excel.
3. Multiempresa avanzado.
4. Suscripciones.
5. Pasarela de pagos.
6. App móvil nativa.
7. Integración con proveedores.
8. Contratación pública automatizada.
9. Cronograma valorado avanzado.
10. Control físico de obra.

---

## 11. Reglas técnicas importantes

1. No usar `Float` para dinero en base de datos.
2. Usar `Decimal` para costos, cantidades y porcentajes.
3. Usar UUID como identificador principal.
4. Guardar snapshots de precios.
5. No modificar presupuestos emitidos automáticamente.
6. Separar motor de cálculo de la interfaz.
7. No copiar errores del Excel sin revisión.
8. Documentar reglas asumidas.
9. Validar fórmulas críticas con Franklin.
10. Mantener exportaciones verificables.

---

## 12. Reglas pendientes de validación

Deben validarse con Franklin:

1. Interpretación definitiva del rendimiento.
2. Fórmula definitiva de mano de obra.
3. Fórmula definitiva de equipos.
4. Manejo de transporte.
5. Porcentaje de costos indirectos.
6. Aplicación de IVA.
7. Uso de VAE.
8. Uso de CPC.
9. Redondeos finales.
10. Formatos de exportación.

---

## 13. Rubros iniciales de prueba

Rubros sugeridos desde el Excel base:

| Código | Descripción | Unidad | Precio referencial |
|---|---|---|---:|
| RP0009 | Retiro de pintura en superficies verticales y horizontales | m2 | 4.09 |
| RP0033 | Curado y resane de paredes con humedad | m2 | 6.13 |
| RALB0007 | Enlucido vertical | m2 | 6.32 |
| RRA0008 | Pintura látex vinil acrílico elastomérica | m2 | 11.31 |
| RCM0004 | Pintura anticorrosiva en rejas | m2 | 15.24 |
| REHA0005 | Hormigón simple f'c=210kg/cm2 en columnas | m3 | 200.71 |
| REHA0006 | Acero de refuerzo fy=4200kg/cm2 | kg | 2.30 |

Se deberán seleccionar al menos 10 rubros reales para validación.

---

## 14. Fases del roadmap

```text
Fase 0 — Preparación y documentación
Fase 1 — MVP técnico
Fase 2 — Validación con Franklin
Fase 3 — Producto demo comercial
Fase 4 — Producto vendible
Fase 5 — Asistencia inteligente con IA
Fase 6 — Escalamiento SaaS
```

---

## 15. Estado actual del proyecto

Estado actual:

```text
Fase 0 — Preparación y documentación
```

Avances completados:

- Requerimientos iniciales.
- Reglas de cálculo.
- Modelo de datos.
- Validación técnica.
- Arquitectura técnica.
- Modelo Prisma.
- Estrategia de importación Excel.
- Casos de validación.
- Pruebas de cálculo.
- Roadmap.
- Guion de demo.
- Propuesta comercial.

---

## 16. Próximo paso técnico

El siguiente paso recomendado es crear la aplicación base:

```text
02_app/civil-apu-app/
```

Con:

```bash
npx create-next-app@latest civil-apu-app
```

Opciones sugeridas:

```text
TypeScript: Sí
ESLint: Sí
Tailwind CSS: Sí
src directory: Sí
App Router: Sí
Import alias: Sí
```

Luego:

```bash
cd civil-apu-app
npm install prisma @prisma/client
npx prisma init
```

---

## 17. Próximo paso con Codex

Prompt inicial sugerido:

```text
Actúa como arquitecto senior full stack especializado en Next.js, TypeScript, PostgreSQL y Prisma.

Vamos a construir una aplicación web para presupuestos de obra y análisis de precios unitarios de ingeniería civil.

Antes de programar, revisa la documentación del proyecto:
- README.md
- 00_documentacion/requerimientos_iniciales.md
- 00_documentacion/arquitectura_tecnica.md
- 03_base_datos/modelo_prisma.md
- 04_pruebas/pruebas_calculo.md

Primera tarea:
Crear la estructura base del proyecto Next.js y preparar Prisma con PostgreSQL.

No implementes IA.
No implementes funcionalidades fuera del MVP.
Prioriza arquitectura limpia, TypeScript, Prisma, Tailwind y separación del motor de cálculo.
```

---

## 18. Advertencia final

Este proyecto no debe avanzar como una simple copia visual del Excel.

El objetivo es convertir una herramienta manual en un sistema estructurado, validado y escalable.

Regla de oro:

```text
Si el cálculo no es confiable, la interfaz no importa.
```

---

## 19. Responsable del proyecto

Responsable funcional y tecnológico:

```text
Gustavo Recalde
```

Validador técnico:

```text
Franklin Recalde
Ingeniero civil
```

---

## 20. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Fecha: 2026-05-25

