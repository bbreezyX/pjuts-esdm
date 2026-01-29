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

  // Create Sample PJUTS Units across Jambi Province
  const pjutsUnits = [
    {
      serialNumber: "PJUTS-JMB-001",
      latitude: -1.6101,
      longitude: 103.6131,
      province: "Jambi",
      regency: "Kota Jambi",
      district: "Telanaipura",
      address: "Jl. Arif Rahman Hakim No. 30",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-JMB-002",
      latitude: -1.5850,
      longitude: 103.6200,
      province: "Jambi",
      regency: "Kota Jambi",
      district: "Kota Baru",
      address: "Jl. Sultan Thaha No. 15",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-SPH-001",
      latitude: -2.0565,
      longitude: 101.3907,
      province: "Jambi",
      regency: "Kota Sungai Penuh",
      district: "Sungai Penuh",
      address: "Jl. Yos Sudarso No. 10",
      lastStatus: UnitStatus.MAINTENANCE_NEEDED,
    },
    {
      serialNumber: "PJUTS-BTH-001",
      latitude: -1.7021,
      longitude: 103.2577,
      province: "Jambi",
      regency: "Kabupaten Batanghari",
      district: "Muara Bulian",
      address: "Jl. Jend. Sudirman No. 25",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-BNG-001",
      latitude: -1.5048,
      longitude: 102.1056,
      province: "Jambi",
      regency: "Kabupaten Bungo",
      district: "Muara Bungo",
      address: "Jl. Lintas Sumatera No. 50",
      lastStatus: UnitStatus.OFFLINE,
    },
    {
      serialNumber: "PJUTS-KRC-001",
      latitude: -2.0667,
      longitude: 101.5333,
      province: "Jambi",
      regency: "Kabupaten Kerinci",
      district: "Siulak",
      address: "Jl. Raya Kerinci No. 1",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-MRG-001",
      latitude: -2.0851,
      longitude: 102.2694,
      province: "Jambi",
      regency: "Kabupaten Merangin",
      district: "Bangko",
      address: "Jl. Jend. Ahmad Yani No. 10",
      lastStatus: UnitStatus.UNVERIFIED,
    },
    {
      serialNumber: "PJUTS-MJB-001",
      latitude: -1.5333,
      longitude: 103.8167,
      province: "Jambi",
      regency: "Kabupaten Muaro Jambi",
      district: "Sengeti",
      address: "Jl. Lintas Timur No. 5",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-SRL-001",
      latitude: -2.3167,
      longitude: 102.9000,
      province: "Jambi",
      regency: "Kabupaten Sarolangun",
      district: "Sarolangun",
      address: "Jl. Pahlawan No. 15",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-TJB-001",
      latitude: -1.1000,
      longitude: 103.4333,
      province: "Jambi",
      regency: "Kabupaten Tanjung Jabung Barat",
      district: "Kuala Tungkal",
      address: "Jl. Sudirman No. 20",
      lastStatus: UnitStatus.MAINTENANCE_NEEDED,
    },
    {
      serialNumber: "PJUTS-TJT-001",
      latitude: -0.9833,
      longitude: 104.5000,
      province: "Jambi",
      regency: "Kabupaten Tanjung Jabung Timur",
      district: "Muara Sabak",
      address: "Jl. Raya Sabak No. 8",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-TBO-001",
      latitude: -1.4500,
      longitude: 102.3667,
      province: "Jambi",
      regency: "Kabupaten Tebo",
      district: "Muara Tebo",
      address: "Jl. Sultan Taha No. 12",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    // Additional 10 sample units across Jambi Province
    {
      serialNumber: "PJUTS-JMB-003",
      latitude: -1.6200,
      longitude: 103.5800,
      province: "Jambi",
      regency: "Kota Jambi",
      district: "Jambi Selatan",
      address: "Jl. Patimura No. 45",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-JMB-004",
      latitude: -1.5950,
      longitude: 103.6350,
      province: "Jambi",
      regency: "Kota Jambi",
      district: "Jelutung",
      address: "Jl. Kapten Pattimura No. 88",
      lastStatus: UnitStatus.MAINTENANCE_NEEDED,
    },
    {
      serialNumber: "PJUTS-SPH-002",
      latitude: -2.0750,
      longitude: 101.4100,
      province: "Jambi",
      regency: "Kota Sungai Penuh",
      district: "Pesisir Bukit",
      address: "Jl. Diponegoro No. 22",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-BTH-002",
      latitude: -1.6800,
      longitude: 103.2900,
      province: "Jambi",
      regency: "Kabupaten Batanghari",
      district: "Pemayung",
      address: "Jl. Trans Sumatera KM 35",
      lastStatus: UnitStatus.OFFLINE,
    },
    {
      serialNumber: "PJUTS-BNG-002",
      latitude: -1.4850,
      longitude: 102.1300,
      province: "Jambi",
      regency: "Kabupaten Bungo",
      district: "Rimbo Tengah",
      address: "Jl. Batang Bungo No. 17",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-KRC-002",
      latitude: -2.1000,
      longitude: 101.4800,
      province: "Jambi",
      regency: "Kabupaten Kerinci",
      district: "Air Hangat",
      address: "Jl. Raya Semurup No. 5",
      lastStatus: UnitStatus.UNVERIFIED,
    },
    {
      serialNumber: "PJUTS-MRG-002",
      latitude: -2.1100,
      longitude: 102.3000,
      province: "Jambi",
      regency: "Kabupaten Merangin",
      district: "Bangko Barat",
      address: "Jl. Lintas Barat No. 33",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-MJB-002",
      latitude: -1.5100,
      longitude: 103.7800,
      province: "Jambi",
      regency: "Kabupaten Muaro Jambi",
      district: "Sekernan",
      address: "Jl. Lintas Timur KM 22",
      lastStatus: UnitStatus.MAINTENANCE_NEEDED,
    },
    {
      serialNumber: "PJUTS-TJB-002",
      latitude: -1.0700,
      longitude: 103.4700,
      province: "Jambi",
      regency: "Kabupaten Tanjung Jabung Barat",
      district: "Tungkal Ilir",
      address: "Jl. Pelabuhan No. 9",
      lastStatus: UnitStatus.OPERATIONAL,
    },
    {
      serialNumber: "PJUTS-SRL-002",
      latitude: -2.2900,
      longitude: 102.8500,
      province: "Jambi",
      regency: "Kabupaten Sarolangun",
      district: "Batang Asai",
      address: "Jl. Desa Lubuk Bedorong No. 3",
      lastStatus: UnitStatus.OPERATIONAL,
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

