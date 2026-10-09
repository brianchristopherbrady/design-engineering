import type { Article } from '../wiki/types';

export const frameworks: Article = {
  id: 'frameworks',
  inShort: [
    'Tokens and CSS work with any framework; component code is what ties a system to one.',
    'One framework? Build components for it, but keep tokens and CSS independent of it.',
    'Several frameworks? Build interactive controls once as Web Components, with thin wrappers for each framework.',
  ],
  sections: [
    {
      id: 'what',
      title: 'The problem',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Large organizations rarely use a single front-end framework. One product uses React, another uses Angular, and some pages are rendered on the server without a framework at all. A design system has to reach all of them without being rebuilt for each one.',
          ],
        },
      ],
    },
    {
      id: 'options',
      title: 'Ways to support several frameworks',
      blocks: [
        {
          kind: 'table',
          caption: 'Four approaches and their costs',
          columns: ['Approach', 'What is shared', 'Good for', 'Cost'],
          rows: [
            ['Tokens and CSS only', 'Values and class names', 'Any stack, including server-rendered pages', 'Behavior and accessibility are rebuilt in every framework.'],
            ['One framework library', 'Components for one framework', 'Every product uses the same framework', 'A product on another framework gets only the tokens.'],
            ['A library per framework', 'Matching components in each framework', 'Two frameworks, each with large teams', 'Every fix is made twice, and versions drift apart.'],
            ['Web Components with wrappers', 'One implementation as custom HTML elements, wrapped thinly for each framework', 'Several frameworks, or older pages', 'Server rendering and form support need extra work.'],
          ],
        },
      ],
    },
    {
      id: 'how',
      title: 'Building with Web Components',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Keep tokens framework-free', text: 'Ship tokens as CSS custom properties. They reach inside custom elements too.' },
            { title: 'Build each control as a custom element', text: 'One class holds the control’s markup, styles and behavior.' },
            { title: 'Join native forms', text: 'Use form-associated custom elements (`ElementInternals`) so the control submits a value and takes part in validation, like a native input.' },
            { title: 'Talk through attributes, properties and events', text: 'Inputs arrive as attributes and properties; changes leave as standard DOM events such as `change`.' },
            { title: 'Write thin wrappers', text: 'A React or Angular wrapper only passes props and events through. If it adds behavior, that behavior belongs in the element.' },
            { title: 'Test in every host', text: 'Render the same element in plain HTML and in every framework you support.' },
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
            { dont: 'A React button and an Angular button, maintained by different teams.', do: 'One `<ds-button>` element, with a thin wrapper for each framework.' },
            { dont: 'Wrappers that add their own validation.', do: 'Validation lives in the element, so every framework behaves the same.' },
            { dont: 'Tokens compiled into each framework’s own styling system.', do: 'Tokens as CSS custom properties that every stack can read.' },
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
            { icon: 'check', title: 'Older pages can join', text: 'Server-rendered pages can use custom elements without a framework, so they do not have to wait for a rewrite.' },
            { icon: 'arrowRight', title: 'Start with simple controls', text: 'Switches, checkboxes and buttons are the easiest to share. Complex composites can follow.' },
            { icon: 'warning', title: 'Check server rendering', text: 'If products render on the server, test how custom elements look before JavaScript loads.' },
          ],
        },
        { kind: 'related', ids: ['migration'] },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      blocks: [
        {
          kind: 'checklist',
          items: [
            'Tokens and base CSS do not depend on any framework.',
            'Each interactive control has one implementation.',
            'Form controls submit values and take part in validation.',
            'Wrappers add no behavior.',
            'The same element is tested in every supported framework.',
          ],
        },
      ],
    },
  ],
};
