/**
 * Seed script — creates the initial agency and admin user.
 * Run with: npm run db:seed
 *
 * Default credentials (change immediately after first login):
 *   Email:  admin@roi-labs.com
 *   Senha:  vertice2025
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
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
  const hashedPassword = await bcrypt.hash("vertice2025", 12);

  const adminUser = await prisma.agencyUser.upsert({
    where: { agencyId_email: { agencyId: agency.id, email: "admin@roi-labs.com" } },
    create: {
      agencyId: agency.id,
      email: "admin@roi-labs.com",
      name: "Admin ROI Labs",
      role: "admin",
      password: hashedPassword,
    },
    update: {},
  });

  console.log(`✅ Admin: ${adminUser.email}`);
  console.log(`\n🔑 Credenciais de acesso:`);
  console.log(`   URL:   /admin/login`);
  console.log(`   Email: admin@roi-labs.com`);
  console.log(`   Senha: vertice2025`);
  console.log(`\n⚠️  Altere a senha após o primeiro login!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
