-- Sprint 10: Public API key per agency
ALTER TABLE "Agency" ADD COLUMN "apiKeyHash" TEXT;
CREATE UNIQUE INDEX "Agency_apiKeyHash_key" ON "Agency"("apiKeyHash");
