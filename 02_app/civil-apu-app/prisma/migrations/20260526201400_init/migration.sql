-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TECHNICAL_VALIDATOR', 'ENGINEER_USER', 'VIEWER');

-- CreateEnum
CREATE TYPE "RubroStatus" AS ENUM ('DRAFT', 'VALIDATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CalculationStatus" AS ENUM ('PENDING', 'CALCULATED', 'WITH_OBSERVATIONS', 'ERROR');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'REVIEWED', 'ISSUED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PerformanceMode" AS ENUM ('HOURS_PER_UNIT', 'UNITS_PER_HOUR', 'UNITS_PER_DAY', 'MANUAL_TIME');

-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('HOURLY', 'DAILY', 'FIXED');

-- CreateEnum
CREATE TYPE "RoundingMode" AS ENUM ('STANDARD', 'FLOOR', 'CEIL', 'NONE');

-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('MATERIALS', 'LABOR', 'EQUIPMENT', 'RUBROS', 'FULL_EXCEL_BASE');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ENGINEER_USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ruc" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DECIMAL(12,4) NOT NULL,
    "stockQuantity" DECIMAL(12,4),
    "cpc" TEXT,
    "vae" DECIMAL(8,4),
    "category" TEXT,
    "source" TEXT,
    "priceDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborItem" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "roleName" TEXT NOT NULL,
    "hourlyCost" DECIMAL(12,4) NOT NULL,
    "dailyCost" DECIMAL(12,4),
    "competencies" TEXT,
    "availability" TEXT,
    "cpc" TEXT,
    "vae" DECIMAL(8,4),
    "category" TEXT,
    "priceDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentItem" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "equipmentType" TEXT,
    "hourlyRate" DECIMAL(12,4),
    "dailyRate" DECIMAL(12,4),
    "purchaseCost" DECIMAL(12,4),
    "maintenanceRequired" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceNotes" TEXT,
    "cpc" TEXT,
    "vae" DECIMAL(8,4),
    "priceDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubro" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT,
    "performanceValue" DECIMAL(12,4),
    "performanceUnit" TEXT,
    "indirectPercentage" DECIMAL(8,4) NOT NULL,
    "directCost" DECIMAL(12,4),
    "indirectCost" DECIMAL(12,4),
    "unitPrice" DECIMAL(12,4),
    "status" "RubroStatus" NOT NULL DEFAULT 'DRAFT',
    "calculationStatus" "CalculationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "sourceExcelSheet" TEXT,
    "createdById" TEXT,
    "validatedById" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rubro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubroMaterial" (
    "id" TEXT NOT NULL,
    "rubroId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unit" TEXT,
    "unitCostSnapshot" DECIMAL(12,4) NOT NULL,
    "totalCost" DECIMAL(12,4) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubroMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubroLabor" (
    "id" TEXT NOT NULL,
    "rubroId" TEXT NOT NULL,
    "laborItemId" TEXT NOT NULL,
    "workerQuantity" DECIMAL(12,4) NOT NULL,
    "hourlyCostSnapshot" DECIMAL(12,4) NOT NULL,
    "timeRequired" DECIMAL(12,4),
    "performanceValue" DECIMAL(12,4),
    "performanceMode" "PerformanceMode" NOT NULL DEFAULT 'MANUAL_TIME',
    "totalCost" DECIMAL(12,4) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubroLabor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubroEquipment" (
    "id" TEXT NOT NULL,
    "rubroId" TEXT NOT NULL,
    "equipmentItemId" TEXT NOT NULL,
    "equipmentQuantity" DECIMAL(12,4) NOT NULL,
    "rateType" "RateType" NOT NULL DEFAULT 'HOURLY',
    "rateSnapshot" DECIMAL(12,4) NOT NULL,
    "timeRequired" DECIMAL(12,4),
    "performanceValue" DECIMAL(12,4),
    "performanceMode" "PerformanceMode" NOT NULL DEFAULT 'MANUAL_TIME',
    "totalCost" DECIMAL(12,4) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubroEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubroTransport" (
    "id" TEXT NOT NULL,
    "rubroId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unitCost" DECIMAL(12,4) NOT NULL,
    "totalCost" DECIMAL(12,4) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubroTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "clientName" TEXT,
    "location" TEXT,
    "province" TEXT,
    "city" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "defaultIndirectPercentage" DECIMAL(8,4),
    "defaultIvaPercentage" DECIMAL(8,4),
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "clientNameSnapshot" TEXT,
    "locationSnapshot" TEXT,
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(12,4),
    "ivaPercentage" DECIMAL(8,4),
    "ivaAmount" DECIMAL(12,4),
    "total" DECIMAL(12,4),
    "issuedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "rubroId" TEXT NOT NULL,
    "itemNumber" TEXT NOT NULL,
    "rubroCodeSnapshot" TEXT NOT NULL,
    "descriptionSnapshot" TEXT NOT NULL,
    "unitSnapshot" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unitPriceSnapshot" DECIMAL(12,4) NOT NULL,
    "totalPrice" DECIMAL(12,4) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationSetting" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "projectId" TEXT,
    "defaultIndirectPercentage" DECIMAL(8,4) NOT NULL DEFAULT 15.00,
    "defaultIvaPercentage" DECIMAL(8,4) DEFAULT 15.00,
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "roundingMode" "RoundingMode" NOT NULL DEFAULT 'STANDARD',
    "hoursPerDay" DECIMAL(8,4) NOT NULL DEFAULT 8.00,
    "defaultLaborPerformanceMode" "PerformanceMode" NOT NULL DEFAULT 'MANUAL_TIME',
    "defaultEquipmentPerformanceMode" "PerformanceMode" NOT NULL DEFAULT 'MANUAL_TIME',
    "vaeAffectsCalculation" BOOLEAN NOT NULL DEFAULT false,
    "cpcRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedBy" TEXT,
    "notes" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "importType" "ImportType" NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "totalRows" INTEGER,
    "successfulRows" INTEGER,
    "failedRows" INTEGER,
    "errorReport" JSONB,
    "importedBy" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Material_description_idx" ON "Material"("description");

-- CreateIndex
CREATE INDEX "Material_code_idx" ON "Material"("code");

-- CreateIndex
CREATE INDEX "LaborItem_roleName_idx" ON "LaborItem"("roleName");

-- CreateIndex
CREATE INDEX "LaborItem_code_idx" ON "LaborItem"("code");

-- CreateIndex
CREATE INDEX "EquipmentItem_description_idx" ON "EquipmentItem"("description");

-- CreateIndex
CREATE INDEX "EquipmentItem_code_idx" ON "EquipmentItem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Rubro_code_key" ON "Rubro"("code");

-- CreateIndex
CREATE INDEX "Rubro_code_idx" ON "Rubro"("code");

-- CreateIndex
CREATE INDEX "Rubro_description_idx" ON "Rubro"("description");

-- CreateIndex
CREATE INDEX "Rubro_status_idx" ON "Rubro"("status");

-- CreateIndex
CREATE INDEX "RubroMaterial_rubroId_idx" ON "RubroMaterial"("rubroId");

-- CreateIndex
CREATE INDEX "RubroMaterial_materialId_idx" ON "RubroMaterial"("materialId");

-- CreateIndex
CREATE INDEX "RubroLabor_rubroId_idx" ON "RubroLabor"("rubroId");

-- CreateIndex
CREATE INDEX "RubroLabor_laborItemId_idx" ON "RubroLabor"("laborItemId");

-- CreateIndex
CREATE INDEX "RubroEquipment_rubroId_idx" ON "RubroEquipment"("rubroId");

-- CreateIndex
CREATE INDEX "RubroEquipment_equipmentItemId_idx" ON "RubroEquipment"("equipmentItemId");

-- CreateIndex
CREATE INDEX "RubroTransport_rubroId_idx" ON "RubroTransport"("rubroId");

-- CreateIndex
CREATE INDEX "Project_name_idx" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Budget_projectId_idx" ON "Budget"("projectId");

-- CreateIndex
CREATE INDEX "Budget_status_idx" ON "Budget"("status");

-- CreateIndex
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetItem_rubroId_idx" ON "BudgetItem"("rubroId");

-- CreateIndex
CREATE INDEX "ChangeLog_entityType_idx" ON "ChangeLog"("entityType");

-- CreateIndex
CREATE INDEX "ChangeLog_entityId_idx" ON "ChangeLog"("entityId");

-- CreateIndex
CREATE INDEX "ChangeLog_action_idx" ON "ChangeLog"("action");

-- AddForeignKey
ALTER TABLE "Rubro" ADD CONSTRAINT "Rubro_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rubro" ADD CONSTRAINT "Rubro_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubroMaterial" ADD CONSTRAINT "RubroMaterial_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "Rubro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubroMaterial" ADD CONSTRAINT "RubroMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubroLabor" ADD CONSTRAINT "RubroLabor_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "Rubro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubroLabor" ADD CONSTRAINT "RubroLabor_laborItemId_fkey" FOREIGN KEY ("laborItemId") REFERENCES "LaborItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubroEquipment" ADD CONSTRAINT "RubroEquipment_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "Rubro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubroEquipment" ADD CONSTRAINT "RubroEquipment_equipmentItemId_fkey" FOREIGN KEY ("equipmentItemId") REFERENCES "EquipmentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubroTransport" ADD CONSTRAINT "RubroTransport_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "Rubro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "Rubro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationSetting" ADD CONSTRAINT "CalculationSetting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationSetting" ADD CONSTRAINT "CalculationSetting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
