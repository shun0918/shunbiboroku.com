import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import styles from '~/styles/components/RoundIcon.module.scss';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

type Props = {
  href: string;
  icon: IconComponent;
  alt: string;
  size?: number;
};

const RoundIcon: React.FC<Props> = ({ href, icon: Icon, alt, size = 35 }) => {
  const isOtherSite = href.startsWith('https://');
  const inner = (
    <div className={styles.roundicon}>
      <Icon className={styles.roundicon__image} size={size} aria-label={alt} />
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
