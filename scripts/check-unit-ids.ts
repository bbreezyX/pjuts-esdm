/**
 * Script untuk debug ID units di database
 * Jalankan dengan: npx tsx scripts/check-unit-ids.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUnitIds() {
  try {
    console.log('🔍 Checking unit IDs in database...\n');

    const units = await prisma.pjutsUnit.findMany({
      select: {
        id: true,
        serialNumber: true,
        province: true,
        regency: true,
      },
      take: 10, // Hanya ambil 10 unit pertama untuk sample
    });

    if (units.length === 0) {
      console.log('❌ No units found in database\n');
      return;
    }

    console.log(`✅ Found ${units.length} units (showing first 10):\n`);

    units.forEach((unit, index) => {
      const idLength = unit.id.length;
      const startsWithC = unit.id.startsWith('c');
      const matchesCuidPattern = /^c[a-z0-9]{24}$/.test(unit.id);

      console.log(`Unit ${index + 1}:`);
      console.log(`  Serial: ${unit.serialNumber}`);
      console.log(`  ID: ${unit.id}`);
      console.log(`  ID Length: ${idLength} (expected: 25)`);
      console.log(`  Starts with 'c': ${startsWithC ? '✅' : '❌'}`);
      console.log(`  Matches CUID pattern: ${matchesCuidPattern ? '✅' : '❌'}`);
      
      if (!matchesCuidPattern) {
        console.log(`  ⚠️  WARNING: This ID does NOT match CUID format!`);
        
        // Check if it's a UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unit.id);
        if (isUuid) {
          console.log(`  ℹ️  This appears to be a UUID format`);
        }
      }
      
      console.log('');
    });

    // Check total count
    const totalCount = await prisma.pjutsUnit.count();
    console.log(`\n📊 Total units in database: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error checking unit IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUnitIds();
