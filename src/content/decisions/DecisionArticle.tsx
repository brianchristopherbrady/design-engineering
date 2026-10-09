import { Disclosure } from '@/design-system/composites';
import { Stack } from '@/design-system/layout';
import { Text } from '@/design-system/primitives';
import { DocSection } from '@/features/docs';
import { BlockView, Rich, Sources } from './Blocks';
import type { Decision } from './types';
import styles from './decisions.module.css';

export const decisionSections = (decision: Decision) => decision.sections.map((section) => ({ id: section.id, label: section.title }));

/** The question this page answers, and the short answer, before any reasoning. */
export function QuestionAnswer({ decision }: { decision: Decision }) {
  return (
    <section className={styles.answer} aria-labelledby={`${decision.id}-question`}>
      <Text as="span" variant="caption" tone="muted">
        The question
      </Text>
      <Text as="p" variant="lead" id={`${decision.id}-question`} className={styles.question}>
        {decision.question}
      </Text>
      <Text as="span" variant="caption" tone="muted">
        Short answer
      </Text>
      <Text as="p">
        <Rich text={decision.answer} />
      </Text>
    </section>
  );
}

export function DecisionArticle({ decision }: { decision: Decision }) {
  return (
    <div className={styles.article}>
      <Stack gap="extraLarge">
        <QuestionAnswer decision={decision} />
        {decision.sections.map((section) => (
          <DocSection key={section.id} id={section.id} title={section.title}>
            {section.blocks.map((block, index) => (
              <BlockView key={index} block={block} />
            ))}
          </DocSection>
        ))}
        {decision.sources?.length ? (
          <Disclosure summary="Sources">
            <Sources ids={decision.sources} />
          </Disclosure>
        ) : null}
      </Stack>
    </div>
  );
}

export function decisionContent(decision: Decision) {
  return function DecisionContent() {
    return <DecisionArticle decision={decision} />;
  };
}
