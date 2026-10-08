import { useParams } from 'react-router';
import { Link, Text } from '@/design-system/primitives';
import { findFoundationTopic, type FoundationTopic } from '@/content/foundations';
import { findEntry, type CatalogEntry } from '@/domain/system';
import { paths } from '../paths';
import { DocPage } from './DocPage';
import { NotFoundPage } from './NotFoundPage';

function FoundationView({ entry, topic }: { entry: CatalogEntry; topic: FoundationTopic }) {
  return (
    <DocPage
      title={entry.name}
      eyebrow="Foundations"
      description={entry.summary}
      sections={topic.sections}
      meta={
        <Text variant="bodySmall" tone="muted">
          <Link href={paths.foundations}>All foundations</Link>
        </Text>
      }
    >
      <topic.Content />
    </DocPage>
  );
}

export function FoundationPage() {
  const { topicId = '' } = useParams();
  const topic = findFoundationTopic(topicId);
  const entry = findEntry(topicId);
  return topic && entry?.kind === 'foundation' ? (
    <FoundationView key={topic.id} entry={entry} topic={topic} />
  ) : (
    <NotFoundPage kind="foundation" />
  );
}
