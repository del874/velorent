import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

// Detect database type from DATABASE_URL
const isPostgreSQL = process.env.DATABASE_URL?.startsWith('postgresql://');

if (process.env.NODE_ENV === 'production') {
  const connectionString = process.env.DATABASE_URL || 'file:./dev.db';

  if (isPostgreSQL) {
    // Production: Use PostgreSQL (Supabase)
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    });
  } else {
    // Production: Use SQLite (if DATABASE_URL is not PostgreSQL)
    const adapter = new PrismaBetterSqlite3({ url: connectionString });
    prisma = new PrismaClient({ adapter });
  }
} else {
  // Development: Reuse PrismaClient instance
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL || 'file:./dev.db';

    if (isPostgreSQL) {
      // Development with PostgreSQL (optional, for testing)
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: connectionString,
          },
        },
      });
    } else {
      // Development with SQLite (default)
      const adapter = new PrismaBetterSqlite3({ url: connectionString });
      prisma = new PrismaClient({ adapter });
    }

    globalForPrisma.prisma = prisma;
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
