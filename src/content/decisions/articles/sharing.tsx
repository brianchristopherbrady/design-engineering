import { SharingExplorer } from '../SharingExplorer';
import type { Decision } from '../types';

export const sharing: Decision = {
  id: 'sharing',
  question: 'What should a simple consumer product, used mostly on phones, share with a data-dense professional desktop application?',
  answer:
    'Usually less than one library and more than nothing, and the answer differs by layer: principles are cheap to share, tokens pay off when the brands are related, component behavior only where it is genuinely equivalent, and product screens almost never. A pilot settles it better than a diagram.',
  sections: [
    {
      id: 'scenario',
      title: 'The scenario',
      blocks: [
        {
          kind: 'table',
          caption: 'Two products with different people, tasks and devices',
          evidence: 'hypothetical',
          columns: ['Aspect', 'Consumer product', 'Professional application'],
          rows: [
            ['People', 'Occasional visitors who need guidance', 'Specialists who use it all day'],
            ['Devices', 'Mostly phones', 'Desktops with large screens'],
            ['Tasks', 'A few short, guided tasks', 'Scanning, comparing and acting on many records'],
            ['Density', 'Low', 'High, with tables and bulk actions'],
            ['Input', 'Touch first', 'Keyboard first'],
          ],
        },
      ],
    },
    {
      id: 'questions',
      title: 'Questions to answer first',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['The architecture follows from the answers, so it should not be chosen before them.'],
        },
        {
          kind: 'table',
          caption: 'Questions, and why each one changes the answer',
          columns: ['Question', 'Why it matters'],
          rows: [
            ['Is the mobile product responsive web, a native app, or both?', 'Native code cannot use web components. Only tokens and specifications cross that line.'],
            ['How do the people, tasks, usage frequency and density differ?', 'The more they differ, the less of each screen and pattern can be shared.'],
            ['Which controls have genuinely equivalent behavior?', 'Only equivalent controls benefit from one implementation. Forcing others together adds options neither product needs.'],
            ['What differs in touch targets, keyboard use, accessibility and navigation?', 'A shared control must support both input styles. Size differences can live in density or target tokens.'],
            ['Are the brands, platforms, frameworks and performance budgets compatible?', 'Different frameworks or tight performance budgets raise the cost of shared code.'],
            ['Can the teams release independently?', 'Independent releases need versioned shared packages and a support window.'],
            ['Who owns shared components, supports their users and resolves exceptions?', 'Without an owner, a shared library decays faster than two separate ones.'],
            ['What evidence would the pilot need to provide?', 'Decide in advance which results would change your mind.'],
          ],
        },
      ],
    },
    {
      id: 'approaches',
      title: 'Four approaches',
      blocks: [
        {
          kind: 'table',
          caption: 'Trade-offs of each approach',
          wide: true,
          columns: ['Approach', 'Fit for each product', 'Consistency', 'Maintenance', 'Coordination', 'Migration', 'Release independence'],
          rows: [
            ['One broad shared library', 'Risky: one set of components must suit occasional touch use and dense keyboard work', 'Highest', 'One codebase, but components grow options for both audiences', 'High: every change involves both products', 'Both products move onto one library', 'Low unless versioned carefully'],
            ['Shared core with product extensions', 'Good: shared where behavior matches, product-specific elsewhere', 'High for core controls', 'A core plus extensions to review', 'Only core changes need agreement', 'Gradual, control by control', 'Good with a versioned core'],
            ['Shared tokens and guidelines, separate implementations', 'Good: each implementation fits its platform', 'Visual consistency; behavior can drift', 'Behavior and accessibility built twice', 'Low', 'Each product moves its own code onto shared tokens', 'High'],
            ['Separate systems with selective alignment', 'Best for each product on its own', 'Only what you choose to align, such as status colors', 'Two systems', 'Lowest', 'Little or none', 'Highest'],
          ],
        },
        {
          kind: 'text',
          paragraphs: [
            'These are not exclusive. A team can share tokens and three form controls while keeping navigation, tables and the mobile flows separate. Shared tokens are not a prerequisite either: separate systems can still align a few values, such as status colors and focus styles, without sharing a token source.',
          ],
        },
      ],
    },
    {
      id: 'explore',
      title: 'Change the constraints',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Change a few constraints to see how the case for each layer and each approach shifts. There is no score and no recommended answer: one strong reason, such as a native app, can outweigh several weak ones. The pilot questions at the end are what would settle it.',
          ],
        },
        { kind: 'visual', Visual: SharingExplorer },
      ],
    },
    {
      id: 'this-site',
      title: 'What this site’s product modes show',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'The header switches this site between three products (Design System Lab, Harbor and Meadow), light and dark themes, and comfortable and compact density. One token source drives all twelve combinations, and no component knows which one is active.',
            'That demonstrates **configurable presentation**: brand roles, shape and density can vary without forking components. It does not show that a consumer product and a professional application should share workflows or component behavior. That needs evidence from their users and a pilot.',
          ],
        },
        {
          kind: 'evidence',
          items: [
            { label: 'Products and modes', href: '/foundations/products', shows: 'What each product and density changes, computed from the token build.' },
            { label: 'Theme studio', href: '/foundations/theme-studio', shows: 'A new product theme generated from one brand color, with contrast checks.' },
            { label: 'Button in the Playground', href: '/playground?component=button', shows: 'One component previewed in any product, theme and density.' },
          ],
        },
      ],
    },
  ],
  sources: ['teams', 'criteria'],
};
