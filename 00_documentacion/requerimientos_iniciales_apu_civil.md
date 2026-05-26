# Requerimientos Iniciales — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Nombre provisional del proyecto

**civil-apu-ecuador**

Nombre comercial tentativo:

**APU Civil Pro Ecuador**

---

## 2. Contexto del proyecto

El proyecto nace de la necesidad de transformar un archivo Excel técnico, actualmente utilizado de forma manual por un ingeniero civil experto, en una aplicación web profesional, escalable y comercializable para la elaboración de presupuestos de obra y análisis de precios unitarios.

El archivo Excel base contiene información relacionada con:

- Materiales.
- Mano de obra.
- Equipos y herramientas.
- Rubros de construcción.
- Análisis de precios unitarios.
- Tabla de presupuesto general.

El sistema debe mantener la lógica técnica validada por un usuario experto, pero mejorar la experiencia de uso, reducir errores manuales, facilitar la actualización de precios y permitir la generación automática de presupuestos y reportes.

---

## 3. Usuario experto validador

El usuario experto del proyecto será:

**Franklin Recalde**  
Ingeniero civil.

Su rol será validar:

- La estructura técnica de los rubros.
- Las fórmulas de cálculo.
- Los rendimientos utilizados.
- Las unidades de medida.
- Los componentes de materiales, mano de obra y equipos.
- La coherencia de los precios unitarios.
- La utilidad práctica del sistema para otros ingenieros civiles.

---

## 4. Problema actual

Actualmente, la elaboración de presupuestos y análisis de precios unitarios se realiza mediante archivos Excel manuales.

Aunque Excel permite flexibilidad, presenta varios problemas:

1. Riesgo de errores en fórmulas.
2. Dificultad para mantener una base de datos centralizada.
3. Posibilidad de celdas rotas, referencias inválidas o datos duplicados.
4. Complejidad para actualizar precios de materiales, mano de obra y equipos.
5. Dificultad para reutilizar rubros en nuevos proyectos.
6. Poca trazabilidad de cambios.
7. Dificultad para escalar el uso a otros usuarios.
8. Presentación limitada para un producto comercial.

El objetivo no es simplemente replicar el Excel, sino convertirlo en una aplicación robusta, validada y fácil de usar.

---

## 5. Objetivo general

Desarrollar una aplicación web para la gestión de presupuestos de obra y análisis de precios unitarios en ingeniería civil, basada en una base de datos de materiales, mano de obra, equipos y rubros, con capacidad de cálculo automático, edición, validación técnica y exportación a Excel y PDF.

---

## 6. Objetivos específicos

1. Digitalizar la estructura actual del Excel técnico en una base de datos organizada.
2. Crear un módulo de administración de materiales, mano de obra y equipos.
3. Crear un módulo de gestión de rubros.
4. Implementar un editor de análisis de precios unitarios.
5. Permitir el cálculo automático del precio unitario de cada rubro.
6. Permitir la creación de presupuestos de obra a partir de rubros existentes.
7. Permitir la edición de cantidades de obra.
8. Calcular automáticamente el presupuesto total.
9. Exportar presupuestos y análisis de precios unitarios a Excel y PDF.
10. Validar los resultados de la aplicación comparándolos con el Excel original.
11. Preparar la base del sistema para futuras funcionalidades con asistencia de inteligencia artificial.

---

## 7. Alcance inicial del producto

La primera versión del producto será un MVP funcional, enfocado en calcular correctamente y permitir el uso real por parte del usuario experto.

El MVP incluirá:

- Gestión de materiales.
- Gestión de mano de obra.
- Gestión de equipos y herramientas.
- Gestión de rubros.
- Cálculo de análisis de precios unitarios.
- Creación de presupuestos.
- Exportación a Excel.
- Exportación básica a PDF.
- Validación técnica con rubros reales.

La primera versión no incluirá inteligencia artificial integrada. La IA será utilizada principalmente como apoyo en el desarrollo del sistema, documentación, generación de código, pruebas y análisis de arquitectura.

---

## 8. Fuera del alcance inicial

Para evitar dispersión, las siguientes funcionalidades no forman parte de la primera versión:

- Agentes de IA para crear rubros automáticamente.
- Integración con sistemas externos de contratación pública.
- Integración con proveedores en tiempo real.
- Aplicación móvil nativa.
- Gestión contable completa.
- Gestión avanzada de inventario.
- Cronograma valorado avanzado.
- Control de avance físico de obra.
- Firma electrónica.
- Multiempresa avanzado.

Estas funcionalidades podrán considerarse en fases posteriores.

---

## 9. Usuarios objetivo

### Usuario principal

Ingenieros civiles que elaboran presupuestos de obra, análisis de precios unitarios y propuestas técnicas/económicas.

### Usuarios secundarios

- Fiscalizadores de obra.
- Constructores pequeños y medianos.
- Consultores independientes.
- Oficinas técnicas.
- Empresas constructoras.
- Profesionales que trabajan con presupuestos para contratación pública o privada.

---

## 10. Módulos funcionales requeridos

## 10.1. Módulo de materiales

El sistema debe permitir registrar, editar, consultar y desactivar materiales.

Campos iniciales requeridos:

- Código interno.
- Descripción.
- Unidad.
- Costo unitario.
- Cantidad disponible, opcional.
- CPC, si aplica.
- VAE, si aplica.
- Fecha de actualización.
- Estado activo/inactivo.

Funciones requeridas:

- Crear material.
- Editar material.
- Buscar material.
- Filtrar por unidad o categoría.
- Actualizar costo unitario.
- Desactivar material sin eliminarlo definitivamente.

---

## 10.2. Módulo de mano de obra

El sistema debe permitir registrar los tipos de mano de obra utilizados en los análisis de precios unitarios.

Campos iniciales requeridos:

- Código interno.
- Tipo de trabajo o cargo.
- Costo por hora.
- Disponibilidad, opcional.
- Competencias, opcional.
- CPC, si aplica.
- VAE, si aplica.
- Estado activo/inactivo.

Funciones requeridas:

- Crear registro de mano de obra.
- Editar costo por hora.
- Buscar por cargo o tipo de trabajo.
- Desactivar registros antiguos.

---

## 10.3. Módulo de equipos y herramientas

El sistema debe permitir registrar equipos, herramientas y maquinaria utilizados en los rubros.

Campos iniciales requeridos:

- Código interno.
- Descripción.
- Costo de alquiler o compra.
- Tarifa por hora o por día.
- Tiempo de uso.
- Mantenimiento requerido, opcional.
- CPC, si aplica.
- VAE, si aplica.
- Estado activo/inactivo.

Funciones requeridas:

- Crear equipo o herramienta.
- Editar tarifa.
- Buscar equipo.
- Clasificar por tipo.
- Desactivar equipo.

---

## 10.4. Módulo de rubros

El sistema debe permitir crear, editar, consultar y reutilizar rubros.

Campos iniciales requeridos:

- Código del rubro.
- Descripción.
- Unidad.
- Categoría o capítulo.
- Rendimiento.
- Porcentaje de costos indirectos.
- Precio unitario calculado.
- Estado: borrador, validado, archivado.

Funciones requeridas:

- Crear rubro nuevo.
- Editar rubro existente.
- Duplicar rubro.
- Buscar rubro por código o descripción.
- Asociar materiales al rubro.
- Asociar mano de obra al rubro.
- Asociar equipos al rubro.
- Calcular precio unitario.
- Marcar rubro como validado por el experto.

---

## 10.5. Módulo de análisis de precios unitarios

El sistema debe calcular el precio unitario de cada rubro a partir de sus componentes.

Componentes del APU:

1. Equipos.
2. Mano de obra.
3. Materiales.
4. Transporte, si aplica.
5. Costos directos.
6. Costos indirectos.
7. Precio unitario final.

Funciones requeridas:

- Agregar componentes al APU.
- Editar cantidades.
- Editar rendimiento.
- Calcular subtotales.
- Calcular costo directo.
- Aplicar porcentaje de costos indirectos.
- Calcular precio unitario.
- Guardar versión del APU.
- Exportar APU individual.

---

## 10.6. Módulo de presupuestos

El sistema debe permitir crear presupuestos de obra usando rubros existentes.

Campos iniciales del presupuesto:

- Nombre del proyecto.
- Cliente.
- Ubicación.
- Fecha.
- Responsable.
- Observaciones.
- Estado del presupuesto.

Campos de cada ítem del presupuesto:

- Ítem.
- Código del rubro.
- Descripción del rubro.
- Unidad.
- Cantidad.
- Precio unitario.
- Precio total.

Funciones requeridas:

- Crear presupuesto.
- Agregar rubros al presupuesto.
- Ingresar cantidades.
- Calcular precio total por rubro.
- Calcular total general.
- Editar cantidades.
- Duplicar presupuesto.
- Exportar presupuesto.

---

## 10.7. Módulo de exportación

El sistema debe permitir exportar información en formatos utilizables profesionalmente.

Exportaciones requeridas:

- Presupuesto final en Excel.
- Presupuesto final en PDF.
- APU individual en Excel o PDF.
- Base de datos de rubros, opcional.

La exportación debe mantener un formato claro, profesional y apto para presentación a clientes o revisión técnica.

---

## 11. Reglas iniciales de cálculo

### 11.1. Costo de materiales

```text
costo_material = cantidad × costo_unitario
```

### 11.2. Costo de mano de obra

```text
costo_mano_obra = cantidad × costo_hora × rendimiento
```

### 11.3. Costo de equipos

```text
costo_equipo = cantidad × tarifa × tiempo_uso
```

### 11.4. Costo directo

```text
costo_directo = subtotal_materiales + subtotal_mano_obra + subtotal_equipos + subtotal_transporte
```

### 11.5. Costo indirecto

```text
costo_indirecto = costo_directo × porcentaje_indirectos
```

### 11.6. Precio unitario

```text
precio_unitario = costo_directo + costo_indirecto
```

### 11.7. Total por rubro en presupuesto

```text
total_rubro = cantidad_obra × precio_unitario
```

### 11.8. Total del presupuesto

```text
total_presupuesto = suma(total_rubro)
```

Estas fórmulas deberán ser revisadas y validadas por Franklin antes de implementarse como definitivas.

---

## 12. Reglas iniciales de validación

El sistema deberá evitar errores básicos como:

1. Crear materiales sin descripción.
2. Crear materiales sin unidad.
3. Crear materiales con costo negativo.
4. Crear mano de obra sin costo hora.
5. Crear equipos sin tarifa.
6. Crear rubros sin unidad.
7. Crear rubros sin rendimiento.
8. Crear rubros sin componentes.
9. Calcular APU con valores vacíos.
10. Generar presupuestos con cantidades negativas.
11. Exportar presupuestos sin rubros.

---

## 13. Criterios de aceptación del MVP

El MVP se considerará aceptado cuando cumpla lo siguiente:

1. Permite cargar materiales, mano de obra y equipos.
2. Permite crear rubros con componentes asociados.
3. Calcula correctamente el precio unitario de al menos 10 rubros reales.
4. Permite crear un presupuesto con varios rubros.
5. Calcula correctamente el total del presupuesto.
6. Exporta el presupuesto a Excel.
7. Exporta el presupuesto a PDF básico.
8. Los resultados coinciden con el Excel base o las diferencias están justificadas técnicamente.
9. Franklin valida la lógica técnica del sistema.
10. La interfaz puede ser usada por un ingeniero civil sin conocimientos técnicos de programación.

---

## 14. Requerimientos no funcionales

## 14.1. Usabilidad

La aplicación debe ser simple, clara y amigable para ingenieros civiles.

Debe evitar pantallas sobrecargadas y permitir encontrar rápidamente:

- Rubros.
- Materiales.
- Equipos.
- Mano de obra.
- Presupuestos.

## 14.2. Escalabilidad

El sistema debe estar diseñado para crecer hacia:

- Más usuarios.
- Más proyectos.
- Más rubros.
- Más empresas.
- Funcionalidades futuras con IA.

## 14.3. Mantenibilidad

El código debe ser claro, modular y documentado.

Debe permitir que herramientas como Codex o ChatGPT puedan ayudar en el desarrollo sin romper la arquitectura.

## 14.4. Seguridad

El sistema debe manejar autenticación básica de usuarios.

Cada usuario debe acceder únicamente a sus propios proyectos, salvo que se implemente un modelo multiempresa en fases futuras.

## 14.5. Trazabilidad

En fases posteriores, el sistema debería registrar:

- Quién creó un rubro.
- Quién modificó precios.
- Cuándo se actualizó un presupuesto.
- Qué versión del precio unitario se usó.

---

## 15. Stack tecnológico propuesto

Para el MVP se propone:

- Frontend: Next.js + React + TypeScript.
- Estilos: Tailwind CSS.
- Backend: API interna de Next.js.
- Base de datos: PostgreSQL.
- ORM: Prisma.
- Exportación Excel: ExcelJS.
- Exportación PDF: generación desde HTML o librería PDF.
- Control de versiones: Git + GitHub.

---

## 16. Uso de inteligencia artificial en el proyecto

En la primera etapa, la inteligencia artificial no será parte del producto final, sino una herramienta de apoyo para construirlo.

Se usará IA para:

- Generar documentación técnica.
- Crear prompts para Codex.
- Diseñar arquitectura.
- Generar código base.
- Revisar errores.
- Crear pruebas.
- Explicar decisiones técnicas.
- Convertir requerimientos del experto en funcionalidades.

En fases futuras, se evaluará integrar IA dentro del producto para:

- Sugerir rubros.
- Revisar inconsistencias técnicas.
- Analizar presupuestos.
- Ayudar a construir APUs.
- Comparar presupuestos.

---

## 17. Riesgos iniciales del proyecto

1. Copiar errores del Excel original en lugar de corregirlos.
2. No documentar bien las fórmulas.
3. Crear una interfaz bonita pero técnicamente débil.
4. Intentar incorporar IA demasiado pronto.
5. No validar los resultados con casos reales.
6. Sobrecargar el MVP con demasiadas funciones.
7. No separar correctamente materiales, mano de obra, equipos y rubros.
8. No manejar versiones de precios.

---

## 18. Estrategia de desarrollo recomendada

El desarrollo debe avanzar en ciclos cortos:

1. Documentar requerimiento.
2. Diseñar modelo de datos.
3. Implementar funcionalidad mínima.
4. Probar con Franklin.
5. Comparar contra Excel.
6. Corregir.
7. Repetir.

Cada módulo debe validarse antes de avanzar al siguiente.

---

## 19. Primera lista de tareas

1. Crear carpeta del proyecto `civil-apu-ecuador`.
2. Crear carpeta `00_documentacion`.
3. Guardar este archivo como `requerimientos_iniciales.md`.
4. Crear archivo `reglas_calculo_apu.md`.
5. Crear archivo `modelo_datos.md`.
6. Crear archivo `validacion_franklin.md`.
7. Limpiar datos principales del Excel.
8. Seleccionar 10 rubros reales para pruebas.
9. Confirmar fórmulas con Franklin.
10. Preparar prompt maestro para Codex.

---

## 20. Decisión clave inicial

La prioridad del proyecto será:

> Construir primero un motor confiable de cálculo de APUs y presupuestos, validado técnicamente por Franklin, antes de incorporar funcionalidades avanzadas o inteligencia artificial dentro del producto.

La IA será utilizada inicialmente como asistente de desarrollo, documentación y diseño técnico.

---

## 21. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

