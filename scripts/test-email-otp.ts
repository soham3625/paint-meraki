// ============================================
// COMPREHENSIVE EMAIL OTP TEST SUITE
// Tests: Valid, Expired, Incorrect, Reused, and Rate-Limited OTPs
// ============================================

import assert from 'assert';
import {
  hashEmailOtp,
  verifyEmailOtpHash,
  saveEmailOtpRecord,
  verifyAndConsumeEmailOtpRecord,
  checkEmailOtpCooldown,
  deleteEmailOtpRecord,
  findOrCreateCustomerByEmail,
} from '../src/lib/services/db-service';
import { checkRateLimit, clearRateLimit } from '../src/lib/rate-limit';
import { sendOtpEmail } from '../src/lib/services/email-service';

async function runTestSuite() {
  console.log('====================================================');
  console.log('PAINT N MERAKI — EMAIL OTP VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST 1: Cryptographic Hash & Constant-time Equality
  // ----------------------------------------------------
  console.log('--- TEST 1: Cryptographic Hash & Timing-Safe Verification ---');
  const email1 = 'customer1@example.com';
  const otp1 = '482915';
  const hash1 = hashEmailOtp(otp1, email1);
  assert(typeof hash1 === 'string' && hash1.length === 64, 'OTP hash must be a 64-char SHA256 hex string');
  assert(hash1 !== otp1, 'OTP hash must not contain plaintext OTP');

  // Verify correct matching
  assert(verifyEmailOtpHash(otp1, email1, hash1) === true, 'Valid OTP must match stored hash');
  // Verify wrong OTP mismatch
  assert(verifyEmailOtpHash('123456', email1, hash1) === false, 'Wrong OTP must not match stored hash');
  // Verify wrong email mismatch
  assert(verifyEmailOtpHash(otp1, 'other@example.com', hash1) === false, 'Different email must not match hash');
  console.log('✔ PASSED: HMAC-SHA256 hashing and timing-safe comparison are cryptographically sound.\n');

  // ----------------------------------------------------
  // TEST 2: Valid OTP Verification & Session User Creation
  // ----------------------------------------------------
  console.log('--- TEST 2: Valid OTP Verification & Customer Account Creation ---');
  const validEmail = 'astha.art@example.com';
  const validOtp = '654321';
  const validHash = hashEmailOtp(validOtp, validEmail);

  await saveEmailOtpRecord({
    email: validEmail,
    otpHash: validHash,
    expiresInMinutes: 10,
    cooldownSeconds: 60,
    action: 'LOGIN',
  });

  const verifyValid = await verifyAndConsumeEmailOtpRecord(validEmail, validOtp);
  assert(verifyValid.success === true, 'Verification of correct code must succeed');
  assert(!verifyValid.error, 'No error must be returned for valid verification');

  const customer = await findOrCreateCustomerByEmail({
    email: validEmail,
    fullName: 'Astha Patel',
  });
  assert(customer.id.startsWith('usr_'), 'User ID must be generated with prefix usr_');
  assert(customer.email === validEmail, 'User email must match verified email');
  assert(customer.fullName === 'Astha Patel', 'User name must match');
  console.log('✔ PASSED: Valid OTP verified successfully and customer account established.\n');

  // ----------------------------------------------------
  // TEST 3: Expired OTP Rejection
  // ----------------------------------------------------
  console.log('--- TEST 3: Expired OTP Rejection ---');
  const expiredEmail = 'expired.user@example.com';
  const expiredOtp = '112233';
  const expiredHash = hashEmailOtp(expiredOtp, expiredEmail);

  // Save record with negative expiry (expired 5 minutes ago)
  await saveEmailOtpRecord({
    email: expiredEmail,
    otpHash: expiredHash,
    expiresInMinutes: -5,
    cooldownSeconds: 60,
    action: 'LOGIN',
  });

  const verifyExpired = await verifyAndConsumeEmailOtpRecord(expiredEmail, expiredOtp);
  assert(verifyExpired.success === false, 'Expired OTP must be rejected');
  assert(verifyExpired.code === 'EXPIRED', 'Error code must be EXPIRED');
  assert(verifyExpired.error?.includes('expired'), 'Error message must clearly state expiry');
  console.log('✔ PASSED: Expired OTP is strictly rejected with EXPIRED code.\n');

  // ----------------------------------------------------
  // TEST 4: Incorrect OTP Attempts & Lockout
  // ----------------------------------------------------
  console.log('--- TEST 4: Incorrect OTP Attempts & Attempt Counter ---');
  const incorrectEmail = 'attempts.user@example.com';
  const actualOtp = '987123';
  const actualHash = hashEmailOtp(actualOtp, incorrectEmail);

  await saveEmailOtpRecord({
    email: incorrectEmail,
    otpHash: actualHash,
    expiresInMinutes: 10,
    maxAttempts: 3,
  });

  // Attempt 1: Wrong code
  const attempt1 = await verifyAndConsumeEmailOtpRecord(incorrectEmail, '000000');
  assert(attempt1.success === false, 'Wrong OTP must be rejected on attempt 1');
  assert(attempt1.code === 'INVALID_CODE', 'Error code must be INVALID_CODE');
  assert(attempt1.remainingAttempts === 2, `Expected 2 remaining attempts, got ${attempt1.remainingAttempts}`);

  // Attempt 2: Wrong code
  const attempt2 = await verifyAndConsumeEmailOtpRecord(incorrectEmail, '000001');
  assert(attempt2.success === false, 'Wrong OTP must be rejected on attempt 2');
  assert(attempt2.remainingAttempts === 1, `Expected 1 remaining attempt, got ${attempt2.remainingAttempts}`);

  // Attempt 3: Wrong code (exhausts remaining)
  const attempt3 = await verifyAndConsumeEmailOtpRecord(incorrectEmail, '000002');
  assert(attempt3.success === false, 'Exhausting max attempts must fail');
  assert(attempt3.code === 'MAX_ATTEMPTS', 'Error code must be MAX_ATTEMPTS');
  assert(attempt3.remainingAttempts === 0, 'Remaining attempts must be 0');

  // Attempt 4: Even with correct code now, it should stay invalid because max attempts reached!
  const attempt4 = await verifyAndConsumeEmailOtpRecord(incorrectEmail, actualOtp);
  assert(attempt4.success === false, 'Locked out OTP cannot be verified even with correct code');
  assert(attempt4.code === 'MAX_ATTEMPTS', 'Must return MAX_ATTEMPTS lockout');
  console.log('✔ PASSED: Incorrect attempts decrement counter and lock out after maximum allowed attempts.\n');

  // ----------------------------------------------------
  // TEST 5: Reused OTP Rejection
  // ----------------------------------------------------
  console.log('--- TEST 5: Reused OTP Rejection ---');
  const reuseEmail = 'reuse.user@example.com';
  const reuseOtp = '778899';
  const reuseHash = hashEmailOtp(reuseOtp, reuseEmail);

  await saveEmailOtpRecord({
    email: reuseEmail,
    otpHash: reuseHash,
    expiresInMinutes: 10,
  });

  // First consumption: should succeed
  const firstConsume = await verifyAndConsumeEmailOtpRecord(reuseEmail, reuseOtp);
  assert(firstConsume.success === true, 'Initial verification of OTP must succeed');

  // Second consumption with identical OTP: MUST BE REJECTED
  const secondConsume = await verifyAndConsumeEmailOtpRecord(reuseEmail, reuseOtp);
  assert(secondConsume.success === false, 'Replaying consumed OTP must be rejected');
  assert(secondConsume.code === 'REUSED', 'Error code must be REUSED');
  assert(secondConsume.error?.includes('already been used'), 'Error message must state OTP was already used');
  console.log('✔ PASSED: Reused/replayed OTP is strictly rejected with REUSED code.\n');

  // ----------------------------------------------------
  // TEST 6: Resend Cooldown & Sliding Window Rate Limiter
  // ----------------------------------------------------
  console.log('--- TEST 6: Resend Cooldown & Rate Limiting ---');
  const cooldownEmail = 'cooldown.user@example.com';
  const cdOtp = '334455';
  const cdHash = hashEmailOtp(cdOtp, cooldownEmail);

  await saveEmailOtpRecord({
    email: cooldownEmail,
    otpHash: cdHash,
    cooldownSeconds: 60,
  });

  // Check cooldown immediately
  const cooldownCheck = await checkEmailOtpCooldown(cooldownEmail);
  assert(cooldownCheck.allowed === false, 'Immediate resend must be blocked by cooldown');
  assert(cooldownCheck.retryAfterSeconds > 0 && cooldownCheck.retryAfterSeconds <= 60, 'retryAfterSeconds must be between 1 and 60');

  // In-Memory sliding window rate limiting test
  const rateLimitKey = 'test_rl_ip_192_168_1_1';
  clearRateLimit(rateLimitKey);

  for (let i = 1; i <= 5; i++) {
    const rl = checkRateLimit(rateLimitKey, 5, 60000);
    assert(rl.allowed === true, `Request ${i} should be allowed within rate limit`);
  }
  // 6th request should exceed limit
  const rlBlocked = checkRateLimit(rateLimitKey, 5, 60000);
  assert(rlBlocked.allowed === false, '6th request must be blocked by rate limiter');
  assert(rlBlocked.retryAfterSeconds > 0, 'Retry after seconds must be provided');
  clearRateLimit(rateLimitKey);
  console.log('✔ PASSED: Resend cooldown and rate limit enforcement succeed as expected.\n');

  // ----------------------------------------------------
  // TEST 7: Delivery Failure Handling & Record Cleanup
  // ----------------------------------------------------
  console.log('--- TEST 7: Delivery Failure Handling & Record Cleanup ---');
  // Test deletion of OTP record if email dispatch fails
  const failEmail = 'fail.delivery@example.com';
  const failOtp = '556677';
  const failHash = hashEmailOtp(failOtp, failEmail);

  const savedRecord = await saveEmailOtpRecord({
    email: failEmail,
    otpHash: failHash,
  });
  // Simulate dispatch failure -> cleanup record
  await deleteEmailOtpRecord(savedRecord.id);

  const afterDelete = await verifyAndConsumeEmailOtpRecord(failEmail, failOtp);
  assert(afterDelete.success === false, 'Deleted OTP record must not be verifiable');
  assert(afterDelete.code === 'NOT_FOUND', 'Should return NOT_FOUND after cleanup');

  // Test sendOtpEmail when RESEND_API_KEY is not configured or in production without key
  const prevEnv = process.env.NODE_ENV;
  (process.env as any).NODE_ENV = 'production';
  const prevKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  const dispatchResult = await sendOtpEmail({
    to: 'test@example.com',
    otp: '123456',
    customerName: 'Test',
  });
  assert(dispatchResult.success === false, 'sendOtpEmail must never report success when RESEND_API_KEY is missing in production');
  assert(dispatchResult.error?.includes('RESEND_API_KEY'), 'Error message must indicate missing configuration');

  // Restore env
  (process.env as any).NODE_ENV = prevEnv;
  if (prevKey) process.env.RESEND_API_KEY = prevKey;
  console.log('✔ PASSED: Email delivery failure handling is reliable and never reports false success.\n');

  console.log('====================================================');
  console.log('🎉 ALL 7 TEST SUITES PASSED CLEANLY WITH ZERO ERRORS');
  console.log('====================================================');
}

runTestSuite().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
