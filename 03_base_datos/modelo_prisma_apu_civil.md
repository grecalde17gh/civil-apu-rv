# Modelo Prisma — Sistema de Presupuestos y Análisis de Precios Unitarios

## 1. ¿Qué es Prisma?

Prisma es un ORM, es decir, una herramienta que permite conectar una aplicación con una base de datos usando código más ordenado y seguro.

ORM significa:

```text
Object Relational Mapping
```

En términos simples:

> Prisma permite representar las tablas de la base de datos como modelos dentro del código.

En lugar de escribir consultas SQL manualmente para todo, Prisma permite trabajar con objetos.

Ejemplo conceptual:

```text
Base de datos: tabla materials
Código: prisma.material.findMany()
```

Esto hace que el desarrollo sea más claro, especialmente cuando se trabaja con TypeScript, Next.js y herramientas como Codex.

---

## 2. ¿Para qué sirve Prisma en este proyecto?

En este proyecto, Prisma servirá para:

1. Definir las tablas principales del sistema.
2. Crear relaciones entre materiales, mano de obra, equipos, rubros y presupuestos.
3. Generar migraciones de base de datos.
4. Consultar datos desde la aplicación.
5. Crear, editar, eliminar o desactivar registros.
6. Reducir errores al trabajar con la base de datos.
7. Facilitar el uso de TypeScript.
8. Ayudar a Codex a generar código más consistente.

Prisma será el puente entre:

```text
Aplicación Next.js  ↔  Base de datos PostgreSQL
```

---

## 3. ¿Cómo funciona Prisma?

Prisma trabaja principalmente con un archivo llamado:

```text
schema.prisma
```

En ese archivo se define:

- Qué base de datos se usará.
- Qué modelos existirán.
- Qué campos tendrá cada modelo.
- Qué relaciones existirán entre modelos.
- Qué enumeraciones o estados se usarán.

Luego Prisma usa ese archivo para crear o actualizar la base de datos.

---

## 4. Ejemplo simple

Modelo Prisma:

```prisma
model Material {
  id          String   @id @default(uuid())
  description String
  unit        String
  unitCost    Decimal
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Esto representa una tabla de materiales con:

- ID.
- Descripción.
- Unidad.
- Costo unitario.
- Estado activo/inactivo.
- Fecha de creación.
- Fecha de actualización.

Luego en el código se podría consultar así:

```ts
const materials = await prisma.material.findMany();
```

---

## 5. Decisiones generales para este proyecto

## 5.1. Base de datos

Se usará:

```text
PostgreSQL
```

## 5.2. Identificadores

Se usarán UUID como claves primarias.

Ejemplo:

```prisma
id String @id @default(uuid())
```

## 5.3. Valores monetarios

Se usará `Decimal` para valores monetarios.

No se usará `Float` para dinero, porque puede generar errores de precisión.

Ejemplo:

```prisma
unitCost Decimal @db.Decimal(12, 4)
```

## 5.4. Fechas

Se usarán campos estándar:

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

## 5.5. Eliminación lógica

Para catálogos principales se usará:

```prisma
isActive Boolean @default(true)
```

Esto permite desactivar registros sin borrarlos físicamente.

---

## 6. Enums sugeridos

## 6.1. UserRole

```prisma
enum UserRole {
  ADMIN
  TECHNICAL_VALIDATOR
  ENGINEER_USER
  VIEWER
}
```

## 6.2. RubroStatus

```prisma
enum RubroStatus {
  DRAFT
  VALIDATED
  ARCHIVED
}
```

## 6.3. CalculationStatus

```prisma
enum CalculationStatus {
  PENDING
  CALCULATED
  WITH_OBSERVATIONS
  ERROR
}
```

## 6.4. ProjectStatus

```prisma
enum ProjectStatus {
  ACTIVE
  PAUSED
  CLOSED
  ARCHIVED
}
```

## 6.5. BudgetStatus

```prisma
enum BudgetStatus {
  DRAFT
  REVIEWED
  ISSUED
  ARCHIVED
}
```

## 6.6. PerformanceMode

```prisma
enum PerformanceMode {
  HOURS_PER_UNIT
  UNITS_PER_HOUR
  UNITS_PER_DAY
  MANUAL_TIME
}
```

## 6.7. RateType

```prisma
enum RateType {
  HOURLY
  DAILY
  FIXED
}
```

## 6.8. RoundingMode

```prisma
enum RoundingMode {
  STANDARD
  FLOOR
  CEIL
  NONE
}
```

## 6.9. ImportType

```prisma
enum ImportType {
  MATERIALS
  LABOR
  EQUIPMENT
  RUBROS
  FULL_EXCEL_BASE
}
```

## 6.10. ImportStatus

```prisma
enum ImportStatus {
  PENDING
  PROCESSING
  COMPLETED
  COMPLETED_WITH_ERRORS
  FAILED
}
```

---

## 7. Configuración inicial de Prisma

Archivo:

```text
prisma/schema.prisma
```

Configuración sugerida:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 8. Modelo User

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(ENGINEER_USER)
  isActive     Boolean  @default(true)

  createdRubros   Rubro[]   @relation("CreatedRubros")
  validatedRubros Rubro[]   @relation("ValidatedRubros")
  createdProjects Project[] @relation("CreatedProjects")
  createdBudgets  Budget[]  @relation("CreatedBudgets")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 8.1. Comentario

Este modelo permitirá manejar usuarios básicos y roles.

Para el MVP, un usuario administrador puede ser creado manualmente mediante seed.

---

## 9. Modelo Organization

```prisma
model Organization {
  id        String  @id @default(uuid())
  name      String
  ruc       String?
  address   String?
  phone     String?
  email     String?
  isActive  Boolean @default(true)

  projects Project[]
  settings CalculationSetting[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 9.1. Comentario

Este modelo puede dejarse preparado desde el inicio, aunque el MVP funcione con una sola organización.

---

## 10. Modelo Material

```prisma
model Material {
  id            String   @id @default(uuid())
  code          String?
  description   String
  unit          String
  unitCost      Decimal  @db.Decimal(12, 4)
  stockQuantity Decimal? @db.Decimal(12, 4)
  cpc           String?
  vae           Decimal? @db.Decimal(8, 4)
  category      String?
  source        String?
  priceDate     DateTime?
  isActive      Boolean  @default(true)

  rubroMaterials RubroMaterial[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([description])
  @@index([code])
}
```

## 10.1. Comentario

Los materiales podrán usarse en múltiples rubros.

El campo `unitCost` representa el costo actual. Cuando se use en un rubro, se guardará una copia como snapshot.

---

## 11. Modelo LaborItem

```prisma
model LaborItem {
  id            String   @id @default(uuid())
  code          String?
  roleName      String
  hourlyCost    Decimal  @db.Decimal(12, 4)
  dailyCost     Decimal? @db.Decimal(12, 4)
  competencies  String?
  availability  String?
  cpc           String?
  vae           Decimal? @db.Decimal(8, 4)
  category      String?
  priceDate     DateTime?
  isActive      Boolean  @default(true)

  rubroLabor RubroLabor[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([roleName])
  @@index([code])
}
```

## 11.1. Comentario

Este modelo representa cargos o tipos de mano de obra.

Ejemplo:

- Peón.
- Albañil.
- Maestro mayor.
- Electricista.

---

## 12. Modelo EquipmentItem

```prisma
model EquipmentItem {
  id                  String   @id @default(uuid())
  code                String?
  description         String
  equipmentType       String?
  hourlyRate          Decimal? @db.Decimal(12, 4)
  dailyRate           Decimal? @db.Decimal(12, 4)
  purchaseCost        Decimal? @db.Decimal(12, 4)
  maintenanceRequired Boolean  @default(false)
  maintenanceNotes    String?
  cpc                 String?
  vae                 Decimal? @db.Decimal(8, 4)
  priceDate           DateTime?
  isActive            Boolean  @default(true)

  rubroEquipment RubroEquipment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([description])
  @@index([code])
}
```

## 12.1. Comentario

Este modelo representa herramientas, equipos y maquinaria.

Debe permitir tarifa horaria, diaria o costo referencial.

---

## 13. Modelo Rubro

```prisma
model Rubro {
  id                  String            @id @default(uuid())
  code                String            @unique
  description         String
  unit                String
  category            String?
  performanceValue    Decimal?          @db.Decimal(12, 4)
  performanceUnit     String?
  indirectPercentage  Decimal           @db.Decimal(8, 4)
  directCost          Decimal?          @db.Decimal(12, 4)
  indirectCost        Decimal?          @db.Decimal(12, 4)
  unitPrice           Decimal?          @db.Decimal(12, 4)
  status              RubroStatus       @default(DRAFT)
  calculationStatus   CalculationStatus @default(PENDING)
  notes               String?
  sourceExcelSheet    String?

  createdById   String?
  createdBy     User?   @relation("CreatedRubros", fields: [createdById], references: [id])

  validatedById String?
  validatedBy   User?   @relation("ValidatedRubros", fields: [validatedById], references: [id])
  validatedAt   DateTime?

  materials RubroMaterial[]
  labor     RubroLabor[]
  equipment RubroEquipment[]
  transport RubroTransport[]
  budgetItems BudgetItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
  @@index([description])
  @@index([status])
}
```

## 13.1. Comentario

Este es el modelo central para los rubros.

Un rubro tiene componentes asociados y un precio unitario calculado.

---

## 14. Modelo RubroMaterial

```prisma
model RubroMaterial {
  id               String  @id @default(uuid())
  rubroId          String
  materialId       String
  quantity         Decimal @db.Decimal(12, 4)
  unit             String?
  unitCostSnapshot Decimal @db.Decimal(12, 4)
  totalCost        Decimal @db.Decimal(12, 4)
  notes            String?

  rubro    Rubro    @relation(fields: [rubroId], references: [id], onDelete: Cascade)
  material Material @relation(fields: [materialId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([rubroId])
  @@index([materialId])
}
```

## 14.1. Fórmula

```text
totalCost = quantity × unitCostSnapshot
```

---

## 15. Modelo RubroLabor

```prisma
model RubroLabor {
  id                 String          @id @default(uuid())
  rubroId            String
  laborItemId        String
  workerQuantity     Decimal         @db.Decimal(12, 4)
  hourlyCostSnapshot Decimal         @db.Decimal(12, 4)
  timeRequired       Decimal?        @db.Decimal(12, 4)
  performanceValue   Decimal?        @db.Decimal(12, 4)
  performanceMode    PerformanceMode @default(MANUAL_TIME)
  totalCost          Decimal         @db.Decimal(12, 4)
  notes              String?

  rubro     Rubro     @relation(fields: [rubroId], references: [id], onDelete: Cascade)
  laborItem LaborItem @relation(fields: [laborItemId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([rubroId])
  @@index([laborItemId])
}
```

## 15.1. Fórmula asumida inicial

```text
totalCost = workerQuantity × hourlyCostSnapshot × timeRequired
```

Pendiente de validación con Franklin.

---

## 16. Modelo RubroEquipment

```prisma
model RubroEquipment {
  id                String          @id @default(uuid())
  rubroId           String
  equipmentItemId   String
  equipmentQuantity Decimal         @db.Decimal(12, 4)
  rateType          RateType        @default(HOURLY)
  rateSnapshot      Decimal         @db.Decimal(12, 4)
  timeRequired      Decimal?        @db.Decimal(12, 4)
  performanceValue  Decimal?        @db.Decimal(12, 4)
  performanceMode   PerformanceMode @default(MANUAL_TIME)
  totalCost         Decimal         @db.Decimal(12, 4)
  notes             String?

  rubro         Rubro         @relation(fields: [rubroId], references: [id], onDelete: Cascade)
  equipmentItem EquipmentItem @relation(fields: [equipmentItemId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([rubroId])
  @@index([equipmentItemId])
}
```

## 16.1. Fórmula asumida inicial

```text
totalCost = equipmentQuantity × rateSnapshot × timeRequired
```

Pendiente de validación con Franklin.

---

## 17. Modelo RubroTransport

```prisma
model RubroTransport {
  id          String  @id @default(uuid())
  rubroId     String
  description String
  unit        String?
  quantity    Decimal @db.Decimal(12, 4)
  unitCost    Decimal @db.Decimal(12, 4)
  totalCost   Decimal @db.Decimal(12, 4)
  notes       String?

  rubro Rubro @relation(fields: [rubroId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([rubroId])
}
```

## 17.1. Fórmula

```text
totalCost = quantity × unitCost
```

---

## 18. Modelo Project

```prisma
model Project {
  id                         String        @id @default(uuid())
  organizationId             String?
  name                       String
  clientName                 String?
  location                   String?
  province                   String?
  city                       String?
  startDate                  DateTime?
  endDate                    DateTime?
  defaultIndirectPercentage  Decimal?      @db.Decimal(8, 4)
  defaultIvaPercentage       Decimal?      @db.Decimal(8, 4)
  status                     ProjectStatus @default(ACTIVE)
  notes                      String?

  organization Organization? @relation(fields: [organizationId], references: [id])

  createdById String?
  createdBy   User? @relation("CreatedProjects", fields: [createdById], references: [id])

  budgets Budget[]
  settings CalculationSetting[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
  @@index([status])
}
```

---

## 19. Modelo Budget

```prisma
model Budget {
  id                   String       @id @default(uuid())
  projectId            String
  code                 String?
  name                 String
  clientNameSnapshot   String?
  locationSnapshot     String?
  status               BudgetStatus @default(DRAFT)
  subtotal             Decimal?     @db.Decimal(12, 4)
  ivaPercentage        Decimal?     @db.Decimal(8, 4)
  ivaAmount            Decimal?     @db.Decimal(12, 4)
  total                Decimal?     @db.Decimal(12, 4)
  issuedAt             DateTime?
  notes                String?

  project Project @relation(fields: [projectId], references: [id])

  createdById String?
  createdBy   User? @relation("CreatedBudgets", fields: [createdById], references: [id])

  items BudgetItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([projectId])
  @@index([status])
}
```

---

## 20. Modelo BudgetItem

```prisma
model BudgetItem {
  id                  String  @id @default(uuid())
  budgetId            String
  rubroId             String
  itemNumber          String
  rubroCodeSnapshot   String
  descriptionSnapshot String
  unitSnapshot        String
  quantity            Decimal @db.Decimal(12, 4)
  unitPriceSnapshot   Decimal @db.Decimal(12, 4)
  totalPrice          Decimal @db.Decimal(12, 4)
  notes               String?

  budget Budget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  rubro  Rubro  @relation(fields: [rubroId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([budgetId])
  @@index([rubroId])
}
```

## 20.1. Fórmula

```text
totalPrice = quantity × unitPriceSnapshot
```

---

## 21. Modelo CalculationSetting

```prisma
model CalculationSetting {
  id                              String          @id @default(uuid())
  organizationId                  String?
  projectId                       String?
  defaultIndirectPercentage       Decimal         @default(15.00) @db.Decimal(8, 4)
  defaultIvaPercentage            Decimal?        @default(15.00) @db.Decimal(8, 4)
  decimalPlaces                   Int             @default(2)
  roundingMode                    RoundingMode    @default(STANDARD)
  hoursPerDay                     Decimal         @default(8.00) @db.Decimal(8, 4)
  defaultLaborPerformanceMode     PerformanceMode @default(MANUAL_TIME)
  defaultEquipmentPerformanceMode PerformanceMode @default(MANUAL_TIME)
  vaeAffectsCalculation           Boolean         @default(false)
  cpcRequired                     Boolean         @default(false)

  organization Organization? @relation(fields: [organizationId], references: [id])
  project      Project?      @relation(fields: [projectId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 21.1. Comentario

Este modelo permite que ciertas reglas puedan cambiar sin reprogramar todo el sistema.

Especialmente:

- Porcentaje de indirectos.
- IVA.
- Decimales.
- Horas por jornada.
- Interpretación de rendimiento.
- Uso de VAE y CPC.

---

## 22. Modelo ChangeLog

```prisma
model ChangeLog {
  id         String   @id @default(uuid())
  entityType String
  entityId   String
  action     String
  oldValue   Json?
  newValue   Json?
  changedBy  String?
  notes      String?
  changedAt  DateTime @default(now())

  @@index([entityType])
  @@index([entityId])
  @@index([action])
}
```

## 22.1. Comentario

Este modelo sirve para trazabilidad.

Puede implementarse en una segunda fase si se quiere simplificar el MVP.

---

## 23. Modelo ImportLog

```prisma
model ImportLog {
  id             String       @id @default(uuid())
  fileName       String
  importType     ImportType
  status         ImportStatus @default(PENDING)
  totalRows      Int?
  successfulRows Int?
  failedRows     Int?
  errorReport    Json?
  importedBy     String?
  importedAt     DateTime     @default(now())
}
```

## 23.1. Comentario

Este modelo servirá para registrar cargas desde Excel.

En el MVP puede usarse cuando se creen los scripts de importación.

---

## 24. Relaciones principales del modelo Prisma

```text
User 1 ─── N Rubro como creador
User 1 ─── N Rubro como validador
User 1 ─── N Project como creador
User 1 ─── N Budget como creador

Organization 1 ─── N Project
Organization 1 ─── N CalculationSetting

Project 1 ─── N Budget
Project 1 ─── N CalculationSetting

Budget 1 ─── N BudgetItem
Rubro 1 ─── N BudgetItem

Rubro 1 ─── N RubroMaterial
Rubro 1 ─── N RubroLabor
Rubro 1 ─── N RubroEquipment
Rubro 1 ─── N RubroTransport

Material 1 ─── N RubroMaterial
LaborItem 1 ─── N RubroLabor
EquipmentItem 1 ─── N RubroEquipment
```

---

## 25. Modelo mínimo recomendado para MVP

Aunque este documento incluye modelos completos, para iniciar el MVP se recomienda priorizar:

1. User.
2. Material.
3. LaborItem.
4. EquipmentItem.
5. Rubro.
6. RubroMaterial.
7. RubroLabor.
8. RubroEquipment.
9. RubroTransport.
10. Project.
11. Budget.
12. BudgetItem.
13. CalculationSetting.

Modelos que pueden esperar:

1. Organization.
2. ChangeLog.
3. ImportLog.

Sin embargo, si se quiere preparar el producto desde el inicio para crecer, se pueden incluir todos desde la primera migración.

---

## 26. Reglas importantes para Codex

Cuando se le pida a Codex implementar Prisma, debe respetar estas reglas:

1. No usar Float para valores monetarios.
2. Usar Decimal para costos, tarifas, cantidades y porcentajes.
3. Usar UUID como identificador principal.
4. Mantener snapshots en rubros y presupuestos.
5. No eliminar físicamente materiales, mano de obra o equipos usados.
6. No mezclar modelos de base de datos con lógica de interfaz.
7. Mantener nombres consistentes en inglés dentro del código.
8. Mantener documentación de reglas asumidas.
9. No cambiar fórmulas sin actualizar documentación.
10. No integrar IA en el MVP sin aprobación.

---

## 27. Prompt sugerido para Codex

```text
Actúa como arquitecto senior full stack especializado en Next.js, TypeScript, PostgreSQL y Prisma.

Necesito crear el archivo prisma/schema.prisma para una aplicación de presupuestos y análisis de precios unitarios de ingeniería civil.

Usa PostgreSQL como datasource y Prisma Client JS como generator.

Implementa los siguientes modelos:
- User
- Organization
- Material
- LaborItem
- EquipmentItem
- Rubro
- RubroMaterial
- RubroLabor
- RubroEquipment
- RubroTransport
- Project
- Budget
- BudgetItem
- CalculationSetting
- ChangeLog
- ImportLog

Implementa también los enums:
- UserRole
- RubroStatus
- CalculationStatus
- ProjectStatus
- BudgetStatus
- PerformanceMode
- RateType
- RoundingMode
- ImportType
- ImportStatus

Reglas obligatorias:
- Usar UUID como id principal.
- Usar Decimal para dinero, cantidades y porcentajes.
- Usar DateTime para fechas.
- Usar createdAt y updatedAt donde corresponda.
- Usar isActive para eliminación lógica en catálogos.
- Guardar snapshots de precios en componentes y presupuestos.
- Crear relaciones correctas entre rubros, componentes y presupuestos.
- Agregar índices básicos en campos de búsqueda como code, description, status y relaciones principales.

No implementes lógica de interfaz todavía.
Solo genera el schema.prisma completo, consistente y listo para migración.
```

---

## 28. Comandos Prisma que se usarán luego

Una vez creado el proyecto, se usarán comandos similares a estos:

```bash
npx prisma init
```

Crear migración:

```bash
npx prisma migrate dev --name init
```

Generar cliente Prisma:

```bash
npx prisma generate
```

Abrir visor de base de datos:

```bash
npx prisma studio
```

---

## 29. Advertencia importante

Este modelo Prisma es una primera versión técnica.

Puede y debe ajustarse después de:

1. Validación con Franklin.
2. Pruebas con el Excel base.
3. Revisión de rubros reales.
4. Comparación de cálculos.
5. Definición final de rendimiento, IVA, VAE y CPC.

La prioridad es avanzar con una estructura sólida pero flexible.

---

## 30. Estado del documento

Versión: 0.1  
Estado: Borrador inicial  
Responsable funcional: Gustavo Recalde  
Validador técnico: Franklin Recalde  
Fecha: 2026-05-25

