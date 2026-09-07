import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Set WebSocket constructor for Neon serverless driver in Node/Vercel serverless environment
neonConfig.webSocketConstructor = ws;

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('DATABASE_URL is missing. Initializing standard PrismaClient.');
    return new PrismaClient();
  }

  // Neon Driver Adapter must ONLY be used for Neon Postgres URLs
  const isNeon =
    connectionString.includes('neon.tech') ||
    connectionString.includes('neondatabase') ||
    connectionString.includes('.neon.');

  if (isNeon) {
    try {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaNeon(pool);
      return new PrismaClient({ adapter });
    } catch (e) {
      console.error('Failed to initialize Neon driver adapter:', e);
      return new PrismaClient();
    }
  }

  // Standard PrismaClient for local PostgreSQL or SQLite
  return new PrismaClient();
};

const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
export { prisma };
