CREATE TABLE "IpcoDenomination" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpcoDenomination_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Material" ADD COLUMN "denominationId" TEXT;
ALTER TABLE "LaborItem" ADD COLUMN "denominationId" TEXT;
ALTER TABLE "EquipmentItem" ADD COLUMN "denominationId" TEXT;

CREATE UNIQUE INDEX "IpcoDenomination_code_key" ON "IpcoDenomination"("code");
CREATE UNIQUE INDEX "IpcoDenomination_name_key" ON "IpcoDenomination"("name");
CREATE INDEX "IpcoDenomination_name_idx" ON "IpcoDenomination"("name");
CREATE INDEX "IpcoDenomination_code_idx" ON "IpcoDenomination"("code");
CREATE INDEX "Material_denominationId_idx" ON "Material"("denominationId");
CREATE INDEX "LaborItem_denominationId_idx" ON "LaborItem"("denominationId");
CREATE INDEX "EquipmentItem_denominationId_idx" ON "EquipmentItem"("denominationId");

ALTER TABLE "Material" ADD CONSTRAINT "Material_denominationId_fkey" FOREIGN KEY ("denominationId") REFERENCES "IpcoDenomination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LaborItem" ADD CONSTRAINT "LaborItem_denominationId_fkey" FOREIGN KEY ("denominationId") REFERENCES "IpcoDenomination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EquipmentItem" ADD CONSTRAINT "EquipmentItem_denominationId_fkey" FOREIGN KEY ("denominationId") REFERENCES "IpcoDenomination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
