import { useParams } from 'react-router';
import { Link, Text } from '@/design-system/primitives';
import { findPatternDoc, type PatternDoc } from '@/content/patterns';
import { findEntry, type CatalogEntry } from '@/domain/system';
import { paths } from '../paths';
import { DocPage } from './DocPage';
import { NotFoundPage } from './NotFoundPage';

function PatternView({ entry, doc }: { entry: CatalogEntry; doc: PatternDoc }) {
  return (
    <DocPage
      title={entry.name}
      eyebrow="Patterns"
      description={entry.summary}
      sections={doc.sections}
      meta={
        <Text variant="bodySmall" tone="muted">
          <Link href={paths.patterns}>All patterns</Link>
        </Text>
      }
    >
      <doc.Content />
    </DocPage>
  );
}

export function PatternPage() {
  const { patternId = '' } = useParams();
  const entry = findEntry(patternId);
  const doc = findPatternDoc(patternId);
  return entry?.kind === 'pattern' && doc ? <PatternView key={entry.id} entry={entry} doc={doc} /> : <NotFoundPage kind="pattern" />;
}
