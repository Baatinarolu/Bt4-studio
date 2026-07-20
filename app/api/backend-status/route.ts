import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBackendStatus } from '@/lib/backend-mode';

export async function GET() {
  const status = getBackendStatus();

  // Try a lightweight health check if real DB
  let dbHealth = 'mock';
  let dbError: string | null = null;

  if (prisma) {
    try {
      // Very lightweight query
      await prisma.$queryRaw`SELECT 1 as ok`;
      dbHealth = 'connected';
    } catch (e: any) {
      dbHealth = 'error';
      dbError = e.message || 'Unknown DB error';
    }
  }

  return NextResponse.json({
    ...status,
    health: {
      database: dbHealth,
      error: dbError,
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}
