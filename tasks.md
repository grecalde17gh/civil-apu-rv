# TASKS.md — Tareas del proyecto

## Fase actual

Fase 1 — MVP técnico

## Tarea 1 — Configurar Prisma

Objetivo:
Crear el archivo `prisma/schema.prisma` usando el modelo definido en `03_base_datos/modelo_prisma.md`.

Criterios:
- Usar PostgreSQL.
- Usar UUID.
- Usar Decimal.
- Crear enums.
- Crear modelos principales.
- Crear relaciones.
- Ejecutar `npx prisma format`.
- No crear interfaz todavía.

## Tarea 2 — Crear motor de cálculo

Objetivo:
Crear funciones puras en `src/lib/calculations/`.

Archivos:
- `rounding.ts`
- `materials.ts`
- `labor.ts`
- `equipment.ts`
- `transport.ts`
- `apu.ts`
- `budget.ts`

Criterios:
- No usar componentes React.
- Validar negativos.
- Validar NaN.
- Redondear a 2 decimales.
- Crear pruebas con Vitest.

## Tarea 3 — CRUD de materiales

Pendiente.

## Tarea 4 — CRUD de mano de obra

Pendiente.

## Tarea 5 — CRUD de equipos

Pendiente.
