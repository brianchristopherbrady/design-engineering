import { DecisionsIndex } from '@/content/decisions';
import { DocPage } from './DocPage';

export function DecisionsIndexPage() {
  return (
    <DocPage
      title="Design decisions"
      eyebrow="Reasoning"
      description="How I determine what a design system should solve, what should be shared, and how to validate the result."
    >
      <DecisionsIndex />
    </DocPage>
  );
}
