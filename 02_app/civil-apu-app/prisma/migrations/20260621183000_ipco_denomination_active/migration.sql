ALTER TABLE "IpcoDenomination" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "IpcoDenomination_isActive_idx" ON "IpcoDenomination"("isActive");
