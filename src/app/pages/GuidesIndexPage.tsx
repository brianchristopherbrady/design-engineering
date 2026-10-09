import { WikiIndex } from '@/content/guides';
import { DocPage } from './DocPage';

export function GuidesIndexPage() {
  return (
    <DocPage
      title="Design system wiki"
      eyebrow="Wiki"
      description="Every part of a design system, from principles to migration, in plain language. Each article explains what the part is, how to build it, and how to bring existing products along."
    >
      <WikiIndex />
    </DocPage>
  );
}
