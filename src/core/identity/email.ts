// Purpose: the one email normaliser: accepts a single bare plain-ASCII address and returns it lowercase, or null.

// REQ-039 (ROW-204, ROW-207, ROW-212): only plain ASCII addresses; any other character refuses the whole input.
// ROW-114: one bare address only: no commas, semicolons, spaces, line breaks, angle brackets, display names or second @;
// at most 254 characters (RFC 5321's path limit). Apostrophes, dots, plus and the other RFC 5322 atext characters pass.
// A-020, D-012: stored and mailed lowercase.

const MAX_LENGTH = 254;
const MAX_LOCAL = 64;
const MAX_LABEL = 63;
// RFC 5322 atext, the characters a dot-atom local part may hold.
const LOCAL_ATOM = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

export function normaliseEmail(input: string): string | null {
  // Only ASCII spaces and tabs around the address are dropped, as a browser's email box does; anything else is kept and judged.
  const value = input.replace(/^[ \t]+|[ \t]+$/g, '');
  if (value.length === 0 || value.length > MAX_LENGTH) return null;
  if (!/^[\x21-\x7e]+$/.test(value)) return null; // printable ASCII only: no space, control, non-ASCII or invisible character
  const parts = value.split('@');
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (local.length === 0 || local.length > MAX_LOCAL) return null;
  if (!local.split('.').every((atom) => LOCAL_ATOM.test(atom))) return null;
  const labels = domain.split('.');
  if (labels.length < 2) return null;
  if (!labels.every((l) => l.length <= MAX_LABEL && DOMAIN_LABEL.test(l))) return null;
  return value.toLowerCase();
}
