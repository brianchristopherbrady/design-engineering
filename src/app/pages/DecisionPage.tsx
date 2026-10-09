import { useParams } from 'react-router';
import { findDecisionTopic, type DecisionTopic } from '@/content/decisions';
import { findEntry, type CatalogEntry } from '@/domain/system';
import { DocPage } from './DocPage';
import { NotFoundPage } from './NotFoundPage';

function DecisionView({ entry, topic }: { entry: CatalogEntry; topic: DecisionTopic }) {
  return (
    <DocPage title={entry.name} eyebrow="Design decisions" description={entry.summary} sections={topic.sections}>
      <topic.Content />
    </DocPage>
  );
}

export function DecisionPage() {
  const { decisionId = '' } = useParams();
  const topic = findDecisionTopic(decisionId);
  const entry = findEntry(decisionId);
  return topic && entry?.kind === 'decision' ? <DecisionView key={topic.id} entry={entry} topic={topic} /> : <NotFoundPage kind="design decision" />;
}
