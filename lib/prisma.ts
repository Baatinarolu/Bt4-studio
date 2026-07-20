/**
 * BT4 Studio - Safe Prisma Client
 *
 * CRITICAL: This file must never cause a build failure.
 * 
 * Strategy:
 * - Only attempt to load Prisma when DATABASE_URL is present
 * - Use require() + try/catch
 * - Use `any` for global to avoid index signature errors
 * - Return null on any failure path
 */

let prismaClient: any = null;

if (typeof window === 'undefined' && process.env.DATABASE_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');

    const globalAny = global as any;

    if (!globalAny.__bt4_prisma) {
      globalAny.__bt4_prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    }

    prismaClient = globalAny.__bt4_prisma;
  } catch {
    prismaClient = null;
  }
}

export const prisma = prismaClient;
export default prisma;
