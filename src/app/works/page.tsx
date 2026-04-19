import type { Metadata } from 'next';
import Abstruct from '~/components/Abstruct';
import Header from '~/components/Header';
import SectionHeader from '~/components/SectionHeader';
import { listWorks } from '~/lib/content/works';
import styles from '~/styles/pages/works.module.scss';

export const metadata: Metadata = {
  title: 'Works',
  openGraph: { type: 'website', url: '/works' },
};

export default async function WorksPage() {
  const works = await listWorks();
  return (
    <>
      <Header />
      <SectionHeader title="Works" />
      <ul className={styles.works}>
        {works.map((m) => (
          <li className={styles.works__item} key={m.slug}>
            <Abstruct
              title={m.name}
              tags={m.roles}
              description={m.description}
              url={m.url}
              imagePath={m.image}
              height="720"
              width="1280"
            />
          </li>
        ))}
      </ul>
    </>
  );
}
