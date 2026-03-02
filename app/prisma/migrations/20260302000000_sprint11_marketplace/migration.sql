-- Sprint 11: Marketplace de Templates
ALTER TABLE "OnboardingTemplate"
  ADD COLUMN "isPublic"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "usageCount" INTEGER NOT NULL DEFAULT 0;
