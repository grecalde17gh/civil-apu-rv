CREATE TYPE "BudgetIpcoComponentType" AS ENUM ('MATERIAL', 'LABOR', 'EQUIPMENT', 'TRANSPORT');

CREATE TABLE "BudgetIpcoOverride" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "componentType" "BudgetIpcoComponentType" NOT NULL,
    "componentId" TEXT NOT NULL,
    "originalDenominationId" TEXT,
    "overrideDenominationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetIpcoOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BudgetIpcoOverride_budgetId_componentType_componentId_key" ON "BudgetIpcoOverride"("budgetId", "componentType", "componentId");
CREATE INDEX "BudgetIpcoOverride_budgetId_idx" ON "BudgetIpcoOverride"("budgetId");
CREATE INDEX "BudgetIpcoOverride_componentType_componentId_idx" ON "BudgetIpcoOverride"("componentType", "componentId");
CREATE INDEX "BudgetIpcoOverride_originalDenominationId_idx" ON "BudgetIpcoOverride"("originalDenominationId");
CREATE INDEX "BudgetIpcoOverride_overrideDenominationId_idx" ON "BudgetIpcoOverride"("overrideDenominationId");

ALTER TABLE "BudgetIpcoOverride" ADD CONSTRAINT "BudgetIpcoOverride_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetIpcoOverride" ADD CONSTRAINT "BudgetIpcoOverride_originalDenominationId_fkey" FOREIGN KEY ("originalDenominationId") REFERENCES "IpcoDenomination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BudgetIpcoOverride" ADD CONSTRAINT "BudgetIpcoOverride_overrideDenominationId_fkey" FOREIGN KEY ("overrideDenominationId") REFERENCES "IpcoDenomination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
