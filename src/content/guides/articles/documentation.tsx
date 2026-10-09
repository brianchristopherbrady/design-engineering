import { Text } from '@/design-system/primitives';
import type { Article } from '../wiki/types';
import styles from '../wiki/wiki.module.css';

const pageParts = [
  { name: 'Purpose', detail: 'What it is for, in one sentence.' },
  { name: 'When to use it', detail: 'And when to use something else instead.' },
  { name: 'Live examples', detail: 'The real component, with code people can copy.' },
  { name: 'Props', detail: 'Generated from the code, so it is always current.' },
  { name: 'States', detail: 'Every state, shown side by side.' },
  { name: 'Accessibility', detail: 'Keyboard keys, what screen readers announce, and what was tested.' },
  { name: 'Do and don’t', detail: 'Common mistakes, with the better choice.' },
  { name: 'Status and changes', detail: 'Its maturity label and a list of recent changes.' },
];

function PageOutline() {
  return (
    <ol className={styles.outline} aria-label="Sections of a component page">
      {pageParts.map((part) => (
        <li key={part.name}>
          <Text as="span" variant="label">
            {part.name}
          </Text>
          <Text as="span" variant="bodySmall" tone="muted">
            {part.detail}
          </Text>
        </li>
      ))}
    </ol>
  );
}

export const documentation: Article = {
  id: 'documentation',
  inShort: [
    'Good documentation answers four questions: what is it for, when should I not use it, how do I use it, and does it work for everyone?',
    'Show live examples, not screenshots.',
    'Generate reference tables from the code, so they cannot go out of date.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What it is',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['Documentation is how people learn the system without asking its owners. Every component, pattern and set of tokens needs a page that people can find, trust and copy from.'],
        },
        { kind: 'visual', Visual: PageOutline, caption: 'What a component page usually contains, from top to bottom.' },
      ],
    },
    {
      id: 'why',
      title: 'Why it matters',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'search', title: 'People use what they can find', text: 'A component nobody can find is a component that gets rebuilt.' },
            { icon: 'refresh', title: 'Fewer repeated questions', text: 'Owners spend their time improving the system, not answering the same question again.' },
            { icon: 'check', title: 'Trust', text: 'Honest notes about what was tested make people rely on what was.' },
          ],
        },
      ],
    },
    {
      id: 'how',
      title: 'How to write it',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Lead with the task', text: 'Start each page with what the part is for, and when to use something else.' },
            { title: 'Show it working', text: 'Show the real component, with code people can copy.' },
            { title: 'Generate the reference', text: 'Build props tables from the component’s types and token tables from the token build, so they change when the code changes.' },
            { title: 'Map design to code', text: 'Use the same names in the design tool and in code, and keep a table of how one maps to the other.' },
            { title: 'Label the status', text: 'Mark each part as experimental, beta, stable or deprecated.' },
            { title: 'Be honest about testing', text: 'Say what was tested, how, and what was not.' },
          ],
        },
      ],
    },
    {
      id: 'mapping',
      title: 'Mapping design to code',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['When a designer’s component properties and an engineer’s props use the same words, handoff needs no translation. Write the mapping down for each component.'],
        },
        {
          kind: 'table',
          caption: 'Example: one button, in a design tool and in code',
          columns: ['Design tool', 'Code', 'Note'],
          rows: [
            ['Variant: Primary', '`appearance="primary"`', 'The same word on both sides.'],
            ['Size: Large', '`size="large"`', 'The same scale of sizes.'],
            ['State: Disabled', '`disabled`', 'A native attribute, not a style.'],
            ['Icon before label', '`iconStart`', 'A slot for an icon, not a separate component.'],
            ['State: Hover', 'None', 'The browser handles hover, so no prop is needed.'],
          ],
        },
      ],
    },
    {
      id: 'examples',
      title: 'Good and bad examples',
      blocks: [
        {
          kind: 'doDont',
          items: [
            { dont: 'Screenshots of components.', do: 'Live examples that change when the code changes.' },
            { dont: '“Accessible.”', do: '“Tested with a keyboard, automated checks and a screen reader on Windows. Not yet tested on macOS.”' },
            { dont: 'A props table typed by hand.', do: 'A props table generated from the component’s types.' },
          ],
        },
      ],
    },
    {
      id: 'existing',
      title: 'In existing products',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'arrowRight', title: 'Document the way out', text: 'For each old component, say what replaces it and how to switch, with code before and after.' },
            { icon: 'search', title: 'Link from where people already look', text: 'Add links from the old component’s code comments and the design library to the new pages.' },
            { icon: 'check', title: 'Publish progress', text: 'A page per product showing what has moved and what has not helps teams plan their work.' },
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
            'Every part has a page with its purpose and when not to use it.',
            'Examples are live, with code people can copy.',
            'Props and token tables are generated from the code.',
            'Design-tool names match the code.',
            'Each page has a maturity label and says what was tested.',
          ],
        },
      ],
    },
  ],
  sources: ['tokens', 'lifecycle'],
};
