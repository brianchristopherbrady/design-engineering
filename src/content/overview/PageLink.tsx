import { Icon, Link } from '@/design-system/primitives';
import styles from './Overview.module.css';

/** A link to another page: underlined like every inline link, with an arrow for the destination. */
export function PageLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className={styles.actionLink}>
      {children} <Icon name="arrowRight" />
    </Link>
  );
}
