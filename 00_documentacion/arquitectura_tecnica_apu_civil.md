# Arquitectura Técnica — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define la arquitectura técnica inicial para construir la aplicación de presupuestos y análisis de precios unitarios de ingeniería civil.

El objetivo es establecer una base clara para el desarrollo del MVP, facilitar el trabajo con herramientas de asistencia como Codex y evitar decisiones técnicas improvisadas.

La arquitectura debe permitir:

- Construir un MVP funcional.
- Mantener cálculos confiables.
- Escalar hacia un producto comercial.
- Integrar inteligencia artificial en fases futuras.
- Facilitar mantenimiento, pruebas y validación técnica.

---

## 2. Principios de arquitectura

La arquitectura del sistema se basará en los siguientes principios:

1. Simplicidad primero.
2. Cálculos transparentes y auditables.
3. Separación clara entre interfaz, lógica de negocio y base de datos.
4. Uso de tecnologías modernas y ampliamente soportadas.
5. Modelo de datos estructurado.
6. Preparación para futura escalabilidad.
7. Exportaciones confiables.
8. Seguridad básica desde el inicio.
9. Código modular y mantenible.
10. Documentación viva durante el desarrollo.

---

## 3. Stack tecnológico recomendado

## 3.1. Frontend

Tecnología propuesta:

```text
Next.js + React + TypeScript
```

Justificación:

- Permite crear interfaces modernas.
- Puede funcionar como frontend y backend en una sola estructura.
- Facilita el desarrollo full stack.
- Tiene buen ecosistema.
- Es compatible con despliegues escalables.

---

## 3.2. Estilos e interfaz

Tecnología propuesta:

```text
Tailwind CSS
```

Opcionalmente:

```text
shadcn/ui
```

Justificación:

- Permite crear interfaces limpias rápidamente.
- Facilita consistencia visual.
- Es compatible con componentes reutilizables.
- Reduce tiempo de diseño para el MVP.

---

## 3.3. Backend

Tecnología propuesta para MVP:

```text
Next.js API Routes o Server Actions
```

Justificación:

- Permite mantener frontend y backend en el mismo proyecto.
- Reduce complejidad inicial.
- Facilita el trabajo con Codex.
- Es suficiente para CRUD, cálculos y exportaciones iniciales.

Alternativa futura:

```text
FastAPI + Python
```

Esta alternativa podría considerarse si en fases posteriores se integran motores avanzados de cálculo, procesamiento de archivos, IA o automatizaciones pesadas.

---

## 3.4. Base de datos

Tecnología propuesta:

```text
PostgreSQL
```

Justificación:

- Robusta y confiable.
- Adecuada para datos estructurados.
- Compatible con producción.
- Soporta relaciones complejas.
- Escalable para producto SaaS.

---

## 3.5. ORM

Tecnología propuesta:

```text
Prisma
```

Justificación:

- Permite definir el modelo de datos de forma clara.
- Facilita migraciones.
- Funciona muy bien con TypeScript.
- Ayuda a Codex a entender la estructura del sistema.
- Reduce errores en consultas SQL manuales.

---

## 3.6. Autenticación

Tecnología sugerida para MVP:

```text
Auth.js / NextAuth
```

Alternativa simple inicial:

```text
Autenticación básica con email y contraseña cifrada
```

Recomendación:

Para el MVP se puede usar una autenticación simple, pero si se busca producto comercial desde temprano, conviene usar Auth.js / NextAuth.

---

## 3.7. Exportación a Excel

Librería sugerida:

```text
ExcelJS
```

Uso:

- Exportar presupuesto final.
- Exportar APU individual.
- Exportar base de rubros, si aplica.

---

## 3.8. Exportación a PDF

Opciones sugeridas:

```text
HTML + Puppeteer
```

O:

```text
React PDF
```

Recomendación inicial:

Usar HTML con plantillas bien diseñadas y convertir a PDF, porque permite controlar mejor el formato visual.

---

## 3.9. Validación de formularios

Librerías sugeridas:

```text
Zod
React Hook Form
```

Uso:

- Validar campos obligatorios.
- Evitar valores negativos.
- Controlar tipos de datos.
- Mostrar mensajes claros al usuario.

---

## 3.10. Control de versiones

Herramienta:

```text
Git + GitHub
```

Uso:

- Controlar cambios del código.
- Crear ramas de desarrollo.
- Registrar avances.
- Trabajar con Codex de manera más ordenada.

---

## 4. Arquitectura general del sistema

## 4.1. Vista general

```text
Usuario
  ↓
Interfaz Web Next.js
  ↓
Lógica de aplicación / API interna
  ↓
Servicios de cálculo APU y presupuesto
  ↓
Prisma ORM
  ↓
PostgreSQL
```

## 4.2. Componentes principales

1. Interfaz de usuario.
2. Módulo de autenticación.
3. Módulo de catálogos.
4. Módulo de rubros.
5. Motor de cálculo APU.
6. Módulo de presupuestos.
7. Módulo de exportación.
8. Base de datos.
9. Módulo de validación técnica.
10. Módulo futuro de IA.

---

## 5. Separación por capas

## 5.1. Capa de presentación

Responsable de mostrar pantallas al usuario.

Incluye:

- Dashboard.
- Formularios.
- Tablas.
- Filtros.
- Botones de acción.
- Vistas de APU.
- Vistas de presupuesto.
- Pantallas de exportación.

Tecnologías:

```text
React
Next.js
Tailwind CSS
shadcn/ui
```

---

## 5.2. Capa de lógica de negocio

Responsable de aplicar reglas del sistema.

Incluye:

- Cálculo de materiales.
- Cálculo de mano de obra.
- Cálculo de equipos.
- Cálculo de transporte.
- Cálculo de costos directos.
- Cálculo de costos indirectos.
- Cálculo de precio unitario.
- Cálculo de presupuesto.
- Validaciones antes de emitir.

Esta capa debe estar separada en funciones reutilizables.

Ejemplo de ubicación:

```text
src/lib/calculations/
```

---

## 5.3. Capa de acceso a datos

Responsable de comunicarse con la base de datos.

Incluye:

- Consultas a materiales.
- Consultas a mano de obra.
- Consultas a equipos.
- Consultas a rubros.
- Consultas a presupuestos.
- Creación y actualización de registros.

Tecnología:

```text
Prisma
```

Ejemplo de ubicación:

```text
src/lib/db/
```

---

## 5.4. Capa de exportación

Responsable de generar archivos de salida.

Incluye:

- Presupuestos en Excel.
- Presupuestos en PDF.
- APU individual en Excel o PDF.

Ejemplo de ubicación:

```text
src/lib/exporters/
```

---

## 5.5. Capa futura de IA

No forma parte del MVP, pero debe quedar prevista.

Funciones futuras posibles:

- Sugerir rubros.
- Revisar inconsistencias.
- Comparar presupuestos.
- Detectar precios atípicos.
- Crear observaciones técnicas.

Ubicación futura sugerida:

```text
src/lib/ai/
```

---

## 6. Estructura de carpetas sugerida

```text
civil-apu-ecuador/
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
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       │
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/
│       │   │   ├── materiales/
│       │   │   ├── mano-obra/
│       │   │   ├── equipos/
│       │   │   ├── rubros/
│       │   │   ├── presupuestos/
│       │   │   ├── proyectos/
│       │   │   └── api/
│       │   │
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── forms/
│       │   │   ├── tables/
│       │   │   └── layout/
│       │   │
│       │   ├── lib/
│       │   │   ├── db/
│       │   │   ├── calculations/
│       │   │   ├── validators/
│       │   │   ├── exporters/
│       │   │   ├── auth/
│       │   │   └── utils/
│       │   │
│       │   ├── types/
│       │   └── config/
│       │
│       ├── public/
│       ├── package.json
│       ├── .env.example
│       └── README.md
│
├── 03_base_datos/
│   ├── modelo_prisma.md
│   ├── datos_limpios/
│   └── scripts_importacion/
│
├── 04_pruebas/
│   ├── casos_validacion.xlsx
│   ├── comparacion_excel_vs_app.md
│   └── pruebas_calculo.md
│
└── 05_producto/
    ├── propuesta_comercial.md
    ├── roadmap.md
    └── demo_script.md
```

---

## 7. Módulos del MVP

## 7.1. Dashboard

Pantalla inicial del sistema.

Debe mostrar:

- Número de proyectos.
- Número de presupuestos.
- Número de rubros.
- Número de materiales.
- Accesos rápidos.
- Últimos presupuestos editados.

---

## 7.2. Módulo de materiales

Funciones:

- Listar materiales.
- Buscar materiales.
- Crear material.
- Editar material.
- Desactivar material.
- Actualizar costo unitario.

---

## 7.3. Módulo de mano de obra

Funciones:

- Listar registros.
- Crear cargo.
- Editar costo por hora.
- Desactivar registro.
- Buscar por cargo.

---

## 7.4. Módulo de equipos

Funciones:

- Listar equipos.
- Crear equipo.
- Editar tarifa.
- Clasificar equipo.
- Desactivar equipo.

---

## 7.5. Módulo de rubros

Funciones:

- Listar rubros.
- Crear rubro.
- Editar rubro.
- Duplicar rubro.
- Asociar materiales.
- Asociar mano de obra.
- Asociar equipos.
- Asociar transporte.
- Calcular precio unitario.
- Marcar como validado.

---

## 7.6. Módulo de presupuestos

Funciones:

- Crear presupuesto.
- Asociar presupuesto a proyecto.
- Agregar rubros.
- Ingresar cantidades.
- Calcular totales.
- Duplicar presupuesto.
- Emitir presupuesto.
- Exportar presupuesto.

---

## 7.7. Módulo de exportación

Funciones:

- Exportar presupuesto a Excel.
- Exportar presupuesto a PDF.
- Exportar APU individual a PDF.

---

## 8. Motor de cálculo

## 8.1. Ubicación sugerida

```text
src/lib/calculations/
```

## 8.2. Archivos sugeridos

```text
src/lib/calculations/materials.ts
src/lib/calculations/labor.ts
src/lib/calculations/equipment.ts
src/lib/calculations/transport.ts
src/lib/calculations/apu.ts
src/lib/calculations/budget.ts
src/lib/calculations/rounding.ts
```

## 8.3. Regla técnica

El motor de cálculo debe estar separado de la interfaz.

La interfaz no debe calcular directamente precios unitarios.

Correcto:

```text
Interfaz → llama función de cálculo → muestra resultado
```

Incorrecto:

```text
Interfaz → calcula directamente con fórmulas dispersas
```

Esto evita inconsistencias y facilita pruebas.

---

## 9. Validaciones técnicas

## 9.1. Ubicación sugerida

```text
src/lib/validators/
```

## 9.2. Validaciones mínimas

1. No permitir costos negativos.
2. No permitir cantidades negativas.
3. No permitir rubros sin descripción.
4. No permitir materiales sin unidad.
5. No permitir presupuestos vacíos.
6. No emitir presupuestos con totales en cero.
7. Advertir si un rubro no está validado.
8. Advertir si un APU tiene componentes incompletos.

---

## 10. Flujo de datos del APU

```text
Usuario crea o edita rubro
  ↓
Usuario agrega materiales, mano de obra, equipos y transporte
  ↓
Sistema toma costos snapshot de cada insumo
  ↓
Motor de cálculo calcula subtotales
  ↓
Motor calcula costo directo
  ↓
Motor aplica costos indirectos
  ↓
Sistema guarda precio unitario
  ↓
Usuario revisa resultado
  ↓
Validador técnico aprueba o deja observaciones
```

---

## 11. Flujo de datos del presupuesto

```text
Usuario crea proyecto
  ↓
Usuario crea presupuesto
  ↓
Usuario agrega rubros existentes
  ↓
Sistema copia snapshots del rubro
  ↓
Usuario ingresa cantidades
  ↓
Motor calcula total por ítem
  ↓
Motor calcula total general
  ↓
Usuario revisa presupuesto
  ↓
Usuario exporta o emite presupuesto
```

---

## 12. Manejo de snapshots

El sistema debe guardar snapshots para conservar información histórica.

## 12.1. Snapshots en componentes de rubros

Cuando se agrega un material a un rubro:

- Se guarda el costo unitario actual como `unit_cost_snapshot`.

Cuando se agrega mano de obra:

- Se guarda el costo hora actual como `hourly_cost_snapshot`.

Cuando se agrega equipo:

- Se guarda la tarifa actual como `rate_snapshot`.

## 12.2. Snapshots en presupuesto

Cuando se agrega un rubro al presupuesto:

- Se guarda código del rubro.
- Se guarda descripción.
- Se guarda unidad.
- Se guarda precio unitario.

Esto evita que presupuestos emitidos cambien por modificaciones futuras.

---

## 13. Seguridad inicial

## 13.1. Autenticación

El sistema debe requerir inicio de sesión.

Campos mínimos:

- Email.
- Contraseña.

## 13.2. Roles

Roles iniciales:

```text
admin
technical_validator
engineer_user
viewer
```

## 13.3. Permisos mínimos

| Acción | Admin | Validador técnico | Ingeniero | Viewer |
|---|---|---|---|---|
| Crear materiales | Sí | Sí | Sí | No |
| Editar materiales | Sí | Sí | Sí | No |
| Validar rubros | Sí | Sí | No | No |
| Crear presupuestos | Sí | Sí | Sí | No |
| Emitir presupuestos | Sí | Sí | Sí | No |
| Ver información | Sí | Sí | Sí | Sí |

---

## 14. Estrategia de importación del Excel

El Excel base se usará como fuente inicial de datos.

## 14.1. Datos a importar

1. Materiales.
2. Mano de obra.
3. Equipos.
4. Rubros.
5. Componentes de rubros.

## 14.2. Proceso sugerido

```text
1. Leer Excel.
2. Identificar hojas relevantes.
3. Limpiar encabezados.
4. Separar materiales, mano de obra y equipos.
5. Extraer rubros.
6. Validar registros incompletos.
7. Generar reporte de errores.
8. Cargar datos limpios a PostgreSQL.
```

## 14.3. Recomendación

La primera importación puede hacerse mediante scripts separados antes de crear una herramienta visual de importación.

Ubicación sugerida:

```text
03_base_datos/scripts_importacion/
```

---

## 15. Estrategia de pruebas

## 15.1. Pruebas unitarias

Se deben probar funciones de cálculo por separado.

Ejemplos:

- Calcular costo de material.
- Calcular costo de mano de obra.
- Calcular costo de equipo.
- Calcular costo directo.
- Calcular precio unitario.
- Calcular total de presupuesto.

## 15.2. Pruebas con casos reales

Se deben usar rubros del Excel base.

Mínimo:

```text
10 rubros reales validados por Franklin
```

## 15.3. Comparación Excel vs App

Para cada rubro se comparará:

- Precio unitario Excel.
- Precio unitario App.
- Diferencia.
- Causa de diferencia.
- Estado de validación.

---

## 16. Estrategia de despliegue

## 16.1. Desarrollo local

Durante el MVP se trabajará localmente.

Requisitos:

```text
Node.js
PostgreSQL local o Docker
Git
VS Code
```

## 16.2. Base de datos local

Opciones:

1. PostgreSQL instalado localmente.
2. PostgreSQL con Docker.
3. Base temporal en Supabase o Neon.

Recomendación inicial:

```text
PostgreSQL local con Docker
```

Si Docker complica el inicio, se puede usar Supabase o Neon para acelerar.

## 16.3. Producción futura

Opciones futuras:

- Vercel para Next.js.
- Supabase, Neon o Railway para PostgreSQL.
- Servidor VPS si se requiere más control.

---

## 17. Variables de entorno

Archivo sugerido:

```text
.env
```

Archivo de ejemplo:

```text
.env.example
```

Variables iniciales:

```text
DATABASE_URL="postgresql://user:password@localhost:5432/civil_apu_db"
NEXTAUTH_SECRET="secret"
NEXTAUTH_URL="http://localhost:3000"
APP_NAME="APU Civil Pro Ecuador"
DEFAULT_INDIRECT_PERCENTAGE="15"
DEFAULT_IVA_PERCENTAGE="15"
DECIMAL_PLACES="2"
HOURS_PER_DAY="8"
```

---

## 18. Convenciones de código

## 18.1. Lenguaje

El código se escribirá en:

```text
TypeScript
```

## 18.2. Nombres

- Tablas en inglés plural: `materials`, `rubros`, `budgets`.
- Componentes React en PascalCase.
- Funciones en camelCase.
- Constantes en UPPER_CASE.

## 18.3. Cálculos

Las funciones de cálculo deben ser puras cuando sea posible.

Ejemplo:

```text
calculateMaterialCost(quantity, unitCost)
```

No deben depender directamente de la interfaz.

---

## 19. Uso de Codex y ChatGPT en el desarrollo

## 19.1. Rol de IA en el desarrollo

La IA se usará como asistente para:

- Generar estructura inicial.
- Crear modelos Prisma.
- Crear componentes.
- Crear funciones de cálculo.
- Crear pruebas.
- Revisar errores.
- Documentar avances.

## 19.2. Regla principal

La IA no decidirá reglas técnicas de ingeniería civil.

Las reglas técnicas serán asumidas provisionalmente o validadas por Franklin.

## 19.3. Prompts recomendados

Cada solicitud a Codex debe incluir:

1. Contexto del sistema.
2. Archivo específico a modificar.
3. Resultado esperado.
4. Restricciones.
5. Pruebas requeridas.

Ejemplo:

```text
Trabaja únicamente en el módulo de cálculo de materiales.
Crea funciones puras en TypeScript para calcular costo de materiales.
No modifiques la interfaz.
Incluye validaciones para cantidades y costos negativos.
Incluye pruebas unitarias.
```

---

## 20. Roadmap técnico inicial

## 20.1. Sprint 0 — Preparación

Objetivo:

Crear estructura documental y técnica.

Tareas:

1. Crear repositorio.
2. Crear carpetas base.
3. Guardar documentación inicial.
4. Instalar Next.js.
5. Configurar TypeScript.
6. Configurar Tailwind.
7. Configurar Prisma.
8. Configurar PostgreSQL.

---

## 20.2. Sprint 1 — Base de datos y catálogos

Objetivo:

Construir estructura inicial de datos.

Tareas:

1. Crear schema Prisma.
2. Crear tablas principales.
3. Crear CRUD de materiales.
4. Crear CRUD de mano de obra.
5. Crear CRUD de equipos.
6. Crear seed inicial de prueba.

---

## 20.3. Sprint 2 — Rubros y APU

Objetivo:

Crear rubros y calcular precios unitarios.

Tareas:

1. Crear CRUD de rubros.
2. Asociar materiales a rubros.
3. Asociar mano de obra a rubros.
4. Asociar equipos a rubros.
5. Crear motor de cálculo APU.
6. Mostrar resumen del APU.
7. Validar con primeros rubros del Excel.

---

## 20.4. Sprint 3 — Presupuestos

Objetivo:

Crear presupuestos de obra.

Tareas:

1. Crear proyectos.
2. Crear presupuestos.
3. Agregar rubros a presupuesto.
4. Ingresar cantidades.
5. Calcular total por ítem.
6. Calcular total general.

---

## 20.5. Sprint 4 — Exportaciones y validación

Objetivo:

Generar salidas profesionales y validar resultados.

Tareas:

1. Exportar presupuesto a Excel.
2. Exportar presupuesto a PDF.
3. Exportar APU individual a PDF.
4. Comparar con Excel base.
5. Registrar observaciones de Franklin.
6. Corregir diferencias.

---

## 21. Criterios técnicos de éxito del MVP

El MVP será técnicamente exitoso si:

1. La aplicación corre localmente sin errores críticos.
2. La base de datos permite registrar insumos, rubros y presupuestos.
3. El motor de cálculo está separado de la interfaz.
4. Los cálculos pueden probarse con funciones independientes.
5. Se pueden cargar al menos 10 rubros reales.
6. Se puede crear al menos un presupuesto real.
7. Se exporta a Excel.
8. Se exporta a PDF básico.
9. Franklin puede validar resultados.
10. La arquitectura permite evolucionar sin rehacer todo.

---

## 22. Decisiones técnicas asumidas

Las siguientes decisiones se asumen para iniciar el desarrollo:

1. El sistema será una aplicación web.
2. El MVP se construirá con Next.js, TypeScript, Tailwind, Prisma y PostgreSQL.
3. Los cálculos se implementarán en funciones separadas.
4. Se usarán snapshots para preservar presupuestos históricos.
5. La IA no se integrará en el producto durante el MVP.
6. La IA se usará como asistente de desarrollo.
7. El sistema se diseñará pensando en futura modalidad SaaS.
8. El despliegue inicial será local.
9. La exportación a Excel será prioritaria.
10. La exportación PDF será básica al inicio y mejorará después.

---

## 23. Riesgos técnicos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Interpretar mal fórmulas del Excel | Alto | Validar con Franklin y documentar supuestos. |
| Mezclar cálculo con interfaz | Alto | Separar motor de cálculo en `src/lib/calculations`. |
| No guardar snapshots | Alto | Diseñar snapshots desde el modelo de datos. |
| Sobrecargar el MVP | Medio | Seguir roadmap por sprints. |
| Usar IA demasiado pronto dentro del producto | Medio | IA solo como asistencia de desarrollo inicialmente. |
| Importar datos sucios del Excel | Alto | Crear limpieza y reporte de errores. |
| Exportaciones poco profesionales | Medio | Empezar básico y mejorar plantillas. |
| Cambios técnicos de Franklin después | Medio | Parametrizar reglas asumidas. |

---

## 24. Arquitectura futura con IA

En fases posteriores, se podrá agregar una capa de IA.

## 24.1. Arquitectura futura sugerida

```text
Usuario
  ↓
Interfaz Web
  ↓
Módulo IA / Agente especializado
  ↓
Motor de reglas técnicas
  ↓
Base de datos estructurada
  ↓
Respuesta sugerida al usuario
  ↓
Validación humana
```

## 24.2. Casos futuros

1. Asistente para crear rubros.
2. Revisor de inconsistencias.
3. Comparador de presupuestos.
4. Generador de observaciones técnicas.
5. Buscador inteligente de rubros.
6. Asistente de actualización de precios.

## 24.3. Restricción crítica

La IA no debe aprobar rubros ni presupuestos automáticamente.

Debe actuar como asistente, no como autoridad técnica.

---

## 25. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

