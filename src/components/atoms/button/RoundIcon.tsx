import Link from 'next/link';
import styles from '~/styles/components/RoundIcon.module.scss';

type Props = {
  href: string;
  src: string;
  alt: string;
  width: string;
  height: string;
};

const RoundIcon: React.FC<Props> = ({ href, src, alt = '', width = '37', height = '37' }) => {
  const isOtherSite = /^https:\/\//.test(href);
  const inner = (
    <div className={styles.roundicon}>
      <img className={styles.roundicon__image} src={src} alt={alt} width={width} height={height} />
      <div className={styles['roundicon__alt-wrapper']}>
        <span className={styles.roundicon__alt}>{alt}</span>
      </div>
    </div>
  );

  return isOtherSite ? (
    <a className={styles.roundicon__link} href={href}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={styles.roundicon__link}>
      {inner}
    </Link>
  );
};

export default RoundIcon;
