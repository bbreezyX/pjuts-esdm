import { PrismaClient, Role, UnitStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Get passwords from environment variables for security
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const SEED_STAFF_PASSWORD = process.env.SEED_STAFF_PASSWORD;

async function main() {
  // Validate required environment variables
  if (!SEED_ADMIN_PASSWORD || !SEED_STAFF_PASSWORD) {
    console.error("❌ Error: Required environment variables are missing!");
    console.error("   Please set SEED_ADMIN_PASSWORD and SEED_STAFF_PASSWORD in your .env file");
    console.error("   Example:");
    console.error('   SEED_ADMIN_PASSWORD="your-secure-admin-password"');
    console.error('   SEED_STAFF_PASSWORD="your-secure-staff-password"');
    process.exit(1);
  }

  console.log("🌱 Starting database seed...");

  // Create Admin User
  const adminPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@esdm.go.id" },
    update: {
      password: adminPassword,
    },
    create: {
      email: "admin@esdm.go.id",
      name: "Administrator ESDM",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create Field Staff Users
  const staffPassword = await bcrypt.hash(SEED_STAFF_PASSWORD, 12);
  const staffUsers = [
    { email: "petugas1@esdm.go.id", name: "Budi Santoso" },
    { email: "petugas2@esdm.go.id", name: "Siti Rahayu" },
    { email: "petugas3@esdm.go.id", name: "Ahmad Wijaya" },
  ];

  for (const staff of staffUsers) {
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        password: staffPassword,
      },
      create: {
        email: staff.email,
        name: staff.name,
        password: staffPassword,
        role: Role.FIELD_STAFF,
      },
    });
    console.log("✅ Created field staff:", user.email);
  }

  // Create Sample PJUTS Units across Indonesia
  const pjutsUnits = [
    {
      serialNumber: "PJUTS-JKT-001",
      latitude: -6.2088,
      longitude: 106.8456,
      province: "DKI Jakarta",
      regency: "Jakarta Pusat",
      district: "Menteng",
      address: "Jl. Menteng Raya No. 1",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-JKT-002",
      latitude: -6.1751,
      longitude: 106.865,
      province: "DKI Jakarta",
      regency: "Jakarta Utara",
      district: "Kelapa Gading",
      address: "Jl. Boulevard Raya",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-BDG-001",
      latitude: -6.9175,
      longitude: 107.6191,
      province: "Jawa Barat",
      regency: "Kota Bandung",
      district: "Coblong",
      address: "Jl. Dago No. 50",
      lastStatus: UnitStatus.MAINTENANCE_NEEDED,
    },
    {
      serialNumber: "PJUTS-SBY-001",
      latitude: -7.2575,
      longitude: 112.7521,
      province: "Jawa Timur",
      regency: "Kota Surabaya",
      district: "Gubeng",
      address: "Jl. Pemuda No. 100",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-SBY-002",
      latitude: -7.2896,
      longitude: 112.7374,
      province: "Jawa Timur",
      regency: "Kota Surabaya",
      district: "Wonokromo",
      address: "Jl. Darmo No. 25",
      lastStatus: UnitStatus.OFFLINE,
    },
    {
      serialNumber: "PJUTS-YOG-001",
      latitude: -7.7956,
      longitude: 110.3695,
      province: "DI Yogyakarta",
      regency: "Kota Yogyakarta",
      district: "Gondokusuman",
      address: "Jl. Malioboro No. 1",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-SMG-001",
      latitude: -6.9903,
      longitude: 110.4229,
      province: "Jawa Tengah",
      regency: "Kota Semarang",
      district: "Semarang Tengah",
      address: "Jl. Pandanaran No. 10",
      lastStatus: UnitStatus.UNVERIFIED,
    },
    {
      serialNumber: "PJUTS-MDN-001",
      latitude: 3.5952,
      longitude: 98.6722,
      province: "Sumatera Utara",
      regency: "Kota Medan",
      district: "Medan Kota",
      address: "Jl. Pemuda No. 5",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-MKS-001",
      latitude: -5.1477,
      longitude: 119.4327,
      province: "Sulawesi Selatan",
      regency: "Kota Makassar",
      district: "Ujung Pandang",
      address: "Jl. Somba Opu No. 15",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-DPS-001",
      latitude: -8.6705,
      longitude: 115.2126,
      province: "Bali",
      regency: "Kota Denpasar",
      district: "Denpasar Selatan",
      address: "Jl. Bypass Ngurah Rai",
      lastStatus: UnitStatus.MAINTENANCE_NEEDED,
    },
  ];

  for (const unit of pjutsUnits) {
    const pjuts = await prisma.pjutsUnit.upsert({
      where: { serialNumber: unit.serialNumber },
      update: {},
      create: {
        ...unit,
        installDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      },
    });
    console.log("✅ Created PJUTS unit:", pjuts.serialNumber);
  }

  console.log("\n🎉 Database seed completed!");
  console.log("\n📋 Users created:");
  console.log("   Admin: admin@esdm.go.id");
  console.log("   Staff: petugas1@esdm.go.id, petugas2@esdm.go.id, petugas3@esdm.go.id");
  console.log("\n⚠️  Passwords are set from environment variables (SEED_ADMIN_PASSWORD, SEED_STAFF_PASSWORD)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

