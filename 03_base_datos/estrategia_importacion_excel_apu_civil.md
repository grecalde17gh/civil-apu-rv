# Estrategia de Importación Excel — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define la estrategia para importar, limpiar y transformar la información del archivo Excel base hacia la base de datos del sistema.

El archivo Excel inicial será utilizado como fuente técnica preliminar para construir:

- Base de materiales.
- Base de mano de obra.
- Base de equipos y herramientas.
- Base de rubros.
- Componentes de análisis de precios unitarios.
- Lista de presupuesto inicial.

El objetivo no es copiar el Excel de forma ciega, sino convertirlo en datos estructurados, limpios y validados.

---

## 2. Archivo base

Archivo inicial:

```text
APUS RUBROS IESS HG.xlsm
```

Ubicación sugerida dentro del proyecto:

```text
01_excel_base/APUS_RUBROS_IESS_HG.xlsm
```

Este archivo contiene macros y múltiples hojas, por lo que debe tratarse como una fuente de datos técnica, no como una base de datos definitiva.

---

## 3. Principio central de importación

La regla principal será:

> El Excel es la fuente inicial de información, pero la aplicación no debe depender permanentemente del Excel para funcionar.

Luego de la importación inicial, la información deberá quedar almacenada en PostgreSQL y gestionarse desde la aplicación.

---

## 4. Objetivos de la importación

1. Extraer materiales desde la hoja de base de datos.
2. Extraer mano de obra desde la hoja de base de datos.
3. Extraer equipos y herramientas desde la hoja de base de datos.
4. Extraer rubros desde la lista principal de rubros.
5. Extraer componentes de cada hoja individual de APU.
6. Detectar errores de fórmulas, referencias rotas o datos incompletos.
7. Crear reportes de inconsistencias.
8. Preparar datos limpios para carga en PostgreSQL.
9. Permitir comparación entre resultados del Excel y resultados de la aplicación.

---

## 5. Hojas esperadas del Excel

Según el análisis inicial, el archivo contiene al menos las siguientes hojas relevantes:

## 5.1. BASE DE DATOS

Contiene información de:

- Mano de obra.
- Equipos.
- Materiales.

Esta hoja debe dividirse en tres conjuntos de datos independientes.

## 5.2. LISTA DE RUBROS

Contiene la tabla principal del presupuesto o listado general de rubros.

Campos esperados:

- Ítem.
- Código.
- Descripción.
- Unidad.
- Cantidad.
- Precio unitario.
- Precio total.
- VAE, si aplica.
- Cronograma valorado, si aplica.

## 5.3. Hojas individuales de rubros

Cada hoja representa un APU específico.

Ejemplos detectados:

```text
RP0009
RP0033
RALB0007
RRA0008
RCM0004
REHA0005
REHA0006
```

Cada hoja individual puede contener:

- Datos generales del rubro.
- Equipos.
- Mano de obra.
- Materiales.
- Transporte.
- Costo directo.
- Costos indirectos.
- Precio unitario.

---

## 6. Datos a extraer

## 6.1. Materiales

Destino en base de datos:

```text
materials
```

Campos a extraer:

| Campo destino | Fuente esperada en Excel | Observación |
|---|---|---|
| code | Código, si existe | Puede estar vacío. |
| description | Descripción | Obligatorio. |
| unit | Unidad | Obligatorio. |
| unitCost | Costo unitario | Obligatorio para uso en APU. |
| cpc | CPC | Opcional. |
| vae | VAE | Opcional/informativo inicialmente. |
| category | Categoría | Puede inferirse después. |
| priceDate | Fecha de actualización | Puede asignarse fecha de importación. |
| isActive | Valor por defecto | true |

---

## 6.2. Mano de obra

Destino en base de datos:

```text
labor_items
```

Campos a extraer:

| Campo destino | Fuente esperada en Excel | Observación |
|---|---|---|
| code | Código, si existe | Puede estar vacío. |
| roleName | Cargo / tipo de trabajo | Obligatorio. |
| hourlyCost | Salario o costo hora | Obligatorio. |
| dailyCost | Costo jornada | Opcional. |
| competencies | Competencias | Opcional. |
| cpc | CPC | Opcional. |
| vae | VAE | Opcional. |
| priceDate | Fecha de actualización | Puede asignarse fecha de importación. |
| isActive | Valor por defecto | true |

---

## 6.3. Equipos y herramientas

Destino en base de datos:

```text
equipment_items
```

Campos a extraer:

| Campo destino | Fuente esperada en Excel | Observación |
|---|---|---|
| code | Código, si existe | Puede estar vacío. |
| description | Descripción | Obligatorio. |
| equipmentType | Tipo | Puede inferirse. |
| hourlyRate | Tarifa horaria | Si existe. |
| dailyRate | Tarifa diaria | Si existe. |
| purchaseCost | Costo de compra | Opcional. |
| maintenanceRequired | Mantenimiento | Opcional. |
| cpc | CPC | Opcional. |
| vae | VAE | Opcional. |
| priceDate | Fecha de actualización | Puede asignarse fecha de importación. |
| isActive | Valor por defecto | true |

---

## 6.4. Rubros

Destino en base de datos:

```text
rubros
```

Campos a extraer:

| Campo destino | Fuente esperada en Excel | Observación |
|---|---|---|
| code | Código del rubro | Obligatorio. |
| description | Descripción | Obligatorio. |
| unit | Unidad | Obligatorio. |
| category | Capítulo/categoría | Opcional. |
| performanceValue | Rendimiento | Pendiente de validación. |
| performanceUnit | Unidad de rendimiento | Pendiente de validación. |
| indirectPercentage | Costos indirectos | Si no existe, usar valor por defecto. |
| directCost | Costo directo Excel | Para comparación. |
| indirectCost | Costo indirecto Excel | Para comparación. |
| unitPrice | Precio unitario Excel | Para comparación. |
| status | Estado | Inicialmente DRAFT o VALIDATED según revisión. |
| sourceExcelSheet | Nombre de hoja | Útil para trazabilidad. |

---

## 6.5. Componentes de rubros

Los componentes se extraerán desde cada hoja individual de APU.

Destinos posibles:

```text
rubro_materials
rubro_labor
rubro_equipment
rubro_transport
```

Campos comunes:

- Rubro asociado.
- Descripción del componente.
- Cantidad.
- Unidad.
- Costo unitario o tarifa.
- Rendimiento o tiempo, si aplica.
- Costo total.
- Sección de origen: equipo, mano de obra, material o transporte.

---

## 7. Proceso general de importación

La importación se realizará en fases.

## 7.1. Fase 1 — Lectura del archivo

Objetivo:

Leer el Excel sin modificarlo.

Tareas:

1. Abrir archivo con una librería compatible.
2. Listar todas las hojas.
3. Identificar hojas relevantes.
4. Detectar hojas ocultas, si existen.
5. Registrar dimensiones de cada hoja.

Librería sugerida en Python:

```text
openpyxl
```

Alternativa en Node.js:

```text
xlsx
```

Recomendación inicial:

Usar Python + openpyxl para análisis y limpieza inicial.

---

## 7.2. Fase 2 — Perfilamiento de datos

Objetivo:

Entender la estructura real de cada hoja.

Tareas:

1. Detectar encabezados.
2. Identificar rangos de datos.
3. Separar secciones dentro de la hoja `BASE DE DATOS`.
4. Identificar tablas dentro de hojas APU.
5. Detectar celdas con fórmulas.
6. Detectar celdas con errores como `#REF!`, `#N/A`, `#DIV/0!`.
7. Detectar filas vacías.
8. Detectar columnas irrelevantes.

Resultado esperado:

```text
reporte_perfilamiento_excel.md
```

---

## 7.3. Fase 3 — Limpieza de catálogos

Objetivo:

Crear archivos limpios para materiales, mano de obra y equipos.

Archivos sugeridos:

```text
03_base_datos/datos_limpios/materiales_limpios.csv
03_base_datos/datos_limpios/mano_obra_limpia.csv
03_base_datos/datos_limpios/equipos_limpios.csv
```

Limpiezas necesarias:

1. Eliminar filas vacías.
2. Normalizar encabezados.
3. Quitar espacios innecesarios.
4. Convertir costos a formato numérico.
5. Separar CPC y VAE.
6. Normalizar unidades.
7. Detectar duplicados.
8. Marcar registros incompletos.

---

## 7.4. Fase 4 — Extracción de rubros

Objetivo:

Crear un catálogo inicial de rubros.

Archivo sugerido:

```text
03_base_datos/datos_limpios/rubros_limpios.csv
```

Datos mínimos:

- Código.
- Descripción.
- Unidad.
- Precio unitario Excel.
- Hoja de origen.
- Estado de revisión.

Regla:

Si existe una hoja con el mismo código del rubro, se vinculará como fuente del APU.

---

## 7.5. Fase 5 — Extracción de APUs individuales

Objetivo:

Extraer componentes de cada hoja individual de rubro.

Archivos sugeridos:

```text
03_base_datos/datos_limpios/rubro_materials_limpios.csv
03_base_datos/datos_limpios/rubro_labor_limpios.csv
03_base_datos/datos_limpios/rubro_equipment_limpios.csv
03_base_datos/datos_limpios/rubro_transport_limpios.csv
```

Tareas:

1. Identificar sección de equipos.
2. Identificar sección de mano de obra.
3. Identificar sección de materiales.
4. Identificar sección de transporte.
5. Extraer cantidades.
6. Extraer precios o tarifas.
7. Extraer costos totales.
8. Extraer subtotales.
9. Extraer precio unitario final.
10. Registrar errores.

---

## 7.6. Fase 6 — Validación preliminar

Objetivo:

Comparar los datos extraídos con los resultados del Excel.

Tareas:

1. Recalcular costos con fórmulas asumidas.
2. Comparar contra precio unitario del Excel.
3. Calcular diferencia.
4. Marcar registros coincidentes.
5. Marcar registros con diferencia.
6. Generar reporte para Franklin.

Archivo sugerido:

```text
04_pruebas/comparacion_excel_vs_importacion.md
```

---

## 7.7. Fase 7 — Carga a PostgreSQL

Objetivo:

Insertar datos limpios en la base de datos.

Orden recomendado de carga:

```text
1. Usuarios iniciales
2. Configuración de cálculo
3. Materiales
4. Mano de obra
5. Equipos
6. Rubros
7. Componentes de rubros
8. Proyectos de prueba
9. Presupuestos de prueba
```

La carga inicial puede realizarse mediante:

```text
prisma/seed.ts
```

O mediante scripts separados en:

```text
03_base_datos/scripts_importacion/
```

---

## 8. Reportes que debe generar la importación

## 8.1. Reporte de hojas encontradas

Debe listar:

- Nombre de hoja.
- Número de filas.
- Número de columnas.
- Tipo de hoja detectada.

---

## 8.2. Reporte de errores de Excel

Debe listar celdas con errores como:

```text
#REF!
#N/A
#DIV/0!
#VALUE!
```

Campos sugeridos:

| Hoja | Celda | Valor | Comentario |
|---|---|---|---|

---

## 8.3. Reporte de registros incompletos

Debe listar materiales, mano de obra, equipos o rubros con datos faltantes.

Campos sugeridos:

| Tipo | Código | Descripción | Campo faltante | Observación |
|---|---|---|---|---|

---

## 8.4. Reporte de duplicados

Debe identificar registros potencialmente duplicados.

Criterios iniciales:

- Misma descripción.
- Misma unidad.
- Mismo costo.
- Código repetido.

---

## 8.5. Reporte de comparación de precios unitarios

Debe comparar:

| Código rubro | Precio Excel | Precio recalculado | Diferencia | Estado |
|---|---:|---:|---:|---|

Estados sugeridos:

```text
coincide
diferencia_por_redondeo
diferencia_requiere_revision
error_en_datos
pendiente_validacion
```

---

## 9. Reglas de limpieza de datos

## 9.1. Texto

Aplicar:

1. Quitar espacios al inicio y final.
2. Reemplazar dobles espacios.
3. Mantener mayúsculas/minúsculas originales si son útiles.
4. Evitar convertir todo automáticamente a mayúsculas sin validación.
5. Normalizar caracteres especiales solo si causan errores.

---

## 9.2. Números

Aplicar:

1. Convertir valores monetarios a número decimal.
2. Reemplazar comas decimales si aparecen.
3. Eliminar símbolos de moneda.
4. No permitir valores negativos sin revisión.
5. Identificar ceros sospechosos.

---

## 9.3. Unidades

Crear una tabla de normalización.

Ejemplos:

| Variante | Unidad normalizada |
|---|---|
| M2 | m2 |
| m² | m2 |
| M3 | m3 |
| m³ | m3 |
| KG | kg |
| UND | und |
| U | und |
| glb | global |

Esta tabla debe revisarse con Franklin.

---

## 9.4. Códigos

Aplicar:

1. Quitar espacios.
2. Mantener ceros iniciales si existen.
3. No convertir códigos a número.
4. Tratar códigos como texto.

Ejemplo:

```text
RP0009 debe mantenerse como RP0009
```

---

## 10. Manejo de errores del Excel

## 10.1. Celdas con errores

Si una celda contiene:

```text
#REF!
#N/A
#DIV/0!
#VALUE!
```

No debe importarse como valor válido.

Debe registrarse en un reporte de errores.

---

## 10.2. Fórmulas

El sistema debe diferenciar entre:

- Valor calculado visible.
- Fórmula original.

Para la importación inicial se priorizará el valor calculado visible, pero se registrarán fórmulas importantes cuando sea posible.

---

## 10.3. Macros

El archivo `.xlsm` puede contener macros.

La importación no debe depender de ejecutar macros.

Regla:

```text
No ejecutar macros durante la importación.
```

---

## 11. Estrategia de componentes de APU

Cada hoja APU deberá ser analizada para detectar secciones.

## 11.1. Secciones esperadas

```text
EQUIPOS
MANO DE OBRA
MATERIALES
TRANSPORTE
```

## 11.2. Método sugerido de detección

1. Buscar palabras clave en la hoja.
2. Identificar filas de inicio y fin de cada sección.
3. Detectar encabezados de cada tabla.
4. Extraer filas hasta encontrar subtotal o siguiente sección.
5. Ignorar filas vacías o decorativas.

---

## 12. Campos mínimos por componente

## 12.1. Equipos

- Código o descripción.
- Cantidad.
- Tarifa.
- Tiempo o rendimiento.
- Costo total.

## 12.2. Mano de obra

- Cargo.
- Cantidad.
- Costo hora.
- Rendimiento o tiempo.
- Costo total.

## 12.3. Materiales

- Descripción.
- Unidad.
- Cantidad.
- Costo unitario.
- Costo total.

## 12.4. Transporte

- Descripción.
- Unidad.
- Cantidad.
- Costo unitario.
- Costo total.

---

## 13. Reglas para vincular componentes con catálogos

Al importar un componente de rubro, se debe intentar vincularlo con el catálogo correspondiente.

## 13.1. Criterios de vinculación

1. Coincidencia exacta por código, si existe.
2. Coincidencia exacta por descripción.
3. Coincidencia normalizada por descripción.
4. Coincidencia aproximada, solo para reporte, no para carga automática definitiva.

## 13.2. Regla de seguridad

Si la coincidencia no es clara, el componente debe quedar marcado como:

```text
pendiente_de_revision
```

No debe vincularse automáticamente a un insumo incorrecto.

---

## 14. Archivos intermedios recomendados

Antes de insertar en PostgreSQL, se recomienda generar archivos intermedios.

```text
03_base_datos/datos_limpios/materiales_limpios.csv
03_base_datos/datos_limpios/mano_obra_limpia.csv
03_base_datos/datos_limpios/equipos_limpios.csv
03_base_datos/datos_limpios/rubros_limpios.csv
03_base_datos/datos_limpios/rubro_materials_limpios.csv
03_base_datos/datos_limpios/rubro_labor_limpios.csv
03_base_datos/datos_limpios/rubro_equipment_limpios.csv
03_base_datos/datos_limpios/rubro_transport_limpios.csv
```

Ventaja:

Permiten revisar datos antes de insertarlos en la base.

---

## 15. Estado de revisión de datos importados

Cada registro importado puede tener un estado de revisión.

Estados sugeridos:

```text
importado
limpio
con_observaciones
pendiente_revision
validado
rechazado
```

Estos estados pueden manejarse inicialmente en archivos de reporte o posteriormente en la base de datos.

---

## 16. Importación inicial vs importación futura

## 16.1. Importación inicial

Objetivo:

Cargar la información base para construir el MVP.

Características:

- Puede ser semi-manual.
- Puede usar scripts exploratorios.
- Puede requerir revisión humana.
- No necesita interfaz gráfica.

## 16.2. Importación futura

Objetivo:

Permitir que usuarios carguen nuevos archivos Excel desde la aplicación.

Características:

- Debe tener interfaz.
- Debe validar columnas.
- Debe mostrar errores.
- Debe permitir previsualización.
- Debe evitar duplicados.
- Debe registrar historial.

Recomendación:

No construir importador visual en el MVP inicial, salvo que sea estrictamente necesario.

---

## 17. Herramientas sugeridas

## 17.1. Python

Librerías:

```text
openpyxl
pandas
```

Uso:

- Lectura del Excel.
- Perfilamiento.
- Limpieza.
- Generación de CSV.
- Reportes de errores.

## 17.2. Node.js

Librerías:

```text
xlsx
csv-parse
```

Uso:

- Importación directa desde la app o scripts del proyecto.

## 17.3. Prisma

Uso:

- Carga final hacia PostgreSQL.
- Seed inicial.
- Validación de relaciones.

---

## 18. Scripts sugeridos

Ubicación:

```text
03_base_datos/scripts_importacion/
```

Scripts recomendados:

```text
01_listar_hojas_excel.py
02_perfilar_excel.py
03_extraer_catalogos.py
04_extraer_rubros.py
05_extraer_apus.py
06_generar_reportes.py
07_generar_csv_limpios.py
08_seed_postgresql.ts
```

---

## 19. Flujo técnico recomendado

```text
Excel original
  ↓
Lectura con Python
  ↓
Perfilamiento de hojas
  ↓
Extracción de catálogos
  ↓
Extracción de rubros
  ↓
Extracción de componentes APU
  ↓
Limpieza y normalización
  ↓
Generación de CSV limpios
  ↓
Revisión con Franklin
  ↓
Seed con Prisma
  ↓
PostgreSQL
  ↓
Aplicación Next.js
```

---

## 20. Validación con Franklin antes de carga definitiva

Franklin deberá revisar especialmente:

1. Materiales con costos cero.
2. Materiales duplicados.
3. Mano de obra con costos sospechosos.
4. Equipos sin tarifa.
5. Rubros sin unidad.
6. Rubros sin componentes.
7. Rubros con diferencias de precio.
8. Rubros con errores `#REF!` o `#N/A`.
9. Interpretación de rendimiento.
10. Formato final de APU.

---

## 21. Criterios de aceptación de la importación inicial

La importación inicial se considerará aceptada cuando:

1. Se haya identificado la estructura del Excel.
2. Se hayan extraído materiales, mano de obra y equipos.
3. Se hayan extraído al menos 10 rubros de prueba.
4. Se hayan extraído componentes de esos rubros.
5. Se hayan generado reportes de errores.
6. Se hayan detectado duplicados relevantes.
7. Se hayan comparado precios Excel vs cálculo preliminar.
8. Franklin haya revisado los rubros seleccionados.
9. Los datos limpios puedan cargarse a PostgreSQL.
10. La app pueda mostrar y usar esos datos.

---

## 22. Riesgos de importación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Hojas con estructura irregular | Alto | Perfilamiento previo y scripts flexibles. |
| Fórmulas rotas | Alto | Reporte de errores y revisión manual. |
| Datos duplicados | Medio | Detección de duplicados antes de cargar. |
| Unidades inconsistentes | Alto | Tabla de normalización de unidades. |
| Costos en texto | Medio | Conversión controlada a Decimal. |
| Macros necesarias para calcular | Alto | No depender de macros; usar valores visibles. |
| Componentes mal vinculados | Alto | Vinculación conservadora y revisión humana. |
| Copiar errores del Excel | Alto | Comparar, reportar y validar con Franklin. |

---

## 23. Reglas para Codex

Cuando se le pida a Codex crear scripts de importación, debe respetar:

1. No modificar el archivo Excel original.
2. No ejecutar macros.
3. Generar reportes antes de insertar datos.
4. Separar extracción, limpieza y carga.
5. No asumir coincidencias ambiguas como válidas.
6. Tratar códigos como texto.
7. Tratar valores monetarios como Decimal.
8. Registrar errores y datos faltantes.
9. Crear archivos CSV intermedios.
10. Documentar supuestos encontrados.

---

## 24. Prompt sugerido para Codex — Perfilamiento Excel

```text
Actúa como desarrollador senior de datos con experiencia en Python, openpyxl y pandas.

Necesito crear un script para perfilar un archivo Excel .xlsm usado para presupuestos y análisis de precios unitarios de ingeniería civil.

Archivo de entrada:
01_excel_base/APUS_RUBROS_IESS_HG.xlsm

Objetivo:
- Leer el archivo sin modificarlo.
- No ejecutar macros.
- Listar todas las hojas.
- Para cada hoja, identificar número de filas y columnas usadas.
- Detectar celdas con errores como #REF!, #N/A, #DIV/0!, #VALUE!.
- Generar un reporte Markdown en 04_pruebas/reporte_perfilamiento_excel.md.
- Generar también un JSON con la estructura detectada.

Restricciones:
- No escribir cambios en el Excel original.
- El script debe manejar errores de forma robusta.
- El código debe estar documentado.
```

---

## 25. Prompt sugerido para Codex — Extracción de catálogos

```text
Actúa como desarrollador senior de datos.

Necesito crear un script en Python para extraer catálogos desde la hoja BASE DE DATOS del archivo:
01_excel_base/APUS_RUBROS_IESS_HG.xlsm

El script debe separar:
- Materiales
- Mano de obra
- Equipos y herramientas

Debe generar archivos CSV limpios en:
03_base_datos/datos_limpios/

Reglas:
- No modificar el Excel original.
- No ejecutar macros.
- Quitar filas vacías.
- Normalizar encabezados.
- Tratar códigos como texto.
- Convertir costos a Decimal cuando sea posible.
- Registrar filas con errores en un reporte Markdown.
- No eliminar registros dudosos; marcarlos como pendiente_revision.
```

---

## 26. Prompt sugerido para Codex — Extracción de APUs

```text
Actúa como desarrollador senior de datos especializado en automatización de Excel.

Necesito crear un script en Python para extraer análisis de precios unitarios desde hojas individuales de un archivo Excel .xlsm.

Cada hoja de rubro puede tener secciones como:
- EQUIPOS
- MANO DE OBRA
- MATERIALES
- TRANSPORTE

El script debe:
- Detectar hojas cuyo nombre parezca código de rubro.
- Extraer datos generales del rubro.
- Detectar secciones por palabras clave.
- Extraer componentes de cada sección.
- Calcular subtotales preliminares.
- Registrar errores, celdas vacías y valores no numéricos.
- Generar CSV separados para rubro_materials, rubro_labor, rubro_equipment y rubro_transport.
- Generar un reporte Markdown con observaciones.

Restricciones:
- No modificar el Excel original.
- No ejecutar macros.
- No asumir coincidencias ambiguas con catálogos.
- Marcar componentes dudosos como pendiente_revision.
```

---

## 27. Decisión recomendada

Para el MVP se recomienda:

1. No crear todavía una pantalla de importación visual.
2. Usar scripts para extraer y limpiar datos.
3. Revisar los CSV con Franklin.
4. Cargar solo datos validados o razonablemente limpios.
5. Usar 10 rubros reales como primera muestra.
6. Ampliar la importación después de validar el modelo.

---

## 28. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

