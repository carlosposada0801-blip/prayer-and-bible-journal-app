/** Local-date helpers. Dates are stored as "YYYY-MM-DD" in the user's time zone. */

export function toDateKey(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Whole days from `a` to `b` (local midnight to local midnight). */
export function daysBetween(a: Date, b: Date) {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function dayOfYear(d: Date = new Date()) {
  return daysBetween(new Date(d.getFullYear(), 0, 1), d) + 1;
}

export function formatDate(iso: string | Date, style: 'long' | 'medium' | 'short' = 'medium') {
  const d = typeof iso === 'string' ? (iso.length === 10 ? fromDateKey(iso) : new Date(iso)) : iso;
  if (style === 'long') return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  if (style === 'short') return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export function relativeDay(iso: string) {
  const diff = daysBetween(new Date(iso), new Date());
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDate(iso, 'short');
}
