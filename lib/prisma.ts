import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaPool: Pool | undefined;
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return new PrismaClient();
  }

  const isNeon =
    connectionString.includes('neon.tech') ||
    connectionString.includes('neondatabase') ||
    connectionString.includes('.neon.');

  if (isNeon) {
    try {
      const pool =
        globalThis.prismaPool ??
        new Pool({
          connectionString,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

      globalThis.prismaPool = pool;
      const adapter = new PrismaNeon(pool);
      return new PrismaClient({ adapter, log: ['error'] });
    } catch (e) {
      console.error('Failed to initialize Neon driver adapter:', e);
      return new PrismaClient();
    }
  }

  return new PrismaClient();
};

const prisma = globalThis.prismaGlobal ?? createPrismaClient();

// Re-use client instance across serverless invocations to eliminate cold start overhead
globalThis.prismaGlobal = prisma;

export default prisma;
export { prisma };
