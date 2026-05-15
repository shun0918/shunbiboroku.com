import { Briefcase } from 'lucide-react';
import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import styles from '~/styles/components/Profile.module.scss';
import RoundIcon from '~/components/RoundIcon';
import Ben from '~/components/Ben';

const Profile: React.FC = () => {
  const icons = [
    {
      alt: 'GitHub',
      icon: SiGithub,
      href: 'https://github.com/shun0918',
    },
    {
      alt: 'X',
      icon: SiX,
      href: 'https://twitter.com/DVq0Hp0iU6itt4N',
    },
    {
      alt: '制作実績',
      icon: Briefcase,
      href: '/works',
    },
  ];
  return (
    <>
      <div className={styles.profile}>
        <Ben size={500} />
        <div className={styles.profile__details}>
          <h2 className={styles.profile__title}>
            好きな技術は、
            <br className={styles['profile__title--spbr']} aria-hidden="true" />
            個人開発で。
          </h2>
          <p>
            UI/UXデザインから、フロントエンド、時にバックエンドなど、個人開発に役立つ些細な気づきを記事として残していきます。
          </p>
          <p>本ブログのソースコードも公開中。</p>
          <div className={styles.profile__icons}>
            {icons.map((m, i) => (
              <div key={i} className={styles.profile__icon}>
                <RoundIcon alt={m.alt} icon={m.icon} href={m.href} size={35} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
