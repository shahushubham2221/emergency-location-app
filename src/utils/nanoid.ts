const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ALPHABET_LENGTH = ALPHABET.length;

/**
 * Generates a cryptographically random ID of the given length.
 * Uses crypto.getRandomValues for uniform distribution via rejection sampling.
 */
export function nanoid(length = 21): string {
  // Rejection-sampling mask: largest power-of-2 bitmask ≥ ALPHABET_LENGTH
  const mask = (2 << (Math.log(ALPHABET_LENGTH - 1) / Math.LN2)) - 1;
  // Allocate more bytes than needed to avoid multiple crypto calls in the loop
  const bytesNeeded = Math.ceil((1.6 * mask * length) / ALPHABET_LENGTH);
  let id = '';

  while (id.length < length) {
    const bytes = new Uint8Array(bytesNeeded);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < bytes.length && id.length < length; i++) {
      const byte = bytes[i] & mask;
      if (byte < ALPHABET_LENGTH) {
        id += ALPHABET[byte];
      }
    }
  }

  return id;
}
