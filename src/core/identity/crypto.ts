// Purpose: the identity core's cryptography: 6-digit codes, session tokens, HMAC-SHA-256 keyed hashes and constant-time compare.

import type { Random } from './ports';

// D-009 (REQ-002, ROW-008, ROW-124): a code is 6 digits drawn from the cryptographic source by rejection sampling, so every
// value 000000-999999 is equally likely, written with its leading zeros.
const CODE_SPACE = 1_000_000;
const UINT32 = 0x1_0000_0000;
const CODE_LIMIT = UINT32 - (UINT32 % CODE_SPACE);

export function newCode(random: Random): string {
  const buf = new Uint8Array(4);
  for (;;) {
    random.fill(buf);
    const n = new DataView(buf.buffer).getUint32(0);
    if (n < CODE_LIMIT) return String(n % CODE_SPACE).padStart(6, '0');
  }
}

// D-010 (ROW-124): a session token is 256 random bits, written as 64 hex characters.
export function newSessionToken(random: Random): string {
  const buf = new Uint8Array(32);
  random.fill(buf);
  return toHex(buf);
}

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const enc = new TextEncoder();

export async function sha256Hex(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(value)));
}

async function hmacRaw(key: Uint8Array | string, message: string): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(message)));
}

/**
 * The keys every stored hash is made under, derived from the one server secret by HMAC-SHA-256 (RFC 2104) with a label
 * per purpose, so a code hash and an address hash never share a key (D-009, D-025).
 */
export type Keys = {
  /** HMAC of "<email>\n<code>": what the code store holds instead of the code (REQ-024). */
  codeHash(email: string, code: string): Promise<string>;
  /** HMAC of a network address: what the code store and the counters hold instead of the address (D-025). */
  addressHash(purpose: string, address: string): Promise<string>;
};

export async function deriveKeys(secret: string): Promise<Keys> {
  const codeKey = await hmacRaw(secret, 'call-by-identifier/code-hash/v1');
  const addressKey = await hmacRaw(secret, 'call-by-identifier/address-hash/v1');
  return {
    codeHash: async (email, code) => toHex(await hmacRaw(codeKey, `${email}\n${code}`)),
    addressHash: async (purpose, address) => toHex(await hmacRaw(addressKey, `${purpose}\n${address}`)),
  };
}

/** Compares two equal-length hex strings without an early exit (D-009). */
export function sameHash(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
