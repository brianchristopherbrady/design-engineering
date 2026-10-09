import type { Article } from '../wiki/types';

export const migration: Article = {
  id: 'migration',
  inShort: [
    'Move existing products over gradually, alongside feature work. Avoid a big rewrite.',
    'First stop adding new problems, then fix the old ones in order: tokens, primitives, composites, patterns.',
    'You are done when the old code is deleted, not when the new code is added.',
  ],
  sections: [
    {
      id: 'what',
      title: 'How migration works',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Migration means moving a product that already exists onto the design system. It almost never happens in one go. The product keeps shipping features while old and new parts run side by side.',
            'The plan on this page works for most products. Change the order if one problem is urgent, such as accessibility defects in a single component.',
          ],
        },
        {
          kind: 'points',
          items: [
            { icon: 'arrowRight', title: 'Small steps', text: 'Each release moves something, and every step can be undone.' },
            { icon: 'refresh', title: 'Old and new together', text: 'Old and new code run side by side safely until the old code is gone.' },
            { icon: 'warning', title: 'Stop new problems first', text: 'Before fixing the past, make sure nobody adds new raw values or copies of components.' },
            { icon: 'search', title: 'Measure it', text: 'Count what is left in every release, so progress is visible.' },
          ],
        },
      ],
    },
    {
      id: 'before',
      title: 'Before you start',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Take stock of each product', text: 'List its local components and how often each is used. Count raw colors, sizes and fonts.' },
            { title: 'Find a lead in each team', text: 'Name one person in each product team who leads its migration.' },
            { title: 'Agree what “done” means', text: 'For example: no raw colors, no local buttons, inputs or dialogs, and the old components deleted.' },
            { title: 'Record where you started', text: 'Save today’s counts and a set of screenshots to compare against later.' },
          ],
        },
      ],
    },
    {
      id: 'order',
      title: 'Migrate in this order',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Tokens', text: 'Replace raw values with tokens. The risk is low, and screens should look the same afterwards.' },
            { title: 'Guard rails', text: 'Add lint rules that block new raw values and new local copies of system components.' },
            { title: 'Primitives', text: 'Swap buttons, inputs and checkboxes, starting with the most used.' },
            { title: 'Composite components', text: 'Swap dialogs, menus and form fields once the primitives inside them are done.' },
            { title: 'Patterns', text: 'Adopt patterns when a team rebuilds a flow.' },
            { title: 'Clean up', text: 'Delete the old components, wrappers and style overrides.' },
          ],
        },
      ],
    },
    {
      id: 'approaches',
      title: 'Ways to make the switch',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['Most migrations combine several of these. Choose per component and per product.'],
        },
        {
          kind: 'table',
          caption: 'Six approaches and when each fits',
          columns: ['Approach', 'How it works', 'Use it when', 'Watch for'],
          rows: [
            ['Token swap', 'Replace raw values with token variables.', 'Styles are hard-coded.', 'Mapping a value to the wrong token changes the look.'],
            ['Wrapper', 'Keep the old component’s name, and render the system component inside it.', 'An old component is used in hundreds of places.', 'Wrappers that are never removed.'],
            ['Automated rewrite', 'A script (a “codemod”) rewrites imports and props.', 'The changes are mechanical and repeated.', 'It needs a careful review and good tests.'],
            ['Screen by screen', 'New and rebuilt screens use the system; others wait.', 'The product changes often.', 'A long period with old and new mixed.'],
            ['With feature work', 'Migrate whatever a feature touches.', 'Teams cannot pause for migration.', 'Slow progress unless someone tracks it.'],
            ['Focused push', 'A team migrates one whole area in a sprint.', 'The area is small, or critical.', 'It competes with roadmap work.'],
          ],
        },
      ],
    },
    {
      id: 'together',
      title: 'Running old and new together',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'info', title: 'Keep styles from leaking', text: 'Load the system’s CSS in its own cascade layer or scope, so old and new styles do not override each other.' },
            { icon: 'close', title: 'Do not copy to match', text: 'Never copy a system component to make it look like the old one. Change the old screen, or log an exception.' },
            { icon: 'search', title: 'Catch visual changes', text: 'Compare screenshots before and after each step.' },
            { icon: 'refresh', title: 'Keep a way back', text: 'A feature flag or a quick revert lets you undo a step that goes wrong.' },
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      title: 'Common mistakes',
      blocks: [
        {
          kind: 'doDont',
          items: [
            { dont: 'Freezing features for months to rewrite everything.', do: 'Migrating in small releases alongside feature work.' },
            { dont: 'Changing the look and the code in the same release, without telling anyone.', do: 'Keeping technical migration separate from visual changes, or telling users what is changing.' },
            { dont: 'Copying a system component into the product to tweak it.', do: 'Asking for the change, or logging an exception and reviewing it.' },
            { dont: 'Calling it done when imports point at the system.', do: 'Calling it done when the old components and raw values are deleted.' },
          ],
        },
      ],
    },
    {
      id: 'progress',
      title: 'Tracking progress',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['Count the same few things in every release and show them per product. A short table, reviewed in planning, keeps migration visible next to feature work.'],
        },
        {
          kind: 'table',
          caption: 'Example progress report (illustrative numbers)',
          columns: ['Product', 'Raw colors left', 'Local components left', 'Status'],
          rows: [
            ['Product A', '0', '3', 'Primitives done; dialogs next.'],
            ['Product B', '42', '11', 'Tokens in progress.'],
            ['Product C', '118', '19', 'Not started; lead named.'],
          ],
        },
        { kind: 'related', ids: ['measure'] },
      ],
    },
    {
      id: 'people',
      title: 'Bringing teams along',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'check', title: 'Pair on the first migration', text: 'System owners work alongside each team on its first component.' },
            { icon: 'archive', title: 'Write migration guides', text: 'Code before and after for each component, plus the props that changed.' },
            { icon: 'info', title: 'Hold office hours', text: 'A regular time for questions beats a queue of messages.' },
            { icon: 'star', title: 'Celebrate deletions', text: 'Removing old code is the real milestone. Say so.' },
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
            'Each product has a migration lead and a starting count.',
            'Lint rules stop new raw values and new copies.',
            'Every step can be undone, and screenshots are compared.',
            'Progress is counted in every release and reviewed in planning.',
            'Old components, wrappers and overrides are deleted at the end.',
          ],
        },
      ],
    },
  ],
  sources: ['inventory', 'tokens', 'teams'],
};
