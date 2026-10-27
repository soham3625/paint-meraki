// ============================================
// VERIFICATION TEST SUITE: PAINT MERAKI DATA INTEGRITY & PERSISTENCE
// ============================================

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { getPrismaClient, isDatabaseConfigured } from '@/lib/prisma';
import {
  getBusinessSettings,
  updateBusinessSettings,
  createOrder,
} from '@/lib/services/db-service';
import type { Order } from '@/types';

async function runTests() {
  console.log('--- TEST 1: Prisma 7 Driver Adapter & Client Initialization ---');
  const dummyUrl = 'postgresql://testuser:testpass@localhost:5432/testdb';
  process.env.DATABASE_URL = dummyUrl;

  const client = getPrismaClient();
  assert(client !== null, 'PrismaClient should be instantiated when DATABASE_URL is set');
  assert(typeof client.order?.findMany === 'function', 'Order model methods should be available on client');
  console.log('✔ PASSED: Prisma 7 PrismaPg adapter initializes cleanly without missing-adapter error.');

  console.log('\n--- TEST 2: Resilient State Persistence (In-Memory + Database Attempt) ---');
  // Attempting a write to unreachable DB should ensure tables, log notice, and preserve updated state
  const updatedSettings = await updateBusinessSettings({ businessName: 'Test Store Name' });
  assert(updatedSettings.businessName === 'Test Store Name', 'updateBusinessSettings must immediately return updated settings');
  const readBack = await getBusinessSettings();
  assert(readBack.businessName === 'Test Store Name', 'getBusinessSettings must return the latest saved businessName');
  console.log('✔ PASSED: updateBusinessSettings saved and returned updated state reliably.');

  const mockOrder: Order = {
    id: 'test-ord-fail-1',
    orderNumber: 'TEST999',
    customer: { fullName: 'Test User', mobile: '9999999999', email: 'test@example.com' },
    shippingAddress: { address: '123 St', city: 'City', state: 'State', pincode: '380015' },
    items: [],
    subtotal: 1000,
    shippingCharge: 0,
    codFee: 0,
    total: 1000,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createdOrder = await createOrder(mockOrder);
  assert(createdOrder.orderNumber === 'TEST999', 'createOrder must persist order to runtime store even during DB connection issues');
  console.log('✔ PASSED: createOrder successfully preserved order state without failing checkout.');

  console.log('\n--- TEST 3: In-Memory / Fallback Behavior When DB Not Configured ---');
  delete process.env.DATABASE_URL;
  // Clear cached client & runtime
  const globalAny = globalThis as any;
  delete globalAny.prisma;
  delete globalAny.pgPool;
  delete globalAny._settings;

  assert(!isDatabaseConfigured(), 'isDatabaseConfigured should return false when DATABASE_URL is unset');

  const defaultSett = await getBusinessSettings();
  assert(defaultSett.businessName === 'paint_n_meraki', 'Should return default settings when DB not configured');
  console.log('✔ PASSED: Safe fallback when DATABASE_URL is intentionally unset.');

  console.log('\n--- TEST 4: Frontend API Endpoints Verification ---');
  const baseDir = path.join(process.cwd(), 'src');

  const announcementContent = fs.readFileSync(path.join(baseDir, 'components/layout/AnnouncementBar.tsx'), 'utf8');
  assert(announcementContent.includes("fetch('/api/settings')"), 'AnnouncementBar must fetch /api/settings');
  assert(!announcementContent.includes("fetch('/api/admin/settings')"), 'AnnouncementBar must NOT fetch /api/admin/settings');

  const footerContent = fs.readFileSync(path.join(baseDir, 'components/layout/Footer.tsx'), 'utf8');
  assert(footerContent.includes("fetch('/api/settings')"), 'Footer must fetch /api/settings');
  assert(footerContent.includes("fetch('/api/categories')"), 'Footer must fetch /api/categories');
  assert(!footerContent.includes("fetch('/api/admin/settings')"), 'Footer must NOT fetch /api/admin/settings');
  assert(!footerContent.includes("fetch('/api/admin/categories')"), 'Footer must NOT fetch /api/admin/categories');

  const whatsappContent = fs.readFileSync(path.join(baseDir, 'components/layout/WhatsAppFloat.tsx'), 'utf8');
  assert(whatsappContent.includes("fetch('/api/settings')"), 'WhatsAppFloat must fetch /api/settings');
  assert(!whatsappContent.includes("fetch('/api/admin/settings')"), 'WhatsAppFloat must NOT fetch /api/admin/settings');

  const contactContent = fs.readFileSync(path.join(baseDir, 'app/(site)/contact/page.tsx'), 'utf8');
  assert(contactContent.includes("fetch('/api/settings')"), 'Contact page must fetch /api/settings');
  assert(!contactContent.includes("fetch('/api/admin/settings')"), 'Contact page must NOT fetch /api/admin/settings');

  const headerContent = fs.readFileSync(path.join(baseDir, 'components/layout/Header.tsx'), 'utf8');
  assert(headerContent.includes("fetch('/api/categories')"), 'Header must fetch /api/categories');
  assert(!headerContent.includes("fetch('/api/admin/categories')"), 'Header must NOT fetch /api/admin/categories');

  const checkoutContent = fs.readFileSync(path.join(baseDir, 'app/(site)/checkout/page.tsx'), 'utf8');
  assert(checkoutContent.includes("!res.ok || !data.success"), 'Checkout must verify server persistence before clearing cart');

  console.log('✔ PASSED: All storefront components correctly point to public canonical APIs.');
  console.log('✔ PASSED: Checkout page enforces strict server response validation.');

  console.log('\n============================================');
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('============================================');
}

runTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
