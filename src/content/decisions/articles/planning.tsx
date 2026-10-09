import { Text } from '@/design-system/primitives';
import { Rich } from '../Blocks';
import type { Decision } from '../types';
import styles from '../decisions.module.css';

const chain = [
  {
    stage: 'Principle',
    text: '**Purpose before appearance.** Components read what a value is for, not the value itself.',
  },
  {
    stage: 'Requirement',
    text: 'Components may read semantic and component tokens, never palette colors. **Accepted when** the build fails if a stylesheet reads a palette variable or a component token points at a palette color.',
  },
  {
    stage: 'Implementation',
    text: 'Three [token tiers](/foundations/tokens#tiers) and a written [dependency policy](/foundations/tokens#policy). The token build checks every alias in all twelve theme, product and density combinations.',
  },
  {
    stage: 'Validation',
    text: '`check-styles.mjs` and the token pipeline fail the build when a rule breaks, and policy tests cover each rule. To see the result, switch **Product** in the header: every component restyles without a code change.',
  },
] as const;

function PrincipleChain() {
  return (
    <ol className={styles.chain} aria-label="From principle to validation">
      {chain.map((link) => (
        <li key={link.stage} className={styles.chainLink}>
          <Text as="span" variant="caption" tone="muted">
            {link.stage}
          </Text>
          <Text as="span" variant="bodySmall">
            <Rich text={link.text} />
          </Text>
        </li>
      ))}
    </ol>
  );
}

export const planning: Decision = {
  id: 'planning',
  question: 'How do I decide what a design system should solve?',
  answer:
    'Start from the people, workflows and inconsistencies that exist today. Agree a few principles that settle real trade-offs, turn them into scoped requirements with acceptance criteria, then prove them with a small pilot measured against a baseline.',
  sections: [
    {
      id: 'process',
      title: 'The process',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['Five steps, each producing something a team can review. In practice they overlap: a pilot often sends you back to rewrite a requirement.'],
        },
        {
          kind: 'steps',
          items: [
            {
              title: 'Understand what exists',
              text: 'Who uses the products, for which workflows, on which devices. Take an [interface inventory](https://bradfrost.com/blog/post/interface-inventory/): one screenshot of every distinct control, with the versions counted. Ask designers, engineers and product owners where the inconsistencies cost them.',
              output: 'a short system brief',
            },
            {
              title: 'Agree principles',
              text: 'Three to five statements that settle the trade-offs the inventory exposed, such as flexibility against consistency.',
              output: 'principles, each with a worked decision',
            },
            {
              title: 'Write scoped requirements',
              text: 'Turn each principle and constraint into a requirement with an acceptance criterion someone could test. Say what is out of scope.',
              output: 'a requirements table',
            },
            {
              title: 'Define ownership and a pilot',
              text: 'Name who owns the system and who decides exceptions. Choose one real workflow, small enough to finish and real enough to break the abstractions.',
              output: 'a pilot plan',
            },
            {
              title: 'Set baselines and measures',
              text: 'Measure today before anything changes, and choose a few measures tied to the problems in the brief.',
              output: 'a measurement plan',
            },
          ],
        },
      ],
    },
    {
      id: 'principles',
      title: 'Principles that settle trade-offs',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'A principle earns its place when it decides between two reasonable options. “Keep it simple” does not: everyone agrees, and nothing changes. Each principle behind this system resolves a specific tension.',
          ],
        },
        {
          kind: 'table',
          caption: 'Tensions, and the principles this system uses to resolve them',
          evidence: 'implemented',
          columns: ['Tension', 'Principle', 'What it decides'],
          rows: [
            ['Flexibility or consistency', 'Choices, not values', 'Props accept named options such as `size="large"`, never arbitrary CSS, so every value resolves to a token.'],
            ['Brand expression or shared behavior', 'Purpose before appearance', 'Components read semantic roles; products remap the roles instead of forking components.'],
            ['Custom polish or accessibility', 'Native first', 'A button is a `<button>`, so keyboard, focus and screen-reader behavior come from the platform.'],
            ['Page layouts or reusable parts', 'Space-aware components', 'Components respond to their container, so one implementation works in a sidebar, a dialog or a full page.'],
            ['Speed of documentation or trust in it', 'Verified, not promised', 'Claims are backed by checks that fail the build, and documentation is generated from the code.'],
          ],
        },
      ],
    },
    {
      id: 'example',
      title: 'Worked example: from principle to validation',
      blocks: [
        {
          kind: 'visual',
          evidence: 'implemented',
          Visual: PrincipleChain,
          caption: 'One principle traced through this project: what it requires, how it is built, and what fails when it is broken.',
        },
      ],
    },
    {
      id: 'outputs',
      title: 'What the plan produces',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'The documents below are hypothetical. They are written for an organization with a consumer mobile product and a professional desktop application, to show the level of detail, not real findings. The requirements are the core of the plan, so they are shown in full.',
          ],
        },
        {
          kind: 'table',
          caption: 'Requirements, with acceptance criteria',
          evidence: 'hypothetical',
          columns: ['ID', 'Requirement', 'Accepted when', 'Priority'],
          rows: [
            ['R1', 'Every shared control works with a keyboard alone.', 'The pilot flow completes with Tab, Shift+Tab, Enter, Space and arrow keys, and focus is always visible.', 'Must'],
            ['R2', 'Shared controls meet WCAG 2.2 AA.', 'No automated violations in the pilot flow, contrast checked in every theme, and targets of at least 24 by 24 CSS pixels.', 'Must'],
            ['R3', 'Products change brand and shape without forking components.', 'Each product’s token file overrides only brand roles and radii, and a test fails otherwise.', 'Must'],
            ['R4', 'Dense screens can opt into a compact density.', 'Compact density applies per screen or region, and targets and contrast still pass.', 'Should'],
            ['R5', 'A failed submission keeps what people entered.', 'A test forces a failure and checks that every value survives and focus moves to an error summary.', 'Should'],
          ],
        },
        {
          kind: 'details',
          items: [
            {
              summary: 'System brief',
              blocks: [
                {
                  kind: 'table',
                  caption: 'A one-page system brief',
                  evidence: 'hypothetical',
                  columns: ['Part', 'Content'],
                  rows: [
                    ['Problem', 'Both products rebuild the same controls with different behavior, and accessibility fixes are made twice.'],
                    ['People', 'Occasional consumers on phones; professionals at desks all day.'],
                    ['In scope', 'Tokens, buttons, form controls, alerts and dialogs, and their documentation.'],
                    ['Out of scope', 'Product screens, workflows and business logic.'],
                    ['Owner', 'A small core team, with one representative from each product.'],
                    ['First pilot', 'One equivalent flow in each product.'],
                  ],
                },
              ],
            },
            {
              summary: 'Pilot plan',
              blocks: [
                {
                  kind: 'table',
                  caption: 'A pilot plan',
                  evidence: 'hypothetical',
                  columns: ['Item', 'Plan'],
                  rows: [
                    ['Workflow', 'Search with filters, an empty state and an error state, built in both products.'],
                    ['People', 'One designer and one engineer from each product, with the core team.'],
                    ['Duration', 'Six weeks.'],
                    ['Done when', 'R1 to R5 pass in both products, no shared component was forked, and the findings are written up.'],
                    ['Way back', 'Behind a feature flag; the old screens stay until the pilot passes.'],
                  ],
                },
              ],
            },
            {
              summary: 'Measurement plan',
              blocks: [
                {
                  kind: 'table',
                  caption: 'A measurement plan',
                  evidence: 'proposed',
                  columns: ['Measure', 'Baseline', 'Proposed target', 'Owner'],
                  rows: [
                    ['Duplicate controls', 'Local buttons, inputs and dialogs per product, counted before the pilot', 'Falling every release', 'Core team'],
                    ['Accessibility defects in shared controls', 'Open defects by component and severity', 'None open at high severity', 'Product QA leads'],
                    ['Time for the pilot flow', 'Time to build it the old way', 'Set only after the baseline exists', 'Engineering managers'],
                  ],
                },
                { kind: 'text', paragraphs: ['How each measure can mislead is covered in [Operating and measuring a system](/decisions/operating#measures).'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'evidence',
      title: 'See it on this site',
      blocks: [
        {
          kind: 'evidence',
          items: [
            { label: 'Principles', href: '/#principles', shows: 'The six principles this system follows.' },
            { label: 'Token dependency policy', href: '/foundations/tokens#policy', shows: 'A requirement enforced by the build, with its recorded exceptions.' },
            { label: 'Products and modes', href: '/foundations/products', shows: 'Requirement R3 working: three products from one token source.' },
            { label: 'Form validation', href: '/patterns/form-validation', shows: 'Errors appear on submit, and focus moves to a summary that links to each field.' },
          ],
        },
      ],
    },
  ],
  sources: ['inventory', 'atomic', 'criteria'],
};
