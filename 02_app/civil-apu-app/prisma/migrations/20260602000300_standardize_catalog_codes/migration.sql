ALTER TABLE "RubroTransport" ADD COLUMN "code" TEXT;

CREATE OR REPLACE FUNCTION normalize_catalog_codes(target_table TEXT, code_prefix TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    $SQL$
      WITH ranked AS (
        SELECT
          "id",
          "code",
          ROW_NUMBER() OVER (PARTITION BY "code" ORDER BY "createdAt", "id") AS duplicate_rank
        FROM %I
      ),
      max_valid AS (
        SELECT COALESCE(MAX(SUBSTRING("code" FROM LENGTH(%L) + 2)::INT), 0) AS max_value
        FROM ranked
        WHERE "code" ~ ('^' || %L || '-[0-9]+$')
          AND duplicate_rank = 1
      ),
      to_fix AS (
        SELECT
          ranked."id",
          ROW_NUMBER() OVER (ORDER BY ranked."id") AS sequence_number
        FROM ranked
        WHERE ranked."code" IS NULL
          OR ranked."code" !~ ('^' || %L || '-[0-9]+$')
          OR ranked.duplicate_rank > 1
      ),
      numbered AS (
        SELECT
          to_fix."id",
          %L || '-' || LPAD((max_valid.max_value + to_fix.sequence_number)::TEXT, 3, '0') AS next_code
        FROM to_fix
        CROSS JOIN max_valid
      )
      UPDATE %I AS target
      SET "code" = numbered.next_code
      FROM numbered
      WHERE target."id" = numbered."id"
    $SQL$,
    target_table,
    code_prefix,
    code_prefix,
    code_prefix,
    code_prefix,
    target_table
  );
END;
$$ LANGUAGE plpgsql;

SELECT normalize_catalog_codes('Material', 'MAT');
SELECT normalize_catalog_codes('LaborItem', 'MO');
SELECT normalize_catalog_codes('EquipmentItem', 'EQ');
SELECT normalize_catalog_codes('RubroTransport', 'TR');

DROP FUNCTION normalize_catalog_codes(TEXT, TEXT);

CREATE UNIQUE INDEX "Material_code_key" ON "Material"("code");
CREATE UNIQUE INDEX "LaborItem_code_key" ON "LaborItem"("code");
CREATE UNIQUE INDEX "EquipmentItem_code_key" ON "EquipmentItem"("code");
CREATE UNIQUE INDEX "RubroTransport_code_key" ON "RubroTransport"("code");
CREATE INDEX "RubroTransport_code_idx" ON "RubroTransport"("code");
