/**
 * BT4 Studio - Backend Mode Detector
 * 
 * Single source of truth for whether we are using real Postgres or mock.
 * Used for logging, health checks, and UI indicators.
 */

import { prisma } from './prisma';

export const isRealDatabase = !!prisma;

export const backendMode = isRealDatabase ? 'REAL_POSTGRES' : 'MOCK_IN_MEMORY';

export function getBackendStatus() {
  return {
    mode: backendMode,
    isReal: isRealDatabase,
    database: isRealDatabase ? 'postgresql' : 'in-memory-mock',
    note: isRealDatabase 
      ? 'Using real PostgreSQL via Prisma' 
      : 'Using in-memory mock (set DATABASE_URL + run prisma generate + seed to go real)',
  };
}
