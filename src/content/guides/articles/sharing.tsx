import { Heading, Icon, Text, VisuallyHidden } from '@/design-system/primitives';
import type { Article } from '../wiki/types';
import styles from '../wiki/wiki.module.css';

const layers = ['Principles', 'Tokens', 'Components', 'Patterns', 'Product screens', 'Tooling', 'Governance'] as const;
type Layer = (typeof layers)[number];

const options: readonly { name: string; summary: string; shares: readonly Layer[]; good: readonly string[]; bad: readonly string[]; fits: string }[] = [
  {
    name: 'One shared library for everything',
    summary: 'Every product builds every screen from one library, including page-level patterns.',
    shares: ['Principles', 'Tokens', 'Components', 'Patterns', 'Tooling', 'Governance'],
    good: ['The most consistency for the least duplicated code.', 'One place to fix an accessibility bug.'],
    bad: ['Every product request becomes a library change, so components grow options for everyone.', 'Upgrades must be coordinated across products.'],
    fits: 'One framework, one brand, similar users and tasks, and shared release dates.',
  },
  {
    name: 'Shared core, product extensions',
    summary: 'Tokens and core components are shared; each product owns its screens and the few components only it needs.',
    shares: ['Principles', 'Tokens', 'Components', 'Tooling', 'Governance'],
    good: ['Shared behavior and accessibility where the meaning is the same.', 'Products move independently on their own screens.'],
    bad: ['Needs a clear rule for what is core and what is an extension.', 'Extensions can drift without review.'],
    fits: 'Shared controls but different workflows, densities or brands, and an owner for the core.',
  },
  {
    name: 'Shared language and tokens only',
    summary: 'Principles, tokens and guidelines are shared; each platform builds its own components.',
    shares: ['Principles', 'Tokens', 'Tooling'],
    good: ['Works across native apps and the web.', 'Each platform follows its own conventions.'],
    bad: ['Behavior and accessibility are built and tested more than once.', 'Keeping platforms in step needs active review.'],
    fits: 'Different platforms, such as a native app and a web app, or frameworks that cannot share code.',
  },
  {
    name: 'Separate systems',
    summary: 'Each product has its own system. Some principles may be agreed jointly.',
    shares: ['Principles'],
    good: ['No coordination cost.', 'Each system fits its product exactly.'],
    bad: ['Everything is built and maintained twice.', 'People who use both products see the same task work differently.'],
    fits: 'Products with different users, brands, platforms and teams, and little shared work.',
  },
];

function SharingOptions() {
  return (
    <ul className={styles.options}>
      {options.map((option) => (
        <li key={option.name} className={styles.option}>
          <Heading level={3} size="small">
            {option.name}
          </Heading>
          <Text variant="bodySmall" tone="muted">
            {option.summary}
          </Text>
          <ul className={styles.chips} aria-label="What is shared">
            {layers.map((layer) => {
              const shared = option.shares.includes(layer);
              return (
                <li key={layer} className={styles.chip} data-off={shared ? undefined : true}>
                  {layer}
                  <VisuallyHidden>{shared ? ': shared' : ': not shared'}</VisuallyHidden>
                </li>
              );
            })}
          </ul>
          <div className={styles.optionTradeoffs}>
            <ul className={styles.tradeoffs} aria-label="Benefits">
              {option.good.map((item) => (
                <li key={item} data-kind="gain">
                  <Icon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <ul className={styles.tradeoffs} aria-label="Costs">
              {option.bad.map((item) => (
                <li key={item} data-kind="risk">
                  <Icon name="warning" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Text variant="bodySmall" className={styles.optionFit}>
            <strong>Fits when:</strong> {option.fits}
          </Text>
        </li>
      ))}
    </ul>
  );
}

export const sharing: Article = {
  id: 'sharing',
  inShort: [
    '“Should our products share a design system?” is really several questions, one per layer.',
    'Most organizations share tokens and core components, and let each product own its screens.',
    'Brand, theme, density, screen size and input are separate settings, not one “consumer or professional” switch.',
  ],
  sections: [
    {
      id: 'layers',
      title: 'Sharing, layer by layer',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['Two products can share principles and tokens but not components, or components but not screens. Each layer has its own costs.'],
        },
        {
          kind: 'table',
          caption: 'What can be shared',
          columns: ['Layer', 'What it is'],
          rows: [
            ['Principles', 'What the products value, and how they settle trade-offs.'],
            ['Tokens', 'Named color, type, space, shape and motion decisions.'],
            ['Components', 'The code that draws controls and makes them behave.'],
            ['Patterns', 'How tasks such as filtering, selecting and recovering from errors work.'],
            ['Product screens', 'Screens and flows put together for one product’s users.'],
            ['Tooling', 'Token builds, lint rules, documentation, tests and design libraries.'],
            ['Governance', 'Ownership, contribution, releases, support and retirement.'],
          ],
        },
      ],
    },
    {
      id: 'options',
      title: 'Four ways to share',
      blocks: [{ kind: 'visual', Visual: SharingOptions, caption: 'Crossed-out layers are not shared in that option.' }],
    },
    {
      id: 'concerns',
      title: 'Separate settings, not two bundles',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Take a consumer app people use a few times a year, and a professional tool staff use all day. It is tempting to treat “consumer” and “professional” as two bundles of settings. They are not: each of these varies on its own.',
          ],
        },
        {
          kind: 'table',
          caption: 'Five settings and what handles each',
          columns: ['Setting', 'Consumer app', 'Professional tool', 'Handled by'],
          rows: [
            ['Brand', 'Warm, rounder controls', 'Restrained, tighter corners', 'Product token overrides, limited to brand colors and shape'],
            ['Theme', 'Light or dark, following the device', 'Light or dark, chosen by each person', 'A theme mode, separate from the product'],
            ['Density', 'Comfortable everywhere', 'Comfortable forms; compact tables when people choose it', 'A density mode chosen per screen or area'],
            ['Screen size', 'From a 320-pixel phone to a wide desktop', 'Mostly wide desktops, sometimes a narrow side panel', 'Components that respond to the space they are given'],
            ['Input', 'Touch on phones, mouse and keyboard on desktops', 'Keyboard first, with repeated actions', 'Product-owned patterns on shared, keyboard-ready controls'],
          ],
        },
      ],
    },
    {
      id: 'split',
      title: 'A split that usually works',
      blocks: [
        {
          kind: 'table',
          caption: 'What to share, what each product owns, and what to leave unshared',
          columns: ['What', 'Where it lives', 'Why'],
          rows: [
            ['Tokens, themes and the token build', 'Shared', 'One source; products override brand and shape only.'],
            ['Buttons, fields, selection controls, alerts and dialogs', 'Shared', 'The same behavior and accessibility in every product.'],
            ['Loading, error and retry states', 'Shared', 'One approach; each product writes its own messages.'],
            ['Guided steps and large choice cards', 'Consumer app', 'Built for occasional, guided use on any screen size.'],
            ['Tables, filters, selection and bulk actions', 'Professional tool', 'Built for repeated, keyboard-heavy work.'],
            ['Layout, flow, wording and defaults', 'Each product', 'These are workflow decisions, not tokens.'],
            ['A data table for both', 'Not shared', 'Consumers see a short list of their own items as cards; staff need sortable columns. One component would carry options neither needs.'],
          ],
        },
      ],
    },
    {
      id: 'existing',
      title: 'In existing products',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Share tokens first', text: 'Shared tokens with product overrides are the cheapest step, and every option on this page needs them.' },
            { title: 'Pilot one workflow in each product', text: 'Building the same kind of task in two products shows quickly what can be shared and what cannot.' },
            { title: 'Promote, do not merge', text: 'When two products have built the same component, choose one, improve it and move it into the shared core. Retire the other.' },
            { title: 'Revisit the split yearly', text: 'Products change. What made sense to keep separate may be worth sharing later, and the other way round.' },
          ],
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      blocks: [
        {
          kind: 'checklist',
          items: [
            'You have decided, layer by layer, what is shared.',
            'Brand, theme, density, screen size and input are separate settings.',
            'There is a rule for what belongs in the shared core.',
            'There is a way to promote a product component into the core.',
            'A pilot in two products has tested the split.',
          ],
        },
      ],
    },
  ],
};
