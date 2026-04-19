import type { GetStaticPaths, GetStaticProps } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypePrismPlus from 'rehype-prism-plus';
import { getAllPostSlugs, getPostBySlug } from '~/lib/content/posts';
import type { Post } from '~/models/post';
import PostContent from '~/components/PostContent';
import Ogp from '~/components/Ogp';
import styles from '~/styles/pages/post/[slug].module.scss';
import Header from '~/components/Header';

type Props = {
  post: Post;
};

const Slug = ({ post }: Props) => {
  return (
    <>
      <Ogp
        title={post.title + '| Shun Bibo Roku'}
        description={post.description}
        image={post.thumbnail}
        type="article"
        path={'/post/' + post.slug}
      />
      <Header />
      <main className={styles.main}>
        <PostContent
          title={post.title}
          thumbnail={post.thumbnail}
          body={
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypePrismPlus, { ignoreMissing: true }]]}
              components={{
                img: ({ src, alt, width, height }) => {
                  const resolved =
                    typeof src === 'string' && src.startsWith('./')
                      ? `/content/post/${post.slug}/${src.replace(/^\.\//, '')}`
                      : src;
                  return <img src={resolved} alt={alt ?? ''} width={width} height={height} />;
                },
                a: ({ href, children, ...rest }) => (
                  <a
                    href={href}
                    {...(typeof href === 'string' && /^https?:\/\//.test(href)
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    {...rest}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {post.body}
            </ReactMarkdown>
          }
          publishedAt={post.publishedAt}
          updatedAt={post.updatedAt}
          slug={post.slug}
        />
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await getPostBySlug(slug);
  return { props: { post } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllPostSlugs();
  const paths = slugs.map((slug) => ({ params: { slug } }));
  return { paths, fallback: false };
};

export default Slug;
