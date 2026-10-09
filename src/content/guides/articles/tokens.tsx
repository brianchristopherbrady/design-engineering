import { Icon } from '@/design-system/primitives';
import type { Article } from '../wiki/types';
import styles from '../wiki/wiki.module.css';

const chains = [
  { label: 'Color', marker: 'swatch', option: 'gray-600', decision: 'text-muted', component: 'field-help-text' },
  { label: 'Space', marker: 'space', option: 'space-12', decision: 'space-inset-md', component: 'button-padding-inline' },
] as const;

function TokenTiers() {
  return (
    <div className={styles.tiers}>
      {chains.map((chain) => (
        <ol key={chain.label} className={styles.tierRow} aria-label={`${chain.label}: from option to component`}>
          <li className={styles.tierCell}>
            <span className={styles.tierName}>Option</span>
            <span className={chain.marker === 'swatch' ? styles.swatch : styles.spaceBar} aria-hidden="true" />
            <code>{chain.option}</code>
          </li>
          <li className={styles.tierArrow} aria-hidden="true">
            <Icon name="arrowRight" />
          </li>
          <li className={styles.tierCell}>
            <span className={styles.tierName}>Decision</span>
            <code>{chain.decision}</code>
          </li>
          <li className={styles.tierArrow} aria-hidden="true">
            <Icon name="arrowRight" />
          </li>
          <li className={styles.tierCell}>
            <span className={styles.tierName}>Component</span>
            <code>{chain.component}</code>
          </li>
        </ol>
      ))}
    </div>
  );
}

export const tokens: Article = {
  id: 'design-tokens',
  inShort: [
    'A token is a named design decision. Components use the name, never the raw value.',
    'Name the options first, then the decisions that use them.',
    'Store tokens once, in a standard format, and generate everything else from that source.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What a token is',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'A design token is a name for a design decision, such as `text-muted` for the color of secondary text. Components use the name. Change the value once, and everything that uses the name changes with it.',
            'Tokens usually come in tiers. Each tier points at the one before it, so you can make a change at the right level.',
          ],
        },
        { kind: 'visual', Visual: TokenTiers, caption: 'Each tier points at the one before it. Components read decisions and their own component tokens, never options directly.' },
        {
          kind: 'table',
          caption: 'The three tiers',
          columns: ['Tier', 'What it names', 'Example', 'Who uses it'],
          rows: [
            ['Options', 'The values available: the palette and scales', '`gray-600`, `space-12`', 'Other tokens only'],
            ['Decisions', 'What a value is for', '`text-muted`, `surface-raised`', 'Components and layouts'],
            ['Component', 'One component’s own decision', '`button-padding-inline`', 'That component only'],
          ],
        },
      ],
    },
    {
      id: 'why',
      title: 'Why they matter',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'refresh', title: 'Change once', text: 'A new brand color is one edit, not a search through every stylesheet.' },
            { icon: 'star', title: 'Themes and modes', text: 'Dark mode, a second brand or a compact layout is a second set of values for the same names.' },
            { icon: 'check', title: 'One vocabulary', text: 'Designers and engineers say `surface-raised` and mean the same thing.' },
          ],
        },
      ],
    },
    {
      id: 'how',
      title: 'How to create them',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Name the options', text: 'Turn the design language into a palette and scales, such as `blue-600` and `space-16`.' },
            { title: 'Name the decisions', text: 'Give each job a name that points at an option: `action-primary` points at `blue-600`.' },
            { title: 'Start with color and type', text: 'Then add space, radius, shadows and motion. Do not stop at color.' },
            { title: 'Keep one source', text: 'Store tokens where design tools and code can both read them. The Design Tokens Community Group format (DTCG) reached its first stable version in 2025.' },
            { title: 'Generate the outputs', text: 'A build turns the source into CSS variables, files for each platform and design-tool variables. Nobody edits the outputs by hand.' },
            { title: 'Add modes', text: 'Light and dark themes, brands and densities are alternative values for the same decision names.' },
            { title: 'Write the rules, and enforce them', text: 'Say which tier may use which, and make the build fail when someone breaks a rule.' },
          ],
        },
      ],
    },
    {
      id: 'naming',
      title: 'Naming tokens',
      blocks: [
        {
          kind: 'doDont',
          items: [
            { dont: '`text-gray`: named after how it looks.', do: '`text-muted`: named after its job. In dark mode it may not be gray.' },
            { dont: 'A button that uses `blue-600` directly.', do: 'The button uses `action-primary`, which points at `blue-600`.' },
            { dont: 'A token for every one-off value.', do: 'Used three times? It is probably a token. Used once? Leave it in the component.' },
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
            { title: 'Count the raw values', text: 'Search each codebase for hex colors, pixel sizes and font declarations. Keep the counts as your starting point.' },
            { title: 'Map values to tokens', text: 'Point each raw value at the nearest token, and merge near-duplicates.' },
            { title: 'Add tokens beside the old styles', text: 'Ship the token CSS variables without changing anything else. Nothing breaks.' },
            { title: 'Replace values file by file', text: 'Start with the most-used files. Screens should look the same afterwards, so compare screenshots.' },
            { title: 'Stop new raw values', text: 'Add a lint rule that fails on new raw values but only reports the old ones.' },
            { title: 'Make the rule strict', text: 'When the old count reaches zero, make the lint fail on every raw value.' },
          ],
        },
        {
          kind: 'note',
          title: 'A token migration should be invisible',
          text: 'If screens change, either a value was mapped to the wrong token, or the design changed at the same time. Keep those two changes separate.',
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
            'Every token’s name says its job.',
            'Components use decision or component tokens, never options directly.',
            'There is one source, and the outputs are generated from it.',
            'Every theme and mode defines every decision token.',
            'A lint rule blocks new raw values.',
          ],
        },
      ],
    },
  ],
  sources: ['tokens', 'dtcg'],
};
