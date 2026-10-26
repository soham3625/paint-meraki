// ============================================
// PAINT MERAKI — PRODUCTION DATABASE SYNC SCRIPT
// Automatically provisions database tables on build if DATABASE_URL is configured
// ============================================

const { execSync } = require('child_process');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  try {
    console.log('[build-db] DATABASE_URL detected. Synchronizing PostgreSQL schema with Prisma...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[build-db] PostgreSQL database schema successfully synchronized.');
  } catch (err) {
    console.warn('[build-db] Notice: Could not sync remote database at build time:', err.message);
    console.warn('[build-db] Application will use resilient in-memory runtime store with automatic auto-seeding.');
  }
} else {
  console.log('[build-db] DATABASE_URL not set at build time, skipping remote db push.');
}
