import { Icon, Text, type IconName } from '@/design-system/primitives';
import type { Article } from '../wiki/types';
import styles from '../wiki/wiki.module.css';

const listStates: readonly { name: string; icon: IconName; tone?: string; message: string }[] = [
  { name: 'Loading', icon: 'refresh', message: 'Placeholders where the items will appear.' },
  { name: 'Empty', icon: 'info', tone: 'brand', message: '“No projects yet. Create your first project.”' },
  { name: 'No results', icon: 'search', message: '“No projects match ‘budget’. Clear the search.”' },
  { name: 'Error', icon: 'warning', tone: 'danger', message: '“We couldn’t load your projects. Try again.”' },
  { name: 'Success', icon: 'check', tone: 'success', message: 'The list, with a count: “12 projects”.' },
];

function ListStates() {
  return (
    <ul className={styles.states}>
      {listStates.map((state) => (
        <li key={state.name} className={styles.state} data-tone={state.tone}>
          <Text as="span" variant="label">
            <Icon name={state.icon} /> {state.name}
          </Text>
          <Text as="span" variant="bodySmall" tone="muted" className={styles.stateMessage}>
            {state.message}
          </Text>
        </li>
      ))}
    </ul>
  );
}

export const patterns: Article = {
  id: 'patterns',
  inShort: [
    'A pattern is a proven way to solve a task people repeat, not a single component.',
    'It covers every state, including loading, empty and failure.',
    'The words are part of it: headings, button labels and error messages.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What patterns are',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'A pattern describes how to solve a task people do again and again: signing in, searching, filtering a list, filling in a form, recovering from an error. It says which components to use, in what order, what to say, and how to handle each state.',
          ],
        },
        { kind: 'visual', Visual: ListStates, caption: 'A list has more than one state. A list pattern designs all five, with the words for each.' },
      ],
    },
    {
      id: 'why',
      title: 'Why they matter',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'check', title: 'People learn it once', text: 'The same task works the same way in every product.' },
            { icon: 'warning', title: 'No forgotten states', text: 'Empty, error and partial states are designed up front, not left to the last day.' },
            { icon: 'arrowRight', title: 'Faster delivery', text: 'Teams put together a known solution instead of inventing a new one.' },
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
            { title: 'Find the tasks people repeat', text: 'Use the inventory and support requests: signing in, searching, filtering, creating, editing, deleting, uploading.' },
            { title: 'Compare today’s versions', text: 'Put each product’s version side by side. Keep the best one, or combine the best parts.' },
            { title: 'Design every state', text: 'Loading, empty, no results, error, partly successful and successful.' },
            { title: 'Write the words', text: 'Headings, button labels, help text and error messages, in your product’s voice.' },
            { title: 'Build it with system components', text: 'If the pattern needs a component the system lacks, that is a sign to add one.' },
            { title: 'Say when not to use it', text: 'Every pattern has cases where it is the wrong choice. Write them down.' },
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
            { dont: 'An empty list that says “No data.”', do: 'Say why it is empty and what to do next, with one clear action.' },
            { dont: 'A failed form submission that clears the form.', do: 'Keep every answer, list the problems at the top and link each one to its field.' },
            { dont: 'A bulk action that silently fails for some items.', do: 'Report what happened to each item, and keep the failed items selected so people can try again.' },
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
            { icon: 'refresh', title: 'Adopt patterns when a flow is rebuilt', text: 'Patterns change behavior as well as looks, so adopt them when a team is rebuilding a flow anyway.' },
            { icon: 'warning', title: 'Fix the riskiest states first', text: 'Error recovery and empty states are often missing. Adding them pays off even before a full migration.' },
            { icon: 'search', title: 'Measure before and after', text: 'Task completion and error rates show whether the pattern helped.' },
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
            'Every state is designed and built.',
            'The words are written, not placeholders.',
            'Uses only system components, or asks for new ones.',
            'Says when to use it and when not to.',
            'Can be completed with a keyboard from start to finish.',
          ],
        },
      ],
    },
  ],
  sources: ['inventory', 'atomic'],
};
