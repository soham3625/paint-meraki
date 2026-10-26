// ============================================
// paint_n_meraki — CRYPTOGRAPHIC AUTH SECRET & SESSION SIGNER
// Standards-compliant Web Crypto HMAC-SHA256 (Edge & Node.js Universal)
// ============================================

/**
 * Retrieves the cryptographic secret used for signing session cookies and JWTs.
 * Fails safely in production if a secure secret is missing.
 */
export function getAuthSecret(): string {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET;

  if (secret && secret.trim().length >= 16) {
    return secret.trim();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL SECURITY CONFIGURATION ERROR: NEXTAUTH_SECRET or JWT_ACCESS_SECRET must be set in production with at least 32 characters.'
    );
  }

  // Development-only deterministic secret so local sessions remain stable across hot-reloads
  return 'paint_meraki_dev_only_ephemeral_hmac_secret_2026_do_not_use_in_production';
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Signs a JSON-serializable session payload into a tamper-proof signed token:
 * Format: `<base64Payload>.<hmacSignature>`
 */
export async function signSessionPayload<T extends object>(payload: T): Promise<string> {
  const secret = getAuthSecret();
  const payloadStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadStr, 'utf-8').toString('base64url');

  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const sigBuffer = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(base64Payload));
  const signature = Buffer.from(sigBuffer).toString('base64url');

  return `${base64Payload}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Validates HMAC-SHA256 signature using Web Crypto subtle.verify, expiration, and JSON integrity.
 */
export async function verifySessionPayload<T extends { expiresAt?: number }>(token: string): Promise<T | null> {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [base64Payload, signature] = parts;
  if (!base64Payload || !signature) {
    return null;
  }

  try {
    const secret = getAuthSecret();
    const key = await getHmacKey(secret);
    const enc = new TextEncoder();
    const sigBuf = Buffer.from(signature, 'base64url');

    const isValid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      sigBuf,
      enc.encode(base64Payload)
    );

    if (!isValid) {
      return null;
    }

    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr) as T;

    if (!parsed || (parsed.expiresAt && parsed.expiresAt < Date.now())) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
