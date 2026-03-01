-- AlterTable
ALTER TABLE "Agency" ADD COLUMN "mpSubscriptionId" TEXT,
ADD COLUMN "mpSubscriptionStatus" TEXT,
ADD COLUMN "onboardedAt" TIMESTAMP(3),
ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'trial',
ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Agency_mpSubscriptionId_key" ON "Agency"("mpSubscriptionId");
