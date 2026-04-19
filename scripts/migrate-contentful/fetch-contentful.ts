import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from 'contentful';

const CACHE_PATH = 'tmp/contentful-raw.json';

export type RawEntries = {
  posts: unknown[];
  works: unknown[];
};

export async function fetchAll(useCache: boolean): Promise<RawEntries> {
  if (useCache) {
    try {
      const raw = await fs.readFile(CACHE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as RawEntries;
      console.log(`[fetch] cache hit: posts=${parsed.posts.length} works=${parsed.works.length}`);
      return parsed;
    } catch {
      console.log('[fetch] cache miss, falling back to API');
    }
  }

  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!space || !accessToken) {
    throw new Error('CONTENTFUL_SPACE_ID / CONTENTFUL_ACCESS_TOKEN must be set');
  }
  const client = createClient({ space, accessToken });

  const posts = await fetchAllOfType(client, 'post');
  const works = await fetchAllOfType(client, 'works');
  const out: RawEntries = { posts, works };

  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(out, null, 2));
  console.log(`[fetch] saved cache: posts=${posts.length} works=${works.length}`);
  return out;
}

async function fetchAllOfType(
  client: ReturnType<typeof createClient>,
  contentType: string,
): Promise<unknown[]> {
  const items: unknown[] = [];
  const limit = 100;
  let skip = 0;
  for (;;) {
    const res = await client.getEntries({
      content_type: contentType,
      limit,
      skip,
      include: 10,
    });
    items.push(...res.items);
    if (items.length >= res.total) break;
    skip += limit;
  }
  return items;
}
