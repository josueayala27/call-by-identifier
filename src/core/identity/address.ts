// Purpose: turns the edge-reported client address into the network address every per-address rule counts (D-027).

// D-027: IPv4 counted whole; IPv6 counted per /64 (its first four groups); an IPv4-mapped IPv6 address counts as its IPv4.
// The value is the CF-Connecting-IP the edge reports; no forwarding header is read.

function parseIpv4(s: string): string | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  if (parts.some((p) => p > 255)) return null;
  return parts.join('.');
}

/** The 8 groups of an IPv6 address, or null. */
function parseIpv6(s: string): number[] | null {
  let text = s.toLowerCase();
  const zone = text.indexOf('%');
  if (zone >= 0) text = text.slice(0, zone);
  let tail: number[] = [];
  const lastColon = text.lastIndexOf(':');
  const v4 = parseIpv4(text.slice(lastColon + 1));
  if (v4) {
    const b = v4.split('.').map(Number);
    tail = [(b[0] << 8) | b[1], (b[2] << 8) | b[3]];
    text = text.slice(0, lastColon + 1) + '0';
  }
  const halves = text.split('::');
  if (halves.length > 2) return null;
  const group = (g: string) => (/^[0-9a-f]{1,4}$/.test(g) ? parseInt(g, 16) : NaN);
  const head = halves[0] ? halves[0].split(':').map(group) : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(':').map(group) : [];
  if ([...head, ...rest].some((n) => Number.isNaN(n))) return null;
  let groups: number[];
  if (halves.length === 2) {
    const fill = 8 - head.length - rest.length - (v4 ? 1 : 0);
    if (fill < 0) return null;
    groups = [...head, ...Array(fill).fill(0), ...rest];
  } else {
    groups = head;
  }
  if (v4) groups = [...groups.slice(0, groups.length - 1), ...tail];
  return groups.length === 8 ? groups : null;
}

/** The network address key: "4:<a.b.c.d>", "6:<first four groups>", or "?:<raw>" for anything unparseable. */
export function networkAddress(clientAddress: string | null | undefined): string {
  const raw = (clientAddress ?? '').trim();
  const v4 = parseIpv4(raw);
  if (v4) return `4:${v4}`;
  const v6 = parseIpv6(raw);
  if (v6) {
    const mapped = v6.slice(0, 5).every((g) => g === 0) && v6[5] === 0xffff;
    if (mapped) return `4:${v6[6] >> 8}.${v6[6] & 0xff}.${v6[7] >> 8}.${v6[7] & 0xff}`;
    return `6:${v6.slice(0, 4).map((g) => g.toString(16)).join(':')}`;
  }
  return `?:${raw}`;
}
