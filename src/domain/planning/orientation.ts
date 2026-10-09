/** Published sources the wiki cites. GOV.UK pages are living documents without a date. */
export const sources = [
  { id: 'inventory', short: 'Frost 2013', author: 'Brad Frost', title: 'Interface Inventory', year: 2013, href: 'https://bradfrost.com/blog/post/interface-inventory/' },
  { id: 'atomic', short: 'Frost 2016', author: 'Brad Frost', title: 'Atomic Design, chapter 4: The Atomic Workflow', year: 2016, href: 'https://atomicdesign.bradfrost.com/chapter-4/' },
  { id: 'tokens', short: 'Curtis 2016', author: 'Nathan Curtis', title: 'Tokens in Design Systems', year: 2016, href: 'https://medium.com/eightshapes-llc/tokens-in-design-systems-25dd82d58421' },
  { id: 'teams', short: 'Curtis 2015', author: 'Nathan Curtis', title: 'Team Models for Scaling a Design System', year: 2015, href: 'https://medium.com/eightshapes-llc/team-models-for-scaling-a-design-system-2cf9d03be6a0' },
  { id: 'dtcg', short: 'DTCG 2025', author: 'Design Tokens Community Group (W3C)', title: 'Design Tokens Format Module, first stable version 2025.10', year: 2025, href: 'https://www.designtokens.org/' },
  { id: 'criteria', short: 'GOV.UK criteria', author: 'GOV.UK Design System', title: 'Contribution criteria', year: null, href: 'https://design-system.service.gov.uk/community/contribution-criteria/' },
  { id: 'lifecycle', short: 'GOV.UK lifecycle', author: 'GOV.UK Design System', title: 'Component lifecycle statuses', year: null, href: 'https://design-system.service.gov.uk/community/component-lifecycle-statuses/' },
  { id: 'wcag', short: 'WCAG 2.2', author: 'W3C', title: 'Web Content Accessibility Guidelines (WCAG) 2.2', year: 2023, href: 'https://www.w3.org/TR/WCAG22/' },
  { id: 'apg', short: 'ARIA APG', author: 'W3C Web Accessibility Initiative', title: 'ARIA Authoring Practices Guide', year: null, href: 'https://www.w3.org/WAI/ARIA/apg/' },
  { id: 'semver', short: 'SemVer', author: 'Tom Preston-Werner', title: 'Semantic Versioning 2.0.0', year: null, href: 'https://semver.org/' },
] as const;
export type SourceId = (typeof sources)[number]['id'];

export interface SystemLayer {
  name: string;
  short: string;
  examples: readonly string[];
  /** Examples are token names, shown as code. */
  code?: boolean;
  /** Applies to every other layer rather than sitting in the stack. */
  across?: boolean;
}

/** What a design system is made of. */
export const systemLayers: readonly SystemLayer[] = [
  { name: 'Purpose and principles', short: 'Why it exists, and what settles arguments', examples: [] },
  { name: 'Design language', short: 'How the products look, move and speak', examples: ['Color', 'Type', 'Space', 'Shape', 'Motion', 'Voice'] },
  { name: 'Design tokens', short: 'The language as named decisions', examples: ['text-muted', 'space-inset-md', 'radius-control'], code: true },
  { name: 'Components', short: 'Reusable parts, with every state', examples: ['Button', 'Text field', 'Dialog'] },
  { name: 'Patterns', short: 'Solutions to recurring tasks', examples: ['Form with validation', 'Filtered list', 'Empty state'] },
  { name: 'Documentation', short: 'Guidance and design assets that match the code', examples: [], across: true },
  { name: 'People and governance', short: 'Ownership, contribution and releases', examples: [], across: true },
];

/** Three points the sources agree on, shown before the details. */
export const startingAdvice = [
  { title: 'Look before you build', detail: 'An inventory of what exists comes first, whatever else is true.' },
  { title: 'Work from the language down', detail: 'Agree the look, name it as tokens, then build components on them.' },
  { title: 'Own it from day one', detail: 'Decide who maintains the system before you share anything.' },
] as const;

export interface StartingPoint {
  id: 'inventory' | 'language' | 'tokens' | 'components' | 'adoption' | 'extend';
  title: string;
  /** The situation it fits, completing “When…”. */
  when: string;
  gain: string;
  risk: string;
  sources: readonly SourceId[];
}

export const startingPoints: readonly StartingPoint[] = [
  {
    id: 'inventory',
    title: 'Start with an interface inventory',
    when: 'you do not yet know what exists',
    gain: 'A shared vocabulary and a realistic scope',
    risk: 'Stopping at screenshots without agreeing names and next steps',
    sources: ['inventory', 'atomic'],
  },
  {
    id: 'language',
    title: 'Start with the design language',
    when: 'the look is not agreed, or a redesign is under way',
    gain: 'One agreed direction, reached cheaply with style tiles',
    risk: 'It stays abstract unless you encode it as tokens soon',
    sources: ['atomic'],
  },
  {
    id: 'tokens',
    title: 'Start with design tokens',
    when: 'the look is agreed, but values are hard-coded',
    gain: 'Consistent color, type and space, and cheap theming',
    risk: 'It does not fix duplicated component behavior',
    sources: ['tokens', 'dtcg'],
  },
  {
    id: 'components',
    title: 'Start with core components',
    when: 'tokens exist, but components are rebuilt everywhere',
    gain: 'Behavior and accessibility fixed once',
    risk: 'Built before tokens, they bake values in',
    sources: ['inventory', 'criteria'],
  },
  {
    id: 'adoption',
    title: 'Start with why the existing library is not used',
    when: 'a shared library exists, but few teams use it',
    gain: 'The real reasons teams passed on it',
    risk: 'Skip this and you build a second unused library',
    sources: ['teams'],
  },
  {
    id: 'extend',
    title: 'Start from the gaps in the existing system',
    when: 'an adopted system needs to grow',
    gain: 'Gaps ranked by demand, with a stable API',
    risk: 'Without contribution rules it becomes a dumping ground',
    sources: ['criteria', 'lifecycle'],
  },
];

/** The order most practitioners describe. The steps overlap; each one starts before the last ends. */
export const recommendedSequence = [
  {
    title: 'Inventory',
    detail: 'Screenshot every distinct component across your products, then name them together.',
    produces: 'Shared vocabulary',
    sources: ['inventory', 'atomic'],
  },
  {
    title: 'Design language',
    detail: 'Agree color, type, space and shape with style tiles before detailed screens.',
    produces: 'Agreed direction',
    sources: ['atomic'],
  },
  {
    title: 'Tokens',
    detail: 'Name the options, then the decisions. Color and type first, in a format design tools and code share.',
    produces: 'One token source',
    sources: ['tokens', 'dtcg'],
  },
  {
    title: 'Core components',
    detail: 'Build the most duplicated components first, on tokens, with every state.',
    produces: 'Accessible building blocks',
    sources: ['inventory', 'wcag'],
  },
  {
    title: 'Pilot',
    detail: 'Build one real workflow to find where the abstractions break.',
    produces: 'Patterns and fixes',
    sources: ['atomic'],
  },
  {
    title: 'Governance',
    detail: 'Choose a team model, contribution criteria and maturity labels.',
    produces: 'An operating model',
    sources: ['teams', 'criteria', 'lifecycle'],
  },
] as const satisfies readonly { title: string; detail: string; produces: string; sources: readonly SourceId[] }[];
