import { OverviewContent, overviewSections } from '@/content/overview';
import { appName, author } from '../paths';
import { DocPage } from './DocPage';

export function OverviewPage() {
  return (
    <DocPage
      title={appName}
      eyebrow="Overview"
      description="A design system and the website that documents it, built by Brian Brady to show design-system judgment and implementation: tokens, components and patterns you can inspect down to the source."
      sections={overviewSections}
    >
      <OverviewContent author={author} />
    </DocPage>
  );
}
