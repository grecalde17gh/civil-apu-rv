# INTERFAZ_OBJETIVO.md

# Objetivo de interfaz para Civil APU RV

## 1. Propósito

El objetivo es transformar el MVP funcional de Civil APU RV en una interfaz técnica, densa, clara y vendible para ingenieros civiles que trabajan con presupuestos, rubros y análisis de precios unitarios.

La interfaz debe inspirarse en programas usados en Ecuador y Latinoamérica para APU y presupuestos, como ProExcel, Ares, Obras Plus e InterPro, sin copiarlos directamente.

La prioridad no es una interfaz minimalista tipo SaaS moderno, sino una interfaz práctica, compacta y profesional, parecida a un software técnico de escritorio.

---

## 2. Principios de diseño

1. Mostrar mucha información útil en una sola pantalla.
2. Reducir scroll innecesario.
3. Usar tablas compactas tipo Excel.
4. Mantener totales visibles siempre que sea posible.
5. Priorizar eficiencia de trabajo sobre estética decorativa.
6. Usar navegación clara por módulos.
7. Facilitar edición rápida de cantidades, precios y componentes.
8. Evitar tarjetas grandes, espacios vacíos y pantallas demasiado simples.
9. Usar diseño sobrio: grises, blanco, azul técnico y bordes discretos.
10. Debe sentirse como herramienta profesional de ingeniería civil, no como landing page web.

---

## 3. Referencias visuales observadas

Las referencias revisadas tienen patrones comunes:

* Barra superior con acciones principales.
* Tablas densas con muchas columnas.
* Panel lateral o inferior con totales.
* Secciones por pestañas: materiales, mano de obra, equipos y transporte.
* Área central dominante tipo hoja de cálculo.
* Listados de rubros y presupuestos con códigos, unidades, cantidades y precios.
* Información financiera visible en todo momento.
* Diseño funcional antes que decorativo.

---

## 4. Pantalla objetivo: Presupuesto

La pantalla de presupuesto debe ser una de las principales del sistema.

### Estructura deseada

#### Barra superior

Debe contener acciones principales:

* Guardar
* Crear capítulo
* Agregar rubro
* Copiar presupuesto
* Exportar
* Importar
* Volver
* Recalcular

#### Panel izquierdo

Debe mostrar:

* Buscador de rubros
* Catálogo de rubros disponibles
* Filtros por descripción, código o unidad
* Opción para agregar rubro seleccionado al presupuesto

#### Área central

Debe mostrar el presupuesto en tabla compacta tipo Excel.

Columnas sugeridas:

* Nº
* Código
* Descripción
* Unidad
* Cantidad
* Precio unitario
* Precio total
* Acciones

Debe permitir visualizar capítulos y rubros dentro del presupuesto.

Ejemplo:

* 1 PRELIMINARES

  * 1.1 Limpieza del terreno
  * 1.2 Replanteo y nivelación
* 2 EXCAVACIONES

  * 2.1 Excavación manual
  * 2.2 Desalojo de material

#### Panel inferior o lateral de totales

Debe mostrar siempre:

* Costo directo
* Costos indirectos
* IVA, si aplica
* Total presupuesto
* Número de rubros
* Número de capítulos

---

## 5. Pantalla objetivo: Rubro/APU

La pantalla Rubro/APU debe parecerse a una ficha técnica de análisis de precio unitario.

### Encabezado superior

Debe mostrar en formato compacto:

* Código
* Descripción
* Unidad
* Rendimiento
* Proyecto asociado, si aplica
* Presupuesto asociado, si aplica

Acciones visibles:

* Guardar
* Crear copia
* Volver
* Eliminar, si aplica

---

### Área central

Debe estar organizada por pestañas o bloques:

* Materiales
* Mano de obra
* Equipos
* Transporte

Cada sección debe mostrarse como tabla compacta.

Columnas sugeridas para Materiales:

* Código
* Descripción
* Unidad
* Cantidad
* Precio unitario
* Total
* Editar
* Eliminar

Columnas sugeridas para Mano de obra:

* Código
* Descripción / Rol
* Unidad
* Cantidad
* Costo hora / jornal
* Rendimiento
* Total
* Editar
* Eliminar

Columnas sugeridas para Equipos:

* Código
* Descripción
* Unidad
* Cantidad
* Tarifa
* Rendimiento
* Total
* Editar
* Eliminar

Columnas sugeridas para Transporte:

* Código
* Descripción
* Unidad
* Cantidad
* Distancia
* Tarifa
* Total
* Editar
* Eliminar

---

### Panel de resumen del APU

Debe estar siempre visible en el lado derecho o en la parte inferior.

Debe mostrar:

* Total materiales
* Total mano de obra
* Total equipos
* Total transporte
* Costo directo
* Porcentaje de indirectos
* Valor de indirectos
* Precio unitario final

Este panel debe actualizarse en tiempo real.

---

## 6. Pantallas objetivo: Catálogos

Las pantallas de materiales, mano de obra y equipos deben usar tablas compactas.

Columnas sugeridas:

### Materiales

* Código
* Descripción
* Unidad
* Precio unitario
* Categoría
* Estado
* Editar
* Copiar
* Eliminar

### Mano de obra

* Código
* Rol
* Unidad
* Costo
* Categoría
* Estado
* Editar
* Copiar
* Eliminar

### Equipos

* Código
* Descripción
* Unidad
* Tarifa
* Categoría
* Estado
* Editar
* Copiar
* Eliminar

Debe existir búsqueda rápida y filtros básicos.

---

## 7. Comportamiento esperado

1. El usuario debe poder trabajar con muchas filas visibles.
2. Las tablas deben ser compactas.
3. Las acciones principales deben estar siempre cerca.
4. Los totales deben actualizarse sin obligar al usuario a navegar a otra pantalla.
5. La edición debe sentirse rápida, similar a Excel.
6. La interfaz debe priorizar claridad operativa.
7. Los botones deben tener nombres simples: Guardar, Copiar, Editar, Eliminar, Agregar, Volver.
8. No usar elementos visuales grandes si no aportan información.

---

## 8. No hacer todavía

Por ahora no implementar:

* Electron
* Modo offline
* SQLite local
* Multiusuario
* Dashboards avanzados
* Inteligencia artificial dentro del cálculo
* Cambios al modelo de datos salvo que sean estrictamente necesarios

Primero se debe consolidar una interfaz técnica convincente para validación con usuario experto.

---

## 9. Prioridad de rediseño

Orden recomendado:

1. Pantalla de presupuesto
2. Pantalla de Rubro/APU
3. Catálogos
4. Panel principal
5. Importación/exportación

---

## 10. Criterio de aceptación

La nueva interfaz debe permitir mostrarla a un ingeniero civil experto y que pueda responder:

* Sí entiendo dónde estoy.
* Sí veo los datos importantes.
* Sí puedo trabajar con esto.
* Sí se parece a una herramienta profesional de presupuestos y APU.
* Sí mejora la experiencia frente a una hoja Excel desordenada.
