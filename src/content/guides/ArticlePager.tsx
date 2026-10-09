import { Link } from '@/design-system/primitives';
import { findEntry } from '@/domain/system';
import { neighbors } from './topics';
import { articleHref } from './wiki/Blocks';
import styles from './wiki/wiki.module.css';

/** Previous and next article in the wiki's reading order. */
export function ArticlePager({ id }: { id: string }) {
  const { previous, next } = neighbors(id);
  const links = [
    { topic: previous, label: 'Previous', direction: 'previous' },
    { topic: next, label: 'Next', direction: 'next' },
  ].filter((link) => link.topic);
  if (!links.length) return null;
  return (
    <nav className={styles.pager} aria-label="Previous and next article">
      {links.map(({ topic, label, direction }) => (
        <Link key={direction} href={articleHref(topic?.id ?? '')} variant="standalone" className={styles.pagerLink} data-direction={direction}>
          <span className={styles.pagerLabel}>{label}</span>
          <span className={styles.pagerTitle}>{findEntry(topic?.id ?? '')?.name}</span>
        </Link>
      ))}
    </nav>
  );
}
