ALTER TABLE "Material" ADD COLUMN "price1" DECIMAL(12,4);
ALTER TABLE "Material" ADD COLUMN "price2" DECIMAL(12,4);
ALTER TABLE "Material" ADD COLUMN "price3" DECIMAL(12,4);

UPDATE "Material"
SET "price1" = "unitCost"
WHERE "price1" IS NULL;

ALTER TABLE "Material" ALTER COLUMN "price1" SET NOT NULL;

ALTER TABLE "RubroMaterial" ADD COLUMN "priceOption" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Rubro" ADD COLUMN "technicalSpecification" TEXT;

ALTER TABLE "BudgetItem" ADD COLUMN "technicalSpecificationSnapshot" TEXT;
