import { Card } from '@/design-system/composites';
import { Grid, Stack } from '@/design-system/layout';
import { Heading, Link, Text } from '@/design-system/primitives';
import { findEntry } from '@/domain/system';
import { Prose } from '@/features/docs';
import { decisionTopics } from './topics';

/** The section's landing page: each page's question and short answer. */
export function DecisionsIndex() {
  return (
    <Stack gap="extraLarge">
      <Prose>
        <p>
          The rest of this site shows what was built. These pages show the reasoning behind a design system: establishing
          requirements, evaluating alternatives, choosing what to share, and planning adoption and measurement. Examples
          are labelled as implemented in this project, hypothetical, proposed or conceptual.
        </p>
      </Prose>
      <Grid as="ul" columns={2} minColumnWidth="medium" gap="medium" aria-label="Design decisions">
        {decisionTopics.map((topic) => (
          <Card as="li" key={topic.id} padding="medium">
            <Stack gap="small">
              <Heading level={2} size="small">
                <Link href={`/decisions/${topic.id}`} variant="standalone">
                  {findEntry(topic.id)?.name}
                </Link>
              </Heading>
              <Text variant="bodySmall">
                <strong>{topic.question}</strong>
              </Text>
              <Text variant="bodySmall" tone="muted">
                {topic.answer}
              </Text>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
