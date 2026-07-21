/**
 * BT4 Studio - Prisma Client (Prisma 6 compatible)
 *
 * Safe singleton pattern that:
 * - Only initializes when DATABASE_URL is present
 * - Never crashes the build (graceful fallback to mock data in lib/data.ts)
 * - Works on Vercel / serverless
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL
    ? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    : null)

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

export default prisma
