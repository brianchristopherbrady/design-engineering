import type { Article } from '../wiki/types';

export const governance: Article = {
  id: 'governance',
  inShort: [
    'Decide who owns the system before you share it.',
    'Make it easy to suggest a change, and clear what a good contribution looks like.',
    'Label each part’s maturity, so people know what they can rely on.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What governance is',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Governance is the set of agreements that keeps a design system useful after launch: who decides, how anyone can suggest a change, how products upgrade, and how old parts are retired.',
            'It sounds bureaucratic, but most of it fits on one page. Without it, a system either stalls because nobody can change it, or splinters because everybody does.',
          ],
        },
      ],
    },
    {
      id: 'owners',
      title: 'Who owns it',
      blocks: [
        {
          kind: 'table',
          caption: 'Three common team models',
          columns: ['Model', 'How it works', 'Works well when', 'Watch for'],
          rows: [
            ['Solitary', 'One product team shares its own library with everyone else.', 'There is one main product and little time.', 'Other products’ needs always come second.'],
            ['Centralized', 'A dedicated team builds and supports the system for product teams.', 'There are several products and budget for a team.', 'The team loses touch with real product problems.'],
            ['Federated', 'Designers and engineers from product teams decide together, part-time.', 'Product teams have capacity and want a say.', 'Decisions stall without a small core who write things down.'],
          ],
        },
        {
          kind: 'note',
          title: 'Most teams mix models',
          text: 'A common setup is a small central team that maintains the system, plus representatives from product teams who help decide what goes into it.',
        },
      ],
    },
    {
      id: 'contribution',
      title: 'How changes get in',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Propose', text: 'Show the need is real. The part is **useful** (teams need it) and **unique** (nothing in the system already does it).' },
            { title: 'Build', text: 'Show it is **usable** (tested with people), **consistent** (fits the rest of the system) and **versatile** (works in more than one place).' },
            { title: 'Review', text: 'An owner checks it against a written list: tokens only, accessibility, documentation and tests.' },
            { title: 'Release as experimental', text: 'New parts start as experimental and earn their way to stable.' },
          ],
        },
      ],
    },
    {
      id: 'maturity',
      title: 'Maturity labels',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['A label on each part tells people how much they can rely on it. Write down what each label promises and what evidence it needs, then keep to it.'],
        },
        {
          kind: 'table',
          caption: 'Four labels and what each promises',
          columns: ['Label', 'What it promises', 'What it needs'],
          rows: [
            ['Experimental', 'It may change or be removed. Try it, and tell the owners how it went.', 'Meets the criteria for a proposal.'],
            ['Beta', 'The API is mostly settled, and at least one product uses it.', 'Documentation, tests and one real use.'],
            ['Stable', 'Safe to depend on. Changes follow the versioning rules.', 'Accessibility tested, used in more than one product, no open breaking issues.'],
            ['Deprecated', 'It is being removed. The page names its replacement and the release that removes it.', 'A migration guide.'],
          ],
        },
      ],
    },
    {
      id: 'releases',
      title: 'Releases and versions',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'info', title: 'Version numbers with meaning', text: 'Use semantic versioning: a major version for breaking changes, a minor version for new features and a patch for fixes.' },
            { icon: 'archive', title: 'A changelog', text: 'Every release says what changed and why.' },
            { icon: 'warning', title: 'Explain breaking changes', text: 'Each one comes with migration notes and, where possible, a script that makes the change automatically.' },
            { icon: 'refresh', title: 'Support the previous version', text: 'Keep fixing the previous major version for an agreed time, so products can upgrade on their own schedule.' },
          ],
        },
      ],
    },
    {
      id: 'exceptions',
      title: 'When the system lacks something',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Build it in the product', text: 'Do not wait for the system. Ship the feature.' },
            { title: 'Log it', text: 'Record what was built, why the system did not fit, and who owns it.' },
            { title: 'Review the log monthly', text: 'Owners read the log with product teams.' },
            { title: 'Adopt what repeats', text: 'If two products need the same thing, consider adding it to the system.' },
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
            { icon: 'search', title: 'Find out why teams skipped it before', text: 'If a shared library already exists but few teams use it, ask them why. The answer is usually about fit, support or ownership, not looks.' },
            { icon: 'check', title: 'Give migrating teams a voice', text: 'Teams moving onto the system find its gaps first. Invite them into reviews.' },
            { icon: 'archive', title: 'Deprecate old components formally', text: 'Mark old local components as deprecated, name their replacements and set a removal date.' },
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
            'An owner is named for every shared package.',
            'Anyone can propose a change, and the criteria are published.',
            'Every part has a maturity label with written requirements.',
            'Releases have version numbers, a changelog and migration notes.',
            'Exceptions are logged and reviewed.',
          ],
        },
      ],
    },
  ],
  sources: ['teams', 'criteria', 'lifecycle', 'semver'],
};
