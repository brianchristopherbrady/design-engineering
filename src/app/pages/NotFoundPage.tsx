import { PageHeader } from '@/design-system/composites';
import { Container, Inline, Stack } from '@/design-system/layout';
import { Link, Text } from '@/design-system/primitives';
import { sections } from '../paths';
import { Lens } from '../shell/Lens';
import { usePageTitle } from '../shell/usePageTitle';
import styles from './NotFoundPage.module.css';

export interface NotFoundPageProps {
  /** What was being looked for, such as "component" or "pattern". */
  kind?: string;
}

export function NotFoundPage({ kind = 'page' }: NotFoundPageProps) {
  const titleRef = usePageTitle('Page not found');
  return (
    <Container queryName="page">
      <div className={styles.layout}>
        <Stack gap="large">
          <PageHeader
            titleRef={titleRef}
            eyebrow="Error 404"
            title="Page not found"
            description={`There is no ${kind} at this address. It may have been renamed, or the link may contain a typo.`}
          />
          <Text>Try one of the main sections instead:</Text>
          <Inline as="ul" gap="large">
            {sections.map((section) => (
              <li key={section.href}>
                <Link href={section.href}>{section.label}</Link>
              </li>
            ))}
          </Inline>
        </Stack>
        <div className={styles.eye}>
          <Lens detail className={styles.lens} />
          <p className={styles.quote}>I’m sorry. I’m afraid I can’t find that.</p>
        </div>
      </div>
    </Container>
  );
}
