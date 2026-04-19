import type { Metadata } from 'next';
import FirstView from '~/components/FirstView';
import PostCard from '~/components/PostCard';
import SectionHeader from '~/components/SectionHeader';
import { listPosts } from '~/lib/content/posts';
import styles from '~/styles/pages/index.module.scss';

export const metadata: Metadata = {
  title: { absolute: 'Shun Bibo Roku' },
  openGraph: { type: 'website', url: '/' },
  twitter: { card: 'summary_large_image' },
};

export default async function HomePage() {
  const posts = await listPosts();
  return (
    <>
      <FirstView />
      <main className={styles.main}>
        <SectionHeader title="Articles" />
        <section className={styles.container}>
          <div className={styles.posts__list}>
            {posts.map((p) => (
              <PostCard key={p.slug} {...p} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
