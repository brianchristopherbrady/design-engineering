import { Heading, Link, Text } from '@/design-system/primitives';
import { findEntry } from '@/domain/system';
import { guideGroups } from './topics';
import { articleHref } from './wiki/Blocks';
import styles from './wiki/wiki.module.css';

const offsets = guideGroups.map((_, index) => guideGroups.slice(0, index).reduce((total, group) => total + group.ids.length, 0));

/** The wiki's home: every article, grouped and numbered in reading order. */
export function WikiIndex() {
  return (
    <div className={styles.index}>
      {guideGroups.map((group, groupIndex) => (
        <section key={group.heading} className={styles.indexGroup} aria-labelledby={`wiki-group-${groupIndex}`}>
          <Heading level={2} size="small" id={`wiki-group-${groupIndex}`}>
            {group.heading}
          </Heading>
          <ol className={styles.indexList} start={(offsets[groupIndex] ?? 0) + 1}>
            {group.ids.map((id, index) => {
              const entry = findEntry(id);
              return entry ? (
                <li key={id} className={styles.indexItem}>
                  <span className={styles.indexNumber} aria-hidden="true">
                    {(offsets[groupIndex] ?? 0) + index + 1}
                  </span>
                  <div className={styles.indexText}>
                    <Link href={articleHref(id)} variant="standalone" className={styles.indexLink}>
                      {entry.name}
                    </Link>
                    <Text as="span" variant="bodySmall" tone="muted">
                      {entry.summary}
                    </Text>
                  </div>
                </li>
              ) : null;
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
