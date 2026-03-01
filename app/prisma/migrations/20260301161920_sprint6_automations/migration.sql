-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "webhookUrl" TEXT,
ADD COLUMN     "whatsappPhone" TEXT;

-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "driveFolderId" TEXT,
ADD COLUMN     "lastChasedAt" TIMESTAMP(3);
