UPDATE "BudgetItem" AS bi
SET
  "indirectPercentageApplied" = COALESCE(b."indirectPercentage", p."defaultIndirectPercentage", r."indirectPercentage", 0),
  "directCostSnapshot" = COALESCE(r."directCost", 0),
  "indirectCostSnapshot" = ROUND(
    COALESCE(r."directCost", 0) * (COALESCE(b."indirectPercentage", p."defaultIndirectPercentage", r."indirectPercentage", 0) / 100),
    2
  ),
  "unitPriceSnapshot" = ROUND(
    COALESCE(r."directCost", 0) +
      (COALESCE(r."directCost", 0) * (COALESCE(b."indirectPercentage", p."defaultIndirectPercentage", r."indirectPercentage", 0) / 100)),
    2
  ),
  "subtotalSnapshot" = ROUND(
    bi."quantity" *
      (
        COALESCE(r."directCost", 0) +
          (COALESCE(r."directCost", 0) * (COALESCE(b."indirectPercentage", p."defaultIndirectPercentage", r."indirectPercentage", 0) / 100))
      ),
    2
  ),
  "totalPrice" = ROUND(
    bi."quantity" *
      (
        COALESCE(r."directCost", 0) +
          (COALESCE(r."directCost", 0) * (COALESCE(b."indirectPercentage", p."defaultIndirectPercentage", r."indirectPercentage", 0) / 100))
      ),
    2
  )
FROM "Budget" AS b, "Project" AS p, "Rubro" AS r
WHERE b."id" = bi."budgetId"
  AND p."id" = b."projectId"
  AND r."id" = bi."rubroId";
