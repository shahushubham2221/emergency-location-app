/**
 * generateSessionId — creates a cryptographically random URL-safe session ID.
 * Uses crypto.getRandomValues for security.
 * Falls back to Math.random() in environments where crypto is unavailable.
 */
export function generateSessionId(): string {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  const LENGTH = 24;

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(LENGTH);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => CHARS[b % CHARS.length])
      .join('');
  }

  // Fallback (non-cryptographic)
  return Array.from({ length: LENGTH }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

/**
 * generateShortId — 8-character short ID suitable for human-readable references.
 */
export function generateShortId(): string {
  return generateSessionId().slice(0, 8).toUpperCase();
}
