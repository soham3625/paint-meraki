// ============================================
// paint_n_meraki — IMAGE PATH NORMALIZER & SANITIZER
// Resolves local files, uploaded base64 data URIs,
// full Windows copy paths, and remote URLs consistently.
// ============================================

export function cleanImagePath(val?: string | null): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // 1. Convert any Windows backslashes to standard forward slashes
  let normalized = trimmed.replace(/\\/g, '/');

  // 2. If it's a full disk path or contains /public/, extract from /public/ onwards
  const publicIdx = normalized.toLowerCase().indexOf('/public/');
  if (publicIdx !== -1) {
    normalized = normalized.substring(publicIdx + 7); // skip '/public'
  } else if (normalized.toLowerCase().startsWith('public/')) {
    normalized = normalized.substring(6); // skip 'public'
  } else if (normalized.toLowerCase().startsWith('/public/')) {
    normalized = normalized.substring(7); // skip '/public'
  }

  // 3. Ensure a single leading forward slash
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  return normalized;
}

export const normalizeImagePath = cleanImagePath;
