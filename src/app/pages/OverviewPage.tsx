import { ExploreButtonLink, OverviewContent, overviewSections } from '@/content/overview';
import { appName, author } from '../paths';
import { DocPage } from './DocPage';

export function OverviewPage() {
  return (
    <DocPage
      title={appName}
      eyebrow="Overview"
      description="A working design system by Brian Brady. Explore its shared design decisions, tokens, components, and interface patterns, and see how those same building blocks create this website."
      actions={<ExploreButtonLink />}
      sections={overviewSections}
    >
      <OverviewContent author={author} />
    </DocPage>
  );
}
