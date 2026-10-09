import { Heading, Icon, Link, Text, VisuallyHidden } from '@/design-system/primitives';
import { recommendedSequence, sources, startingPoints, systemLayers, type SourceId } from '@/domain/planning';
import type { Article } from '../wiki/types';
import { articleHref } from '../wiki/Blocks';
import styles from '../wiki/wiki.module.css';

function Cite({ ids }: { ids: readonly SourceId[] }) {
  return (
    <p className={styles.cite}>
      {ids.length > 1 ? 'Sources: ' : 'Source: '}
      {ids.map((id, index) => {
        const source = sources.find((candidate) => candidate.id === id);
        return source ? (
          <span key={id}>
            {index > 0 && ' · '}
            <Link href={source.href}>{source.short}</Link>
          </span>
        ) : null;
      })}
    </p>
  );
}

const layerArticles: Record<string, string> = {
  'Purpose and principles': 'principles',
  'Design language': 'design-language',
  'Design tokens': 'design-tokens',
  Components: 'primitives',
  Patterns: 'patterns',
  Documentation: 'documentation',
  'People and governance': 'governance',
};

function LayerName({ name }: { name: string }) {
  const id = layerArticles[name];
  return id ? (
    <Link href={articleHref(id)} variant="standalone" className={styles.layerLink}>
      {name}
    </Link>
  ) : (
    <Text as="span" variant="label">
      {name}
    </Text>
  );
}

function Anatomy() {
  const stack = systemLayers.filter((layer) => !layer.across);
  const across = systemLayers.filter((layer) => layer.across);
  return (
    <div className={styles.anatomy}>
      <ol className={styles.stack} aria-label="Layers, from purpose to patterns">
        {stack.map((layer) => (
          <li key={layer.name} className={styles.band}>
            <div className={styles.bandText}>
              <LayerName name={layer.name} />
              <Text as="span" variant="bodySmall" tone="muted">
                {layer.short}
              </Text>
            </div>
            {layer.examples.length > 0 && (
              <ul className={styles.chips} aria-label={`${layer.name} examples`}>
                {layer.examples.map((example) => (
                  <li key={example} className={styles.chip} data-code={layer.code || undefined}>
                    {example}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      <div className={styles.across}>
        <Text as="span" variant="caption" tone="muted">
          Across every layer
        </Text>
        <ul>
          {across.map((layer) => (
            <li key={layer.name}>
              <LayerName name={layer.name} />
              <Text as="span" variant="bodySmall" tone="muted">
                {layer.short}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FirstSteps() {
  const [always, ...situational] = startingPoints;
  return (
    <>
      {always && (
        <div className={styles.always}>
          <span className={styles.alwaysIcon} aria-hidden="true">
            <Icon name="search" />
          </span>
          <div className={styles.alwaysText}>
            <Heading level={3} size="small">
              Always first: take an interface inventory
            </Heading>
            <Text variant="bodySmall">
              Screenshot one example of every button, form, color and message in every product, then sort and name them
              together. It takes a few hours and gives you {always.gain.toLowerCase()}.
            </Text>
            <Cite ids={always.sources} />
          </div>
        </div>
      )}
      <ul className={styles.situations} aria-label="What to do next, by situation">
        {situational.map((point) => (
          <li key={point.id} className={styles.situation}>
            <Text variant="bodySmall">
              <span className={styles.when}>When </span>
              {point.when}
            </Text>
            <div className={styles.firstStep}>
              <Icon name="arrowRight" />
              <Heading level={3} size="small" className={styles.situationTitle}>
                {point.title}
              </Heading>
            </div>
            <ul className={styles.tradeoffs}>
              <li data-kind="gain">
                <Icon name="check" />
                <span>
                  <VisuallyHidden>You get: </VisuallyHidden>
                  {point.gain}
                </span>
              </li>
              <li data-kind="risk">
                <Icon name="warning" />
                <span>
                  <VisuallyHidden>Watch for: </VisuallyHidden>
                  {point.risk}
                </span>
              </li>
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

function Sequence() {
  return (
    <ol className={styles.rail}>
      {recommendedSequence.map((step, index) => (
        <li key={step.title} className={styles.railStep}>
          <span className={styles.railDot} aria-hidden="true">
            {index + 1}
          </span>
          <div className={styles.railBody}>
            <Text as="span" variant="label">
              {step.title}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {step.detail}
            </Text>
            <span className={styles.produces}>
              <Icon name="arrowRight" /> {step.produces}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export const start: Article = {
  id: 'start',
  inShort: [
    'A design system is shared decisions, reusable parts, and the people who look after them.',
    'Look at what you already have before you build anything new.',
    'Work from the top down: agree the look, name it as tokens, then build components on the tokens.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What a design system is',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'A design system is everything teams share so their products look, behave and read the same way. It includes the principles behind decisions, the visual language, named values called tokens, the components and patterns built from them, the documentation, and the people who keep it all up to date.',
            'A component library on its own is not a design system, and neither is a style guide in a design tool. Without both, and without owners, it drifts out of date within months.',
          ],
        },
        {
          kind: 'visual',
          Visual: Anatomy,
          caption: 'The layers of a design system. Each builds on the ones above it. Documentation and people span all of them.',
        },
      ],
    },
    {
      id: 'begin',
      title: 'Where to begin',
      blocks: [
        { kind: 'text', paragraphs: ['Every plan starts with the same step. After that, your situation decides what comes next.'] },
        { kind: 'visual', Visual: FirstSteps },
      ],
    },
    {
      id: 'order',
      title: 'The usual order',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['The steps overlap. Engineers can set up the token build while designers agree the language, and a pilot will send you back to earlier steps.'],
        },
        { kind: 'visual', Visual: Sequence },
      ],
    },
    {
      id: 'existing',
      title: 'If you already have products',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'search', title: 'You are not starting from zero', text: 'Your products already have a visual language and components. The job is to find them, choose the best version of each and give it a name.' },
            { icon: 'refresh', title: 'Plan for old and new together', text: 'Old and new parts will run side by side for months. Plan for that instead of a single switch-over day.' },
            { icon: 'arrowRight', title: 'Move in small steps', text: 'Tokens first, then the most-used components, then patterns as teams rebuild flows.' },
          ],
        },
        { kind: 'related', ids: ['migration'] },
      ],
    },
    {
      id: 'read',
      title: 'Read in this order',
      blocks: [
        {
          kind: 'related',
          ids: ['principles', 'design-language', 'design-tokens', 'primitives', 'composites', 'patterns', 'documentation', 'governance', 'migration', 'measure', 'sharing', 'frameworks'],
        },
      ],
    },
  ],
  sources: ['inventory', 'atomic', 'tokens', 'dtcg', 'teams', 'criteria', 'lifecycle'],
};
