/**
 * SQLite to PostgreSQL Data Migration Script
 *
 * This script exports data from SQLite database for import to PostgreSQL (Supabase)
 * Usage: npx tsx scripts/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const SQLITE_DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');

async function exportFromSQLite() {
  console.log('📦 Exporting data from SQLite...');

  const adapter = new PrismaBetterSqlite3({ url: `file:${SQLITE_DB_PATH}` });
  const prisma = new PrismaClient({ adapter });

  try {
    // Check if database exists
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      console.log('❌ SQLite database not found. Run `npx prisma db push` first.');
      return;
    }

    // Export all data
    const bikes = await prisma.bike.findMany();
    const users = await prisma.user.findMany();
    const bookings = await prisma.booking.findMany();

    const exportData = {
      bikes,
      users,
      bookings,
      exportedAt: new Date().toISOString(),
    };

    // Write to file
    const outputPath = path.join(process.cwd(), 'data-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`✅ Exported data to ${outputPath}`);
    console.log(`   - Bikes: ${bikes.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate SQL INSERT statements from exported data
 * Run this in Supabase SQL Editor
 */
async function generateSQLImport() {
  console.log('📝 Generating SQL import script...');

  try {
    const dataPath = path.join(process.cwd(), 'data-export.json');

    if (!fs.existsSync(dataPath)) {
      console.log('❌ Export file not found. Run export first.');
      return;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    let sql = '-- VeloRent Data Import Script\n';
    sql += '-- Run this in Supabase SQL Editor\n\n';

    // Insert bikes
    if (data.bikes.length > 0) {
      sql += '-- Insert Bikes\n';
      for (const bike of data.bikes) {
        sql += `INSERT INTO "Bike" ("id", "name", "nameEn", "type", "brand", "price", "priceUnit", "image", "description", "features", "specifications", "available", "createdAt", "updatedAt")\n`;
        sql += `VALUES ('${bike.id}', '${bike.name.replace(/'/g, "''")}', '${bike.nameEn.replace(/'/g, "''")}', '${bike.type}', '${bike.brand}', ${bike.price}, '${bike.priceUnit}', '${bike.image}', '${bike.description.replace(/'/g, "''")}', '${bike.features.replace(/'/g, "''")}', '${bike.specifications.replace(/'/g, "''")}', ${bike.available}, '${bike.createdAt}', '${bike.updatedAt}');\n\n`;
      }
    }

    // Insert users
    if (data.users.length > 0) {
      sql += '-- Insert Users\n';
      for (const user of data.users) {
        sql += `INSERT INTO "User" ("id", "email", "name", "phone", "password", "role", "createdAt", "updatedAt")\n`;
        sql += `VALUES ('${user.id}', '${user.email}', ${user.name ? `'${user.name.replace(/'/g, "''")}'` : 'NULL'}, ${user.phone ? `'${user.phone}'` : 'NULL'}, ${user.password ? `'${user.password}'` : 'NULL'}, '${user.role}', '${user.createdAt}', '${user.updatedAt}');\n\n`;
      }
    }

    // Insert bookings
    if (data.bookings.length > 0) {
      sql += '-- Insert Bookings\n';
      for (const booking of data.bookings) {
        sql += `INSERT INTO "Booking" ("id", "userId", "bikeId", "startDate", "endDate", "pickupLocation", "returnLocation", "customerName", "customerEmail", "customerPhone", "totalPrice", "status", "notes", "createdAt", "updatedAt")\n`;
        sql += `VALUES ('${booking.id}', ${booking.userId ? `'${booking.userId}'` : 'NULL'}, '${booking.bikeId}', '${booking.startDate}', '${booking.endDate}', '${booking.pickupLocation.replace(/'/g, "''")}', ${booking.returnLocation ? `'${booking.returnLocation.replace(/'/g, "''")}'` : 'NULL'}, '${booking.customerName.replace(/'/g, "''")}', '${booking.customerEmail}', '${booking.customerPhone}', ${booking.totalPrice}, '${booking.status}', ${booking.notes ? `'${booking.notes.replace(/'/g, "''")}'` : 'NULL'}, '${booking.createdAt}', '${booking.updatedAt}');\n\n`;
      }
    }

    const outputPath = path.join(process.cwd(), 'data-import.sql');
    fs.writeFileSync(outputPath, sql);

    console.log(`✅ Generated SQL import script: ${outputPath}`);
    console.log('   Copy and paste this into Supabase SQL Editor');
  } catch (error) {
    console.error('❌ Generation failed:', error);
  }
}

// CLI interface
const command = process.argv[2];

if (command === 'export') {
  exportFromSQLite();
} else if (command === 'sql') {
  generateSQLImport();
} else {
  console.log(`
Usage: npx tsx scripts/migrate-data.ts [command]

Commands:
  export  - Export data from SQLite to JSON file
  sql     - Generate SQL import script from exported data

Example:
  1. npx tsx scripts/migrate-data.ts export
  2. npx tsx scripts/migrate-data.ts sql
  3. Copy data-import.sql to Supabase SQL Editor and run
  `);
}
