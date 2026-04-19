import { fetchAll } from './fetch-contentful';
import { writePost } from './write-post';
import { writeWorks } from './write-works';
import { flushFailures, recordFailure } from './log';

type Args = {
  useCache: boolean;
  onlyType: 'post' | 'works' | null;
  onlySlug: string | null;
};

function parseArgs(argv: string[]): Args {
  const useCache = argv.includes('--use-cache');
  const typeIdx = argv.indexOf('--type');
  const rawType = typeIdx >= 0 ? argv[typeIdx + 1] : null;
  const onlyType = rawType === 'post' || rawType === 'works' ? rawType : null;
  const slugIdx = argv.indexOf('--slug');
  const onlySlug = slugIdx >= 0 ? argv[slugIdx + 1] : null;
  return { useCache, onlyType, onlySlug };
}

type Slugged = { fields?: { slug?: string } };

function filterBySlug<T extends Slugged>(items: T[], slug: string | null): T[] {
  if (!slug) return items;
  return items.filter((i) => i.fields?.slug === slug);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { posts, works } = await fetchAll(args.useCache);

  let postOk = 0;
  let postFail = 0;
  if (!args.onlyType || args.onlyType === 'post') {
    const target = filterBySlug(posts as Slugged[], args.onlySlug);
    for (const entry of target) {
      const slug = (entry as Slugged).fields?.slug ?? '(no slug)';
      try {
        await writePost(entry);
        postOk += 1;
        console.log(`[post] ${slug} done`);
      } catch (err) {
        postFail += 1;
        console.error(`[post] ${slug} FAILED`, err);
        recordFailure('post', entry, err);
      }
    }
  }

  let worksOk = 0;
  let worksFail = 0;
  if (!args.onlyType || args.onlyType === 'works') {
    const target = filterBySlug(works as Slugged[], args.onlySlug);
    for (const entry of target) {
      const slug = (entry as Slugged).fields?.slug ?? '(no slug)';
      try {
        await writeWorks(entry);
        worksOk += 1;
        console.log(`[works] ${slug} done`);
      } catch (err) {
        worksFail += 1;
        console.error(`[works] ${slug} FAILED`, err);
        recordFailure('works', entry, err);
      }
    }
  }

  const failureCount = await flushFailures();

  console.log('');
  console.log('=== Summary ===');
  console.log(`Posts: success=${postOk}, failed=${postFail}`);
  console.log(`Works: success=${worksOk}, failed=${worksFail}`);
  if (failureCount > 0) {
    console.log(`See tmp/migration-failures.json for details.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
