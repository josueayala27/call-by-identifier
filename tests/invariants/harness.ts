// Purpose: the ledger's shared harness door: the product's address (PRODUCT_URL) and fresh per-case values; setup gaps throw "setup: ".
//
// The harness contract (dev-setup.txt): the product is reached at PRODUCT_URL, never BASE_URL; before the product
// exists (NO_PRODUCT=1, PRODUCT_URL empty) a case that reaches for it errors with a message beginning "setup:".

import { randomBytes } from 'node:crypto';

/** The setup error: a case that cannot reach what it needs errors, it never fails its row. */
export class SetupError extends Error {
  constructor(what: string) {
    super(`setup: ${what}`);
    this.name = 'SetupError';
  }
}

/** The product's address, from the harness. Throws "setup: no product in this run" when there is none. */
export function productUrl(): string {
  const url = (process.env.PRODUCT_URL || '').trim();
  if (!url) throw new SetupError('no product in this run');
  return url.replace(/\/+$/, '');
}

/** A fresh value, unique per run, so no product can hard-code it. */
export function fresh(len = 6): string {
  return randomBytes(len).toString('hex');
}

/** A fresh plain-ASCII email address on a reserved test domain (RFC 2606). */
export function freshEmail(tag = 'ta'): string {
  return `${tag}-${fresh()}@example.test`;
}

/**
 * A fresh client address for the CF-Connecting-IP header (DIF-003: the test sets it itself), drawn from the
 * documentation ranges (RFC 5737), so no per-address limit carries from one case to the next.
 */
export function freshClientAddress(): string {
  const nets = ['192.0.2', '198.51.100', '203.0.113'];
  const b = randomBytes(2);
  return `${nets[b[0] % nets.length]}.${1 + (b[1] % 254)}`;
}

/**
 * Loads a path of the product in a Playwright page, turning "the product is not there" into a setup error.
 * Any HTTP answer, a 404 included, is returned: whether it breaks the row is the case's own assertion.
 */
export async function openPage(
  page: { goto: (url: string, opts?: object) => Promise<{ status(): number } | null> },
  path: string,
): Promise<{ status(): number }> {
  const url = productUrl() + path;
  let res: { status(): number } | null;
  try {
    res = await page.goto(url, { waitUntil: 'load' });
  } catch (e) {
    throw new SetupError(`the product did not answer at ${url}: ${(e as Error).message.split('\n')[0]}`);
  }
  if (!res) throw new SetupError(`no response for ${url}`);
  return res;
}
