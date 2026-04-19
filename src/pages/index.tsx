import type { GetStaticProps } from 'next';
import Ogp from '~/components/Ogp';
import FirstView from '~/components/FirstView';
import PostCard from '~/components/PostCard';
import SectionHeader from '~/components/SectionHeader';
import styles from '~/styles/pages/index.module.scss';
import { listPosts } from '~/lib/content/posts';
import type { PostSummary } from '~/models/post';

type Props = {
  posts: PostSummary[];
};

export default function Index({ posts }: Props) {
  return (
    <>
      <Ogp
        title="Shun Bibo Roku"
        description="UI/UXデザインから、フロントエンド、時にバックエンドなど、個人開発に役立つ些細な気づきを記事として残していきます。本ブログのソースコードも公開中。"
        image="/img/icon.jpeg"
        type="website"
        path="https://shunbiboroku.com"
      />
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

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await listPosts();
  return { props: { posts } };
};
