import { remark } from 'remark';
import strip from 'strip-markdown';

const MAX = 100;

export function generateDescription(md: string, max = MAX): string {
  const plain = String(remark().use(strip).processSync(md));
  const normalized = plain
    .replace(/[\r\n]+/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
  if (normalized.length > max) return normalized.slice(0, max) + '…';
  return normalized;
}
