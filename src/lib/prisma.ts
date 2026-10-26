let prismaInstance: any = null;

try {
  // Dynamically require to avoid crash if .prisma/client is not yet generated
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = globalThis as unknown as {
    prisma: any;
  };

  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

  globalForPrisma.prisma = prismaInstance;
} catch (e) {
  // Graceful fallback when Prisma Client is not generated or DB is offline
  prismaInstance = new Proxy({}, {
    get: () => {
      return () => Promise.resolve(null);
    }
  });
}

export const prisma = prismaInstance;
