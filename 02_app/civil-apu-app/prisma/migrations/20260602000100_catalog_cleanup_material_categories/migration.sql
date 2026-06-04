-- Create controlled material categories before replacing the previous free-text field.
CREATE TABLE "MaterialCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MaterialCategory_name_key" ON "MaterialCategory"("name");
CREATE INDEX "MaterialCategory_name_idx" ON "MaterialCategory"("name");

INSERT INTO "MaterialCategory" ("id", "name", "updatedAt")
VALUES ('matcat-default', 'Sin categoria', CURRENT_TIMESTAMP);

INSERT INTO "MaterialCategory" ("id", "name", "updatedAt")
SELECT 'matcat-' || md5(trimmed_category), trimmed_category, CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT NULLIF(BTRIM("category"), '') AS trimmed_category
    FROM "Material"
) source_categories
WHERE trimmed_category IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "Material" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Material" ADD COLUMN "secondaryCategoryId" TEXT;

UPDATE "Material"
SET "categoryId" = category_lookup."id"
FROM "MaterialCategory" category_lookup
WHERE category_lookup."name" = COALESCE(NULLIF(BTRIM("Material"."category"), ''), 'Sin categoria');

ALTER TABLE "Material" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "Material" DROP COLUMN "stockQuantity";
ALTER TABLE "Material" DROP COLUMN "category";
ALTER TABLE "Material" DROP COLUMN "source";

ALTER TABLE "LaborItem" DROP COLUMN "competencies";
ALTER TABLE "LaborItem" DROP COLUMN "availability";

CREATE INDEX "Material_categoryId_idx" ON "Material"("categoryId");
CREATE INDEX "Material_secondaryCategoryId_idx" ON "Material"("secondaryCategoryId");

ALTER TABLE "Material" ADD CONSTRAINT "Material_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MaterialCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Material" ADD CONSTRAINT "Material_secondaryCategoryId_fkey" FOREIGN KEY ("secondaryCategoryId") REFERENCES "MaterialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
