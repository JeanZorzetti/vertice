-- Billing moved from Mercado Pago to Stripe.
-- The MP columns never held a real subscription (the integration was never
-- switched on in production), so they are dropped rather than migrated.

ALTER TABLE "Agency" DROP COLUMN IF EXISTS "mpSubscriptionId";
ALTER TABLE "Agency" DROP COLUMN IF EXISTS "mpSubscriptionStatus";

ALTER TABLE "Agency" ADD COLUMN     "stripeCustomerId" TEXT;
ALTER TABLE "Agency" ADD COLUMN     "stripeSubscriptionId" TEXT;
ALTER TABLE "Agency" ADD COLUMN     "stripeSubscriptionStatus" TEXT;

CREATE UNIQUE INDEX "Agency_stripeCustomerId_key" ON "Agency"("stripeCustomerId");
CREATE UNIQUE INDEX "Agency_stripeSubscriptionId_key" ON "Agency"("stripeSubscriptionId");
