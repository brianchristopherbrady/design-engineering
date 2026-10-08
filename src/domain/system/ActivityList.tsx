import { Badge } from '@/design-system/primitives';
import type { Tone } from '@/design-system/tokens';
import { activityKindLabels, formatDate, type ActivityEvent, type ActivityKind } from './activity';
import type { CatalogEntry } from './catalog';
import styles from './ActivityList.module.css';

const tones: Record<ActivityKind, Tone> = { added: 'success', changed: 'brand', fixed: 'warning', documented: 'info' };

export interface ActivityListProps {
  events: readonly ActivityEvent[];
  /** Resolves an event's entry, so the list can name it. */
  entryFor: (id: string) => CatalogEntry | undefined;
  /** Hide the entry name when every event belongs to the same entry. */
  showEntry?: boolean;
}

/** A dated list of changes. Each item states its kind in text; the badge tone only repeats it. */
export function ActivityList({ events, entryFor, showEntry = true }: ActivityListProps) {
  return (
    <ol className={styles.list}>
      {events.map((event) => (
        <li key={event.id} className={styles.item}>
          <Badge tone={tones[event.kind]} size="small" className={styles.kind}>
            {activityKindLabels[event.kind]}
          </Badge>
          <p className={styles.summary}>
            {showEntry && <strong>{entryFor(event.entryId)?.name ?? event.entryId}: </strong>}
            {event.summary}
          </p>
          <time dateTime={event.date} className={styles.date}>
            {formatDate(event.date)}
          </time>
        </li>
      ))}
    </ol>
  );
}
