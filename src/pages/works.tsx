import type { GetStaticProps } from 'next';
import Abstruct from '~/components/Abstruct';
import SectionHeader from '~/components/SectionHeader';
import styles from '~/styles/pages/works.module.scss';
import Header from '~/components/Header';
import { listWorks } from '~/lib/content/works';
import type { Works } from '~/models/works';

type Props = {
  works: Works[];
};

export default function WorksPage({ works }: Props) {
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

export const getStaticProps: GetStaticProps<Props> = async () => {
  const works = await listWorks();
  return { props: { works } };
};
