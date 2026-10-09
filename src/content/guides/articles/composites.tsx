import { Field } from '@/design-system/composites';
import { Input, Text } from '@/design-system/primitives';
import type { Article } from '../wiki/types';
import styles from '../wiki/wiki.module.css';

const parts = [
  { name: 'Label', detail: 'Names the input. Clicking it moves focus to the input.' },
  { name: 'Help text', detail: 'Connected to the input, so screen readers read it after the label.' },
  { name: 'Input', detail: 'The primitive, unchanged.' },
  { name: 'Error message', detail: 'Connected to the input, which is marked invalid, so the error is announced.' },
];

function FieldAnatomy() {
  return (
    <div className={styles.anatomyDemo}>
      <Field label="Email address" description="We send the receipt here." error="Enter an email address, like name@example.com.">
        {(control) => <Input {...control} type="email" defaultValue="name@" />}
      </Field>
      <ol className={styles.parts} aria-label="Parts of the form field">
        {parts.map((part) => (
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
    </div>
  );
}

export const composites: Article = {
  id: 'composites',
  inShort: [
    'Composite components combine primitives into one unit that behaves as a whole.',
    'They handle the hard parts: focus, keyboard behavior and structure.',
    'Leave room for content through slots, instead of adding a prop for every case.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What composite components are',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'A composite combines primitives into something bigger that behaves as one. A form field joins a label, an input, help text and an error message. A dialog manages focus, a title and its actions. Tabs keep a row of tabs and their panels in step.',
          ],
        },
        { kind: 'visual', Visual: FieldAnatomy, caption: 'A live form field from this site’s system, and the four parts it joins together.' },
      ],
    },
    {
      id: 'why',
      title: 'Why they matter',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'check', title: 'Hard behavior, done once', text: 'Trapping focus, arrow-key navigation and error announcements are easy to get wrong in every product.' },
            { icon: 'star', title: 'The same structure everywhere', text: 'Every form field has its label, help and error in the same place.' },
            { icon: 'info', title: 'Accessible names built in', text: 'The field connects its label and error to the input, so screen readers read them.' },
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
            { title: 'Build from your primitives', text: 'A dialog’s buttons are your Button; a field’s input is your Input.' },
            { title: 'Follow the expected keyboard behavior', text: 'Tabs, menus, dialogs and comboboxes have established keyboard patterns. The ARIA Authoring Practices Guide describes them.' },
            { title: 'Decide where focus goes', text: 'When it opens, when it closes, after an error and after an item is removed.' },
            { title: 'Use slots for content', text: 'Accept content such as a title, body and actions, instead of a prop for every layout.' },
            { title: 'Keep data out', text: 'A composite shows what it is given. Product code loads and saves the data.' },
            { title: 'Test the interaction', text: 'Write tests that use the keyboard, and check where focus lands.' },
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
            { dont: 'A dialog that leaves focus on the page behind it.', do: 'Focus moves into the dialog, and returns to the button that opened it when it closes.' },
            { dont: 'Fifteen props to cover every possible layout.', do: 'Slots for content, and a few props for behavior.' },
            { dont: 'A table component that loads its own data.', do: 'Data comes in through props; the product decides how to load it.' },
          ],
        },
      ],
    },
    {
      id: 'existing',
      title: 'In existing products',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['Composites are where products differ most, because each team solved focus and layout in its own way.'],
        },
        {
          kind: 'steps',
          items: [
            { title: 'Migrate the primitives first', text: 'A dialog built from old buttons inherits their bugs.' },
            { title: 'Replace a whole composite at once', text: 'Mixing an old dialog frame with new content causes focus bugs. Swap the whole thing.' },
            { title: 'List what people rely on', text: 'Before switching, write down the shortcuts and focus behavior people use today, and keep them or announce the change.' },
            { title: 'Retire product variants', text: 'If a product needs a variant the system lacks, request it or log an exception. Do not copy and edit the system component.' },
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
            'Built only from system primitives.',
            'Keyboard behavior matches the expected pattern.',
            'Focus is placed and returned on purpose.',
            'No data loading inside the component.',
            'Content goes in slots, not one prop per layout.',
          ],
        },
      ],
    },
  ],
  sources: ['apg', 'wcag'],
};
