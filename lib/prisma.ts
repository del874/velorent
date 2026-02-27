import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

// Detect database type from DATABASE_URL
const isPostgreSQL = process.env.DATABASE_URL?.startsWith('postgresql://');
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && isPostgreSQL) {
  // Production with PostgreSQL (Vercel + Supabase)
  prisma = new PrismaClient();
} else if (isProduction && !isPostgreSQL) {
  // Production with SQLite (not recommended)
  prisma = new PrismaClient();
} else {
  // Development: Reuse PrismaClient instance
  if (!globalForPrisma.prisma) {
    if (isPostgreSQL) {
      // Development with PostgreSQL (for testing)
      prisma = new PrismaClient();
    } else {
      // Development with SQLite (default)
      // Dynamically import adapter only for development
      const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
      const adapter = new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL || 'file:./dev.db',
      });
      prisma = new PrismaClient({ adapter });
    }

    globalForPrisma.prisma = prisma;
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
