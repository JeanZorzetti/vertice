-- Sprint 9: Digital contract signature fields
ALTER TABLE "Agency" ADD COLUMN "contractTemplate" TEXT;
ALTER TABLE "Onboarding"
  ADD COLUMN "contractSignedAt" TIMESTAMP(3),
  ADD COLUMN "contractSignerName" TEXT,
  ADD COLUMN "contractSignerIp" TEXT;
