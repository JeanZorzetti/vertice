/**
 * Seed script — creates the initial agency and admin user.
 * Run with: npm run db:seed
 *
 * Requires SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in the environment —
 * no default credentials are shipped in this script.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD são obrigatórias para rodar o seed (sem credenciais default)."
    );
  }

  // ── Agency ──────────────────────────────────────────────────────────────────
  const agency = await prisma.agency.upsert({
    where: { slug: "roi-labs" },
    create: {
      name: "ROI Labs",
      slug: "roi-labs",
      primaryColor: "#135bec",
    },
    update: {},
  });

  console.log(`✅ Agency: ${agency.name} (${agency.id})`);

  // ── Admin user ───────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const adminUser = await prisma.agencyUser.upsert({
    where: { agencyId_email: { agencyId: agency.id, email: ADMIN_EMAIL } },
    create: {
      agencyId: agency.id,
      email: ADMIN_EMAIL,
      name: "Admin ROI Labs",
      role: "admin",
      password: hashedPassword,
    },
    update: { password: hashedPassword },
  });

  console.log(`✅ Admin: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
