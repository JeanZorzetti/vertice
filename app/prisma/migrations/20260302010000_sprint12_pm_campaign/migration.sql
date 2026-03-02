-- Sprint 12: Project Management integrations + Campaign Results

ALTER TABLE "Agency"
  ADD COLUMN "pmTool"    TEXT,
  ADD COLUMN "pmApiKey"  TEXT,
  ADD COLUMN "pmApiKey2" TEXT,
  ADD COLUMN "pmListId"  TEXT;

CREATE TABLE "CampaignResult" (
  "id"           TEXT NOT NULL,
  "onboardingId" TEXT NOT NULL,
  "spend"        DOUBLE PRECISION,
  "leads"        INTEGER,
  "revenue"      DOUBLE PRECISION,
  "notes"        TEXT,
  "recordedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CampaignResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CampaignResult_onboardingId_key" ON "CampaignResult"("onboardingId");

ALTER TABLE "CampaignResult"
  ADD CONSTRAINT "CampaignResult_onboardingId_fkey"
  FOREIGN KEY ("onboardingId") REFERENCES "Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
