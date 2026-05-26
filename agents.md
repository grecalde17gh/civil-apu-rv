# AGENTS.md — Instrucciones para Codex

## Contexto del proyecto

Este proyecto se llama `civil-apu-ecuador`.

Es una aplicación web para presupuestos de obra y análisis de precios unitarios para ingeniería civil en Ecuador.

El sistema parte de un Excel técnico real, pero el objetivo no es copiar el Excel visualmente, sino convertir su lógica en una aplicación estructurada, validada y escalable.

## Objetivo del MVP

Construir una aplicación web que permita:

1. Administrar materiales.
2. Administrar mano de obra.
3. Administrar equipos y herramientas.
4. Crear rubros.
5. Crear análisis de precios unitarios.
6. Calcular precio unitario.
7. Crear presupuestos.
8. Exportar a Excel y PDF.
9. Validar cálculos con rubros reales.

## Stack obligatorio

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Vitest para pruebas
- ExcelJS para exportación Excel

## Reglas obligatorias

1. No implementar IA dentro del producto MVP.
2. No cambiar reglas técnicas sin actualizar documentación.
3. No mezclar cálculos dentro de componentes de interfaz.
4. El motor de cálculo debe vivir en `src/lib/calculations/`.
5. Usar `Decimal` en Prisma para dinero, cantidades y porcentajes.
6. No usar `Float` para valores monetarios en base de datos.
7. Usar UUID como identificador principal.
8. Guardar snapshots de precios en rubros y presupuestos.
9. No modificar presupuestos emitidos automáticamente.
10. No eliminar físicamente catálogos usados; usar `isActive`.
11. Toda fórmula pendiente debe quedar marcada como pendiente de validación con Franklin.

## Documentos que deben revisarse antes de programar

- `README.md`
- `00_documentacion/requerimientos_iniciales.md`
- `00_documentacion/reglas_calculo_apu.md`
- `00_documentacion/modelo_datos.md`
- `00_documentacion/arquitectura_tecnica.md`
- `03_base_datos/modelo_prisma.md`
- `04_pruebas/pruebas_calculo.md`

## Forma de trabajo

Trabajar por tareas pequeñas.

Antes de hacer cambios grandes:

1. Explicar brevemente qué archivos se modificarán.
2. Hacer cambios mínimos y coherentes.
3. Ejecutar pruebas si existen.
4. Reportar qué cambió.
5. No modificar archivos no relacionados.

## Prioridad actual

Estamos en Fase 1 — MVP técnico.

Orden de trabajo:

1. Configurar Prisma.
2. Crear `schema.prisma`.
3. Ejecutar migración inicial.
4. Crear motor de cálculo.
5. Crear pruebas unitarias.
6. Crear CRUD de catálogos.
7. Crear rubros.
8. Crear presupuestos.
