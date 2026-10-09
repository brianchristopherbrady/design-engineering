import { principles } from '@/domain/planning';
import type { Article } from '../wiki/types';

export const principlesArticle: Article = {
  id: 'principles',
  inShort: [
    'A principle helps someone choose between two good options.',
    'Keep three to five, and test each one against a real argument from the past.',
    'Turn each principle into something a review or a test can check.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What design principles are',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Design principles are short statements of what your products favor when two reasonable options conflict.',
            'A good principle decides something. “Keep it simple” does not: everyone agrees with it, and nothing changes. “An error never clears what someone typed” does: it settles a real disagreement.',
          ],
        },
        {
          kind: 'doDont',
          items: [
            { dont: '“Be simple.”', do: '“One primary action per screen; everything else looks secondary.”' },
            { dont: '“Delight users.”', do: '“Keep people’s place: an error never clears what they typed.”' },
            { dont: '“Accessible by default.”', do: '“Start from the native element: a button is a `<button>`, so keyboard and screen-reader support come with it.”' },
          ],
        },
      ],
    },
    {
      id: 'why',
      title: 'Why they matter',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'refresh', title: 'Faster decisions', text: 'Reviews settle in minutes instead of reopening the same debate.' },
            { icon: 'check', title: 'The same call everywhere', text: 'Teams who never meet still make the same decision.' },
            { icon: 'search', title: 'Something to test', text: 'A principle that decides real cases can be turned into checks.' },
          ],
        },
      ],
    },
    {
      id: 'how',
      title: 'How to write them',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Collect the arguments', text: 'List decisions that kept coming back in design and code reviews over the last few months.' },
            { title: 'Draft one sentence each', text: 'Say what you favor, and what you favor it over.' },
            { title: 'Test it against a real case', text: 'If a draft would not have settled a past argument, rewrite it or drop it.' },
            { title: 'Keep three to five', text: 'With more than five, people forget them or find two that contradict each other.' },
            { title: 'Add a worked example', text: 'Show each principle answering a real question, with the answer.' },
            { title: 'Make it checkable', text: 'Name one requirement and one test or review step that would fail if someone broke the principle.' },
          ],
        },
      ],
    },
    {
      id: 'examples',
      title: 'Examples you can adapt',
      blocks: [
        { kind: 'text', paragraphs: ['Each example shows the principle settling a question, and how you could check it.'] },
        {
          kind: 'details',
          items: principles.map((principle) => ({
            summary: principle.title,
            body: [principle.statement, `**Question:** ${principle.example.question}`, `**Answer:** ${principle.example.answer}`, `**How to check it:** ${principle.trace.verification}`],
          })),
        },
      ],
    },
    {
      id: 'existing',
      title: 'In existing products',
      blocks: [
        {
          kind: 'text',
          paragraphs: ['Your products already follow principles, even if nobody wrote them down. Read past review comments and compare screens to find them.'],
        },
        {
          kind: 'steps',
          items: [
            { title: 'Write down the unwritten rules', text: 'Start with decisions every team already makes the same way. They are the easiest to agree on.' },
            { title: 'Name the conflicts', text: 'Where products decide differently, the principle you choose decides which product changes.' },
            { title: 'Apply them going forward', text: 'Use new principles for new work, and for old screens when you next change them. They are not a reason to rewrite everything.' },
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
            'Three to five principles, each one sentence long.',
            'Each says what it is favored over.',
            'Each would have settled at least one real past argument.',
            'Each has a worked example and at least one check.',
            'Product, design and engineering leads have agreed to them.',
          ],
        },
      ],
    },
  ],
};
