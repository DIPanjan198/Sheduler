import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Helper to initialize or verify DB connectivity
export async function initDb() {
  try {
    await prisma.$connect();
    console.log('[DB] Successfully connected to database via Prisma');
  } catch (err) {
    console.warn('[DB] Prisma database connection warning:', err);
  }
}
