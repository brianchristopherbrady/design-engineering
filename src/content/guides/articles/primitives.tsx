import type { ReactNode } from 'react';
import { Badge, Button, Checkbox, Input, Link, Switch } from '@/design-system/primitives';
import type { Article } from '../wiki/types';
import styles from '../wiki/wiki.module.css';

const specimens: readonly { name: string; element: string; render: () => ReactNode }[] = [
  { name: 'Button', element: '<button>', render: () => <Button appearance="primary">Save</Button> },
  { name: 'Secondary button', element: '<button>', render: () => <Button>Cancel</Button> },
  { name: 'Text input', element: '<input>', render: () => <Input aria-label="Example text input" placeholder="Search" /> },
  { name: 'Checkbox', element: '<input type="checkbox">', render: () => <Checkbox label="Remember me" defaultChecked /> },
  { name: 'Switch', element: '<input type="checkbox">', render: () => <Switch label="Alerts" defaultChecked /> },
  { name: 'Badge', element: '<span>', render: () => <Badge tone="success">Active</Badge> },
  { name: 'Link', element: '<a>', render: () => <Link href="#what">Read more</Link> },
];

function Specimens() {
  return (
    <ul className={styles.specimens}>
      {specimens.map((specimen) => (
        <li key={specimen.name} className={styles.specimen}>
          <div className={styles.specimenStage}>{specimen.render()}</div>
          <span className={styles.specimenName}>
            {specimen.name}
            <code>{specimen.element}</code>
          </span>
        </li>
      ))}
    </ul>
  );
}

export const primitives: Article = {
  id: 'primitives',
  inShort: [
    'Primitives are the smallest reusable parts, such as buttons, inputs, checkboxes and links.',
    'Build each one on the native HTML element, and design every state before release.',
    'Build the most duplicated ones first.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What primitives are',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['Primitives each do one job and are used everywhere. They make no assumptions about the page around them.'],
        },
        { kind: 'visual', Visual: Specimens, caption: 'Live primitives from this site’s own system. Each is a native HTML element underneath.' },
      ],
    },
    {
      id: 'why',
      title: 'Why they matter',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'star', title: 'Used the most', text: 'A fix to the button reaches every screen that has one.' },
            { icon: 'check', title: 'Accessibility in one place', text: 'Keyboard and screen-reader behavior is solved once, not on every screen.' },
            { icon: 'arrowRight', title: 'The base for everything else', text: 'Composite components and patterns are built from primitives.' },
          ],
        },
      ],
    },
    {
      id: 'how',
      title: 'How to build them',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Pick from the inventory', text: 'Start with what is duplicated most, usually the button, text input, select, checkbox, radio button and link.' },
            { title: 'Start from the native element', text: 'A button is a `<button>`; a checkbox is an `<input type="checkbox">`. Native elements bring keyboard, focus and screen-reader support with them.' },
            { title: 'Design every state', text: 'Default, hover, focus, pressed, disabled, invalid, loading and read-only, all designed before release.' },
            { title: 'Use tokens only', text: 'No raw colors or sizes inside a component.' },
            { title: 'Keep the API small', text: 'Use a few props with clear names, such as one `appearance` prop instead of several true-or-false switches.' },
            { title: 'Test before calling it stable', text: 'Test with a keyboard, run automated accessibility checks and try it with a screen reader.' },
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
            { dont: 'A `<div>` with a click handler, styled to look like a button.', do: 'A `<button>` styled with tokens. It works with a keyboard without extra code.' },
            { dont: '`isPrimary`, `isDanger` and `isLarge`, which can contradict each other.', do: '`appearance="primary"` and `size="large"`: one value for each.' },
            { dont: 'Removing the focus outline because it looks noisy.', do: 'A visible focus ring from a token, in every theme.' },
            { dont: 'A click area the size of a small icon.', do: 'Targets of at least 24 by 24 CSS pixels, as WCAG 2.2 requires, and larger on touch screens.' },
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
            { title: 'Count the look-alikes', text: 'Find every local button, input and checkbox component, and every raw `<button>` with custom styles.' },
            { title: 'Replace one primitive at a time', text: 'Swap every button in a product before moving on to inputs, instead of going screen by screen. Reviews are simpler, and the count drops visibly.' },
            { title: 'Use an adapter when there are many uses', text: 'Keep the old component’s name and props, and render the new primitive inside it. The places that use it can change later.' },
            { title: 'Compare screenshots', text: 'Comparing screenshots before and after catches spacing and color changes you did not intend.' },
            { title: 'Delete the old component', text: 'The migration is finished when the old code is gone, not when the imports change.' },
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
            'Built on the native element.',
            'Every state is designed and built.',
            'Uses tokens only.',
            'Keyboard, contrast and target-size checks pass.',
            'Documented with examples, props and accessibility notes.',
          ],
        },
      ],
    },
  ],
  sources: ['inventory', 'wcag'],
};
