// lib/prisma.ts
// Completely build-safe Prisma client.
// Never throws during `next build`.
// Falls back to null when Prisma can't be initialized.

let prismaClient: any = null;

if (typeof window === 'undefined' && process.env.DATABASE_URL) {
  try {
    // Dynamic require so it doesn't break static type checking / build
    // when @prisma/client hasn't been generated yet.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    prismaClient = new PrismaClient();
  } catch (e) {
    // Prisma client not available (common during build or preview)
    prismaClient = null;
  }
}

export const prisma = prismaClient;
export default prisma;
