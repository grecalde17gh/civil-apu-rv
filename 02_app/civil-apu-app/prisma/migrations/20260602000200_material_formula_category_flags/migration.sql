ALTER TABLE "Material" ADD COLUMN "usesCategory1" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Material" ADD COLUMN "usesCategory2" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Material" DROP CONSTRAINT IF EXISTS "Material_categoryId_fkey";
ALTER TABLE "Material" DROP CONSTRAINT IF EXISTS "Material_secondaryCategoryId_fkey";

DROP INDEX IF EXISTS "Material_categoryId_idx";
DROP INDEX IF EXISTS "Material_secondaryCategoryId_idx";

ALTER TABLE "Material" DROP COLUMN "categoryId";
ALTER TABLE "Material" DROP COLUMN "secondaryCategoryId";

CREATE INDEX "Material_usesCategory1_idx" ON "Material"("usesCategory1");
CREATE INDEX "Material_usesCategory2_idx" ON "Material"("usesCategory2");
