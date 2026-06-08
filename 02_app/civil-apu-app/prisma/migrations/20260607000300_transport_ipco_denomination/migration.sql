ALTER TABLE "RubroTransport" ADD COLUMN "denominationId" TEXT;

CREATE INDEX "RubroTransport_denominationId_idx" ON "RubroTransport"("denominationId");

ALTER TABLE "RubroTransport" ADD CONSTRAINT "RubroTransport_denominationId_fkey" FOREIGN KEY ("denominationId") REFERENCES "IpcoDenomination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
