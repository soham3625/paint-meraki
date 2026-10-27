// ============================================
// paint_n_meraki — PRISMA CLIENT INITIALIZATION
// Configured with PrismaPg Driver Adapter for Prisma ORM 7 & PostgreSQL
// ============================================

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

/**
 * Returns a singleton PrismaClient configured with the PrismaPg driver adapter.
 * Uses connection pooling suitable for serverless / edge environments.
 */
export function getPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    return null;
  }

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  try {
    const isLocal =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1');

    const pool =
      globalForPrisma.pgPool ??
      new Pool({
        connectionString,
        ssl: isLocal ? false : { rejectUnauthorized: false },
        max: process.env.NODE_ENV === 'production' ? 10 : 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

    globalForPrisma.pgPool = pool;

    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    globalForPrisma.prisma = client;
    return client;
  } catch (err: any) {
    console.error('[Prisma] Failed to initialize PrismaClient with PrismaPg adapter:', err?.message || err);
    throw err;
  }
}

/**
 * Checks whether DATABASE_URL is non-empty.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
}

/**
 * Authoritative Prisma client export.
 * Proxies calls to the adapter-configured PrismaClient.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    if (!client) {
      throw new Error(
        `[Prisma] DATABASE_URL is not configured in environment variables. Database operations cannot be executed.`
      );
    }
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

