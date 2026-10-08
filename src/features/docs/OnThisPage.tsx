import { Link } from '@/design-system/primitives';
import styles from './OnThisPage.module.css';

export interface OnThisPageItem {
  id: string;
  label: string;
}

/** In-page navigation to section fragments. */
export function OnThisPage({ items }: { items: readonly OnThisPageItem[] }) {
  return (
    <nav aria-label="On this page" className={styles.nav}>
      <p className={styles.title}>On this page</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`#${item.id}`} variant="standalone" className={styles.link}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
