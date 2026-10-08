import { OverviewContent, overviewSections } from '@/content/overview';
import { DocPage } from './DocPage';

export function OverviewPage() {
  return (
    <DocPage
      title="System Lab design system"
      eyebrow="Overview"
      description="Tokens, components and patterns for building consistent, accessible interfaces, documented with live demos and the source that implements them."
      sections={overviewSections}
    >
      <OverviewContent />
    </DocPage>
  );
}
