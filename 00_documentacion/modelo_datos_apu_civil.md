# Modelo de Datos — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. Propósito del documento

Este documento define el modelo de datos inicial para la aplicación de presupuestos y análisis de precios unitarios de ingeniería civil.

El objetivo es establecer las entidades principales, sus campos, relaciones y reglas generales para construir posteriormente la base de datos en PostgreSQL utilizando Prisma como ORM.

Este modelo se basa en:

- El archivo Excel técnico inicial.
- Los requerimientos funcionales del sistema.
- Buenas prácticas para sistemas de presupuestos.
- Reglas asumidas documentadas y modificables luego de la validación de Franklin.

---

## 2. Principios de diseño del modelo

El modelo de datos deberá cumplir los siguientes principios:

1. Separar claramente insumos, rubros, APUs, proyectos y presupuestos.
2. Evitar duplicidad innecesaria de información.
3. Permitir actualización de precios sin romper presupuestos anteriores.
4. Guardar snapshots de precios usados en presupuestos emitidos.
5. Permitir trazabilidad básica de creación y actualización.
6. Soportar estados como borrador, validado, emitido y archivado.
7. Permitir futura integración con módulos de IA.
8. Mantener campos técnicos como CPC y VAE, aunque inicialmente sean informativos.
9. Permitir que reglas asumidas sean modificables posteriormente.

---

## 3. Entidades principales

El sistema tendrá las siguientes entidades principales:

1. Usuarios.
2. Empresas u organizaciones, opcional en MVP.
3. Materiales.
4. Mano de obra.
5. Equipos y herramientas.
6. Rubros.
7. Componentes de rubros.
8. Proyectos.
9. Presupuestos.
10. Ítems de presupuesto.
11. Configuración de cálculo.
12. Historial de cambios.

---

## 4. Tabla: users

## 4.1. Descripción

Representa a los usuarios que acceden al sistema.

En el MVP puede usarse un modelo simple de autenticación. En fases futuras podrá ampliarse a roles, empresas y permisos avanzados.

## 4.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único del usuario. |
| name | String | Sí | Nombre del usuario. |
| email | String | Sí | Correo electrónico. |
| password_hash | String | Sí | Contraseña cifrada. |
| role | Enum | Sí | Rol del usuario. |
| is_active | Boolean | Sí | Define si el usuario está activo. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de última actualización. |

## 4.3. Roles iniciales

```text
admin
technical_validator
engineer_user
viewer
```

## 4.4. Reglas

1. Un usuario administrador puede gestionar catálogos generales.
2. Un usuario validador técnico puede marcar rubros como validados.
3. Un usuario ingeniero puede crear proyectos, presupuestos y rubros en borrador.
4. Un usuario visor solo puede consultar información.

---

## 5. Tabla: organizations

## 5.1. Descripción

Representa empresas, estudios técnicos, constructoras u organizaciones que usan el sistema.

Para el MVP puede quedar opcional. Sin embargo, se recomienda incluirla desde el diseño para facilitar escalabilidad comercial.

## 5.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| name | String | Sí | Nombre de la empresa u organización. |
| ruc | String | No | RUC de la empresa. |
| address | String | No | Dirección. |
| phone | String | No | Teléfono. |
| email | String | No | Correo de contacto. |
| is_active | Boolean | Sí | Estado activo/inactivo. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 5.3. Relación

Una organización puede tener muchos usuarios, proyectos y presupuestos.

---

## 6. Tabla: materials

## 6.1. Descripción

Representa los materiales utilizados en los análisis de precios unitarios.

Ejemplos:

- Cemento.
- Arena.
- Ripio.
- Pintura.
- Acero de refuerzo.
- Tubería PVC.

## 6.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| code | String | No | Código interno del material. |
| description | String | Sí | Descripción del material. |
| unit | String | Sí | Unidad de medida. |
| unit_cost | Decimal | Sí | Costo unitario actual. |
| stock_quantity | Decimal | No | Cantidad disponible, si se maneja inventario. |
| cpc | String | No | Código CPC, si aplica. |
| vae | Decimal | No | Valor Agregado Ecuatoriano, si aplica. |
| category | String | No | Categoría del material. |
| source | String | No | Fuente del precio. |
| price_date | DateTime | No | Fecha de actualización del precio. |
| is_active | Boolean | Sí | Estado activo/inactivo. |
| created_by | UUID | No | Usuario que creó el registro. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 6.3. Reglas

1. No se permiten costos unitarios negativos.
2. La descripción y la unidad son obligatorias.
3. El material no debe eliminarse físicamente si ya fue usado en rubros o presupuestos.
4. Para dejar de usar un material, se cambia `is_active` a `false`.
5. La actualización del costo unitario no modifica automáticamente presupuestos emitidos.

---

## 7. Tabla: labor_items

## 7.1. Descripción

Representa los tipos de mano de obra utilizados en los APUs.

Ejemplos:

- Peón.
- Albañil.
- Maestro mayor.
- Electricista.
- Plomero.
- Ingeniero residente.

## 7.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| code | String | No | Código interno. |
| role_name | String | Sí | Cargo o tipo de trabajo. |
| hourly_cost | Decimal | Sí | Costo por hora. |
| daily_cost | Decimal | No | Costo por jornada, si aplica. |
| competencies | Text | No | Competencias o descripción del perfil. |
| availability | String | No | Disponibilidad referencial. |
| cpc | String | No | Código CPC, si aplica. |
| vae | Decimal | No | VAE, si aplica. |
| category | String | No | Categoría de mano de obra. |
| price_date | DateTime | No | Fecha de actualización del costo. |
| is_active | Boolean | Sí | Estado activo/inactivo. |
| created_by | UUID | No | Usuario creador. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 7.3. Reglas

1. El costo por hora no puede ser negativo.
2. El cargo es obligatorio.
3. Si se usa costo por jornada, debe documentarse la cantidad de horas por jornada.
4. La actualización del costo no modifica automáticamente presupuestos emitidos.

---

## 8. Tabla: equipment_items

## 8.1. Descripción

Representa equipos, herramientas y maquinaria utilizados en los rubros.

Ejemplos:

- Amoladora.
- Concretera.
- Bomba de agua.
- Excavadora.
- Andamios.
- Equipo topográfico.

## 8.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| code | String | No | Código interno. |
| description | String | Sí | Descripción del equipo. |
| equipment_type | String | No | Herramienta, equipo menor, maquinaria, transporte, etc. |
| hourly_rate | Decimal | No | Tarifa por hora. |
| daily_rate | Decimal | No | Tarifa por día. |
| purchase_cost | Decimal | No | Costo de compra referencial. |
| maintenance_required | Boolean | No | Indica si requiere mantenimiento. |
| maintenance_notes | Text | No | Detalle de mantenimiento. |
| cpc | String | No | Código CPC, si aplica. |
| vae | Decimal | No | VAE, si aplica. |
| price_date | DateTime | No | Fecha de actualización de tarifa. |
| is_active | Boolean | Sí | Estado activo/inactivo. |
| created_by | UUID | No | Usuario creador. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 8.3. Reglas

1. La descripción es obligatoria.
2. Al menos una tarifa o costo referencial debe existir para usar el equipo en un rubro.
3. No se permiten tarifas negativas.
4. La actualización de tarifas no modifica automáticamente presupuestos emitidos.

---

## 9. Tabla: rubros

## 9.1. Descripción

Representa un rubro de construcción reutilizable.

Un rubro puede contener materiales, mano de obra, equipos y transporte.

Ejemplos:

- Enlucido vertical.
- Pintura exterior.
- Hormigón simple.
- Acero de refuerzo.
- Retiro de pintura.

## 9.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| code | String | Sí | Código del rubro. |
| description | String | Sí | Descripción del rubro. |
| unit | String | Sí | Unidad de medida. |
| category | String | No | Capítulo o categoría. |
| performance_value | Decimal | No | Rendimiento del rubro. |
| performance_unit | String | No | Unidad del rendimiento. |
| indirect_percentage | Decimal | Sí | Porcentaje de costos indirectos. |
| direct_cost | Decimal | No | Costo directo calculado. |
| indirect_cost | Decimal | No | Costo indirecto calculado. |
| unit_price | Decimal | No | Precio unitario calculado. |
| status | Enum | Sí | Estado del rubro. |
| calculation_status | Enum | Sí | Estado del cálculo. |
| validated_by | UUID | No | Usuario que validó técnicamente. |
| validated_at | DateTime | No | Fecha de validación. |
| notes | Text | No | Observaciones técnicas. |
| source_excel_sheet | String | No | Hoja de Excel original, si aplica. |
| created_by | UUID | No | Usuario creador. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 9.3. Estados de rubro

```text
borrador
validado
archivado
```

## 9.4. Estados de cálculo

```text
pendiente
calculado
con_observaciones
error
```

## 9.5. Reglas

1. Un rubro debe tener código, descripción y unidad.
2. Un rubro puede existir como borrador sin componentes completos.
3. Un rubro validado no debe modificarse sin registrar cambio.
4. Un rubro archivado no debe usarse en nuevos presupuestos, salvo autorización.
5. El precio unitario debe recalcularse cuando cambien sus componentes.

---

## 10. Tabla: rubro_materials

## 10.1. Descripción

Relaciona materiales con rubros.

Cada registro representa un material usado dentro de un APU.

## 10.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| rubro_id | UUID | Sí | Rubro asociado. |
| material_id | UUID | Sí | Material asociado. |
| quantity | Decimal | Sí | Cantidad requerida del material. |
| unit | String | No | Unidad usada en el APU. |
| unit_cost_snapshot | Decimal | Sí | Costo unitario usado en el cálculo. |
| total_cost | Decimal | Sí | Costo total calculado. |
| notes | Text | No | Observaciones. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 10.3. Fórmula

```text
total_cost = quantity × unit_cost_snapshot
```

## 10.4. Reglas

1. La cantidad no puede ser negativa.
2. El costo unitario snapshot debe guardarse para trazabilidad.
3. Si cambia el precio del material, el usuario decidirá si actualiza el APU.

---

## 11. Tabla: rubro_labor

## 11.1. Descripción

Relaciona mano de obra con rubros.

Cada registro representa un tipo de trabajador o cuadrilla utilizado dentro de un APU.

## 11.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| rubro_id | UUID | Sí | Rubro asociado. |
| labor_item_id | UUID | Sí | Mano de obra asociada. |
| worker_quantity | Decimal | Sí | Cantidad de trabajadores. |
| hourly_cost_snapshot | Decimal | Sí | Costo hora usado en el cálculo. |
| time_required | Decimal | No | Tiempo requerido. |
| performance_value | Decimal | No | Rendimiento aplicado. |
| performance_mode | Enum | Sí | Forma de interpretación del rendimiento. |
| total_cost | Decimal | Sí | Costo total calculado. |
| notes | Text | No | Observaciones. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 11.3. Modos de rendimiento asumidos

```text
hours_per_unit
units_per_hour
units_per_day
manual_time
```

## 11.4. Fórmula asumida inicial

Para el MVP se asumirá inicialmente:

```text
total_cost = worker_quantity × hourly_cost_snapshot × time_required
```

Si el rendimiento se expresa como unidades por hora:

```text
time_required = 1 / performance_value
```

Esta regla queda pendiente de validación técnica por Franklin.

## 11.5. Reglas

1. No se permiten cantidades negativas.
2. El costo por hora no puede ser negativo.
3. El rendimiento debe ser mayor a cero cuando se use para calcular tiempo.
4. El modo de rendimiento debe quedar registrado explícitamente.
5. La fórmula definitiva queda pendiente de validación técnica.

---

## 12. Tabla: rubro_equipment

## 12.1. Descripción

Relaciona equipos y herramientas con rubros.

Cada registro representa un equipo utilizado dentro de un APU.

## 12.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| rubro_id | UUID | Sí | Rubro asociado. |
| equipment_item_id | UUID | Sí | Equipo asociado. |
| equipment_quantity | Decimal | Sí | Cantidad de equipos. |
| rate_type | Enum | Sí | Tipo de tarifa usada. |
| rate_snapshot | Decimal | Sí | Tarifa usada en el cálculo. |
| time_required | Decimal | No | Tiempo requerido. |
| performance_value | Decimal | No | Rendimiento aplicado. |
| performance_mode | Enum | Sí | Forma de interpretación del rendimiento. |
| total_cost | Decimal | Sí | Costo total calculado. |
| notes | Text | No | Observaciones. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 12.3. Tipos de tarifa

```text
hourly
daily
fixed
```

## 12.4. Fórmula asumida inicial

```text
total_cost = equipment_quantity × rate_snapshot × time_required
```

Si el equipo usa tarifa diaria, se deberá convertir el tiempo requerido según configuración del sistema.

Ejemplo:

```text
horas_por_jornada = 8
costo_hora_equivalente = daily_rate / horas_por_jornada
```

Esta regla queda pendiente de validación técnica por Franklin.

---

## 13. Tabla: rubro_transport

## 13.1. Descripción

Relaciona costos de transporte con rubros cuando aplique.

## 13.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| rubro_id | UUID | Sí | Rubro asociado. |
| description | String | Sí | Descripción del transporte. |
| unit | String | No | Unidad. |
| quantity | Decimal | Sí | Cantidad. |
| unit_cost | Decimal | Sí | Costo unitario. |
| total_cost | Decimal | Sí | Costo total. |
| notes | Text | No | Observaciones. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 13.3. Fórmula

```text
total_cost = quantity × unit_cost
```

## 13.4. Regla asumida

El transporte se manejará como sección independiente dentro del APU.

Esta regla queda pendiente de validación técnica por Franklin.

---

## 14. Tabla: projects

## 14.1. Descripción

Representa una obra, contrato o proyecto para el cual se elaborarán presupuestos.

## 14.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| organization_id | UUID | No | Organización propietaria. |
| name | String | Sí | Nombre del proyecto. |
| client_name | String | No | Cliente. |
| location | String | No | Ubicación. |
| province | String | No | Provincia. |
| city | String | No | Ciudad. |
| start_date | DateTime | No | Fecha de inicio estimada. |
| end_date | DateTime | No | Fecha de fin estimada. |
| default_indirect_percentage | Decimal | No | Porcentaje indirecto por defecto. |
| default_iva_percentage | Decimal | No | IVA por defecto, si aplica. |
| status | Enum | Sí | Estado del proyecto. |
| notes | Text | No | Observaciones. |
| created_by | UUID | No | Usuario creador. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 14.3. Estados de proyecto

```text
activo
pausado
cerrado
archivado
```

---

## 15. Tabla: budgets

## 15.1. Descripción

Representa un presupuesto asociado a un proyecto.

Un proyecto puede tener uno o varios presupuestos.

Ejemplos:

- Presupuesto inicial.
- Presupuesto corregido.
- Presupuesto para cliente.
- Presupuesto alternativo.

## 15.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| project_id | UUID | Sí | Proyecto asociado. |
| code | String | No | Código del presupuesto. |
| name | String | Sí | Nombre del presupuesto. |
| client_name_snapshot | String | No | Cliente usado al emitir. |
| location_snapshot | String | No | Ubicación usada al emitir. |
| status | Enum | Sí | Estado del presupuesto. |
| subtotal | Decimal | No | Subtotal antes de impuestos, si aplica. |
| iva_percentage | Decimal | No | Porcentaje de IVA. |
| iva_amount | Decimal | No | Valor de IVA. |
| total | Decimal | No | Total final. |
| issued_at | DateTime | No | Fecha de emisión. |
| notes | Text | No | Observaciones. |
| created_by | UUID | No | Usuario creador. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 15.3. Estados de presupuesto

```text
borrador
revisado
emitido
archivado
```

## 15.4. Reglas

1. Un presupuesto emitido no debe modificarse sin generar una nueva versión o registrar el cambio.
2. Un presupuesto puede tener varios ítems.
3. El total se calcula sumando los ítems.
4. El IVA se manejará como configurable y pendiente de validación.

---

## 16. Tabla: budget_items

## 16.1. Descripción

Representa los rubros incluidos dentro de un presupuesto.

Cada ítem guarda snapshots para evitar que cambios futuros en rubros alteren presupuestos históricos.

## 16.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| budget_id | UUID | Sí | Presupuesto asociado. |
| rubro_id | UUID | Sí | Rubro original asociado. |
| item_number | String | Sí | Número o código de ítem. |
| rubro_code_snapshot | String | Sí | Código del rubro al momento de usarlo. |
| description_snapshot | String | Sí | Descripción del rubro al momento de usarlo. |
| unit_snapshot | String | Sí | Unidad usada. |
| quantity | Decimal | Sí | Cantidad de obra. |
| unit_price_snapshot | Decimal | Sí | Precio unitario usado. |
| total_price | Decimal | Sí | Precio total calculado. |
| notes | Text | No | Observaciones. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 16.3. Fórmula

```text
total_price = quantity × unit_price_snapshot
```

## 16.4. Reglas

1. La cantidad no puede ser negativa.
2. El precio unitario snapshot no debe cambiar automáticamente.
3. Si el rubro original cambia, el usuario podrá decidir si actualiza el ítem.
4. Un presupuesto emitido no debe recalcularse automáticamente.

---

## 17. Tabla: calculation_settings

## 17.1. Descripción

Guarda configuraciones de cálculo que pueden variar según proyecto, organización o sistema.

## 17.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| organization_id | UUID | No | Organización asociada. |
| project_id | UUID | No | Proyecto asociado. |
| default_indirect_percentage | Decimal | Sí | Porcentaje indirecto por defecto. |
| default_iva_percentage | Decimal | No | IVA por defecto. |
| decimal_places | Int | Sí | Número de decimales. |
| rounding_mode | Enum | Sí | Modo de redondeo. |
| hours_per_day | Decimal | Sí | Horas por jornada. |
| default_labor_performance_mode | Enum | Sí | Interpretación por defecto del rendimiento de mano de obra. |
| default_equipment_performance_mode | Enum | Sí | Interpretación por defecto del rendimiento de equipos. |
| vae_affects_calculation | Boolean | Sí | Define si VAE afecta el cálculo. |
| cpc_required | Boolean | Sí | Define si CPC es obligatorio. |
| created_at | DateTime | Sí | Fecha de creación. |
| updated_at | DateTime | Sí | Fecha de actualización. |

## 17.3. Valores iniciales asumidos

```text
default_indirect_percentage = 15%
default_iva_percentage = 15%
decimal_places = 2
rounding_mode = standard
hours_per_day = 8
vae_affects_calculation = false
cpc_required = false
```

Estos valores son asumidos y deben ser validados posteriormente por Franklin.

---

## 18. Tabla: change_logs

## 18.1. Descripción

Registra cambios importantes realizados en el sistema.

Para el MVP puede implementarse de forma simple o dejarse preparada para fases posteriores.

## 18.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| entity_type | String | Sí | Tipo de entidad modificada. |
| entity_id | UUID | Sí | ID de la entidad modificada. |
| action | String | Sí | Acción realizada. |
| old_value | JSON | No | Valor anterior. |
| new_value | JSON | No | Valor nuevo. |
| changed_by | UUID | No | Usuario que realizó el cambio. |
| changed_at | DateTime | Sí | Fecha del cambio. |
| notes | Text | No | Observaciones. |

## 18.3. Acciones sugeridas

```text
created
updated
deleted
archived
validated
issued
recalculated
```

---

## 19. Tabla: imports

## 19.1. Descripción

Registra procesos de importación de datos desde Excel u otras fuentes.

Será útil para cargar la base inicial desde el archivo Excel.

## 19.2. Campos sugeridos

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único. |
| file_name | String | Sí | Nombre del archivo importado. |
| import_type | Enum | Sí | Tipo de importación. |
| status | Enum | Sí | Estado del proceso. |
| total_rows | Int | No | Número total de filas leídas. |
| successful_rows | Int | No | Filas cargadas correctamente. |
| failed_rows | Int | No | Filas con error. |
| error_report | JSON | No | Detalle de errores. |
| imported_by | UUID | No | Usuario que importó. |
| imported_at | DateTime | Sí | Fecha de importación. |

## 19.3. Tipos de importación

```text
materials
labor
equipment
rubros
full_excel_base
```

## 19.4. Estados de importación

```text
pending
processing
completed
completed_with_errors
failed
```

---

## 20. Relaciones principales

## 20.1. Usuarios y organizaciones

```text
organization 1 ─── N users
```

## 20.2. Proyectos y presupuestos

```text
project 1 ─── N budgets
```

## 20.3. Presupuestos e ítems

```text
budget 1 ─── N budget_items
```

## 20.4. Rubros y componentes

```text
rubro 1 ─── N rubro_materials
rubro 1 ─── N rubro_labor
rubro 1 ─── N rubro_equipment
rubro 1 ─── N rubro_transport
```

## 20.5. Componentes y catálogos

```text
material 1 ─── N rubro_materials
labor_item 1 ─── N rubro_labor
equipment_item 1 ─── N rubro_equipment
```

## 20.6. Presupuesto y rubros

```text
rubro 1 ─── N budget_items
```

El presupuesto guarda snapshots, por lo tanto el cambio posterior del rubro no altera automáticamente el presupuesto.

---

## 21. Enumeraciones sugeridas

## 21.1. UserRole

```text
admin
technical_validator
engineer_user
viewer
```

## 21.2. RubroStatus

```text
borrador
validado
archivado
```

## 21.3. CalculationStatus

```text
pendiente
calculado
con_observaciones
error
```

## 21.4. ProjectStatus

```text
activo
pausado
cerrado
archivado
```

## 21.5. BudgetStatus

```text
borrador
revisado
emitido
archivado
```

## 21.6. PerformanceMode

```text
hours_per_unit
units_per_hour
units_per_day
manual_time
```

## 21.7. RateType

```text
hourly
daily
fixed
```

## 21.8. RoundingMode

```text
standard
floor
ceil
none
```

## 21.9. ImportType

```text
materials
labor
equipment
rubros
full_excel_base
```

## 21.10. ImportStatus

```text
pending
processing
completed
completed_with_errors
failed
```

---

## 22. Reglas asumidas del modelo

Las siguientes reglas se asumen para poder avanzar con el desarrollo:

1. El sistema manejará costos indirectos como porcentaje sobre costo directo.
2. El precio unitario será el costo directo más el costo indirecto.
3. El sistema redondeará valores monetarios a 2 decimales.
4. Los presupuestos guardarán snapshots de precios.
5. Los presupuestos emitidos no se recalcularán automáticamente.
6. El VAE será inicialmente informativo y no afectará el cálculo.
7. El CPC será inicialmente informativo y no obligatorio.
8. El transporte se manejará como sección separada.
9. El rendimiento de mano de obra y equipos será configurable.
10. Las tarifas diarias podrán convertirse a tarifa horaria usando horas por jornada.
11. Las horas por jornada se asumirán inicialmente como 8.
12. El porcentaje de IVA se manejará como configurable.

---

## 23. Reglas pendientes de validación técnica

Las siguientes reglas deben ser validadas por Franklin antes de cerrar el motor definitivo:

1. Interpretación exacta del rendimiento.
2. Fórmula definitiva para mano de obra.
3. Fórmula definitiva para equipos.
4. Uso del transporte como sección independiente o integrada.
5. Uso real del VAE en reportes o cálculos.
6. Uso real del CPC.
7. Porcentaje de costos indirectos por defecto.
8. Aplicación de IVA.
9. Regla de redondeo final.
10. Formato oficial de exportación APU.
11. Formato oficial de presupuesto.
12. Si se requiere manejo de capítulos o subcapítulos en presupuestos.

---

## 24. Modelo mínimo para el MVP

Para no sobrecargar la primera versión, el MVP puede iniciar con las siguientes tablas obligatorias:

1. `users`
2. `materials`
3. `labor_items`
4. `equipment_items`
5. `rubros`
6. `rubro_materials`
7. `rubro_labor`
8. `rubro_equipment`
9. `rubro_transport`
10. `projects`
11. `budgets`
12. `budget_items`
13. `calculation_settings`

Tablas opcionales para fase posterior:

1. `organizations`
2. `change_logs`
3. `imports`

Sin embargo, se recomienda dejar consideradas las tablas opcionales desde el diseño para evitar rediseños grandes.

---

## 25. Ejemplo de flujo de datos

## 25.1. Crear material

1. Usuario registra material.
2. Sistema guarda descripción, unidad y costo unitario.
3. Material queda disponible para rubros.

## 25.2. Crear rubro

1. Usuario crea rubro con código, descripción y unidad.
2. Agrega materiales.
3. Agrega mano de obra.
4. Agrega equipos.
5. Agrega transporte, si aplica.
6. Sistema calcula costos directos.
7. Sistema aplica costos indirectos.
8. Sistema calcula precio unitario.
9. Rubro queda en estado borrador.
10. Franklin o usuario validador lo marca como validado.

## 25.3. Crear presupuesto

1. Usuario crea proyecto.
2. Usuario crea presupuesto.
3. Usuario agrega rubros.
4. Sistema copia snapshots de código, descripción, unidad y precio unitario.
5. Usuario ingresa cantidades.
6. Sistema calcula total por ítem.
7. Sistema calcula total del presupuesto.
8. Usuario exporta a Excel o PDF.

---

## 26. Consideraciones para futura IA

El modelo debe permitir futuras funciones con IA, como:

1. Sugerir rubros a partir de una descripción.
2. Detectar inconsistencias en APUs.
3. Comparar presupuestos.
4. Sugerir materiales o equipos.
5. Revisar rendimientos anómalos.
6. Generar observaciones técnicas.

Para esto, se recomienda que el sistema conserve:

- Descripciones claras.
- Historial de cambios.
- Estados de validación.
- Relación entre rubros y componentes.
- Datos estructurados, no solo texto libre.

---

## 27. Decisión técnica inicial

El modelo será diseñado para PostgreSQL y Prisma.

Las claves primarias se manejarán como UUID.

Los valores monetarios se manejarán con tipo Decimal, no Float, para evitar errores de precisión.

Las fechas se manejarán como DateTime.

Los estados se manejarán como Enum.

Los campos de observaciones, errores o valores flexibles podrán manejarse como Text o JSON según el caso.

---

## 28. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

