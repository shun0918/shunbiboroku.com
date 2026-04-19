import fs from 'node:fs/promises';
import path from 'node:path';

const FAIL_PATH = 'tmp/migration-failures.json';

type Failure = {
  type: string;
  id?: string;
  slug?: string;
  error: { message: string; stack?: string };
};

const failures: Failure[] = [];

export function recordFailure(type: string, entry: unknown, err: unknown): void {
  const e = entry as { sys?: { id?: string }; fields?: { slug?: string } } | undefined;
  failures.push({
    type,
    id: e?.sys?.id,
    slug: e?.fields?.slug,
    error:
      err instanceof Error
        ? { message: err.message, stack: err.stack }
        : { message: String(err) },
  });
}

export async function flushFailures(): Promise<number> {
  await fs.mkdir(path.dirname(FAIL_PATH), { recursive: true });
  await fs.writeFile(FAIL_PATH, JSON.stringify(failures, null, 2));
  return failures.length;
}
