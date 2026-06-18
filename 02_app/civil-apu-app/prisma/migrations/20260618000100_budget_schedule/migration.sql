-- CreateTable
CREATE TABLE "BudgetSchedule" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "weekCount" INTEGER NOT NULL DEFAULT 8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetScheduleEntry" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "budgetItemId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL DEFAULT 'Grupo 1',
    "startWeek" INTEGER,
    "endWeek" INTEGER,
    "totalAmountSnapshot" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "weeklyAmountSnapshot" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetScheduleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BudgetSchedule_budgetId_key" ON "BudgetSchedule"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetSchedule_budgetId_idx" ON "BudgetSchedule"("budgetId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetScheduleEntry_scheduleId_budgetItemId_key" ON "BudgetScheduleEntry"("scheduleId", "budgetItemId");

-- CreateIndex
CREATE INDEX "BudgetScheduleEntry_scheduleId_idx" ON "BudgetScheduleEntry"("scheduleId");

-- CreateIndex
CREATE INDEX "BudgetScheduleEntry_budgetItemId_idx" ON "BudgetScheduleEntry"("budgetItemId");

-- AddForeignKey
ALTER TABLE "BudgetSchedule" ADD CONSTRAINT "BudgetSchedule_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetScheduleEntry" ADD CONSTRAINT "BudgetScheduleEntry_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "BudgetSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetScheduleEntry" ADD CONSTRAINT "BudgetScheduleEntry_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "BudgetItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
