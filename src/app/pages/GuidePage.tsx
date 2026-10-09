import { useParams } from 'react-router';
import { Link, Text } from '@/design-system/primitives';
import { ArticlePager, findGuideTopic, type GuideTopic } from '@/content/guides';
import { findEntry, type CatalogEntry } from '@/domain/system';
import { paths } from '../paths';
import { DocPage } from './DocPage';
import { NotFoundPage } from './NotFoundPage';

function GuideView({ entry, topic }: { entry: CatalogEntry; topic: GuideTopic }) {
  return (
    <DocPage
      title={entry.name}
      eyebrow={`Wiki · ${topic.group}`}
      description={entry.summary}
      sections={topic.sections}
      meta={
        <Text variant="bodySmall" tone="muted">
          <Link href={paths.guides}>All articles</Link>
        </Text>
      }
    >
      <topic.Content />
      <ArticlePager id={topic.id} />
    </DocPage>
  );
}

export function GuidePage() {
  const { guideId = '' } = useParams();
  const topic = findGuideTopic(guideId);
  const entry = findEntry(guideId);
  return topic && entry?.kind === 'guide' ? <GuideView key={topic.id} entry={entry} topic={topic} /> : <NotFoundPage kind="guide" />;
}
