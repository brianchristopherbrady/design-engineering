import { measures } from '@/domain/planning';
import type { Article } from '../wiki/types';

export const measure: Article = {
  id: 'measure',
  inShort: [
    'Counting tokens and components measures the system’s size, not its effect.',
    'Pick a few measures that match the problems you set out to solve.',
    'Record a starting point before anything changes, or later numbers are just stories.',
  ],
  sections: [
    {
      id: 'what',
      title: 'Measuring effect, not size',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'The easiest numbers to report about a design system are about size: how many tokens, how many components. They say nothing about whether teams build faster, whether screens are more accessible, or whether products feel like one family.',
            'The measures below try to capture effect. None needs tooling on day one: each has a small first step you can take with a spreadsheet and a code search.',
          ],
        },
      ],
    },
    {
      id: 'measures',
      title: 'Ten measures',
      blocks: [
        { kind: 'text', paragraphs: ['Open a measure to see how to collect it, how often, who owns it and how it can mislead.'] },
        {
          kind: 'details',
          items: measures.map((item) => ({
            summary: item.name,
            body: [
              item.definition,
              `**Start small:** ${item.startSmall}`,
              `**Starting point:** ${item.baseline}`,
              `**How to collect it:** ${item.collection}`,
              `**How often:** ${item.cadence} **Owner:** ${item.owner}`,
              `**Example target:** ${item.target}`,
              `**How it can mislead:** ${item.limitations}`,
            ],
          })),
        },
      ],
    },
    {
      id: 'reading',
      title: 'Reading measures together',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'check', title: 'Pair speed with quality', text: 'Delivery gets faster when states and accessibility are skipped. Only count a task as done when they are included.' },
            { icon: 'search', title: 'Pair use with overrides', text: 'High use plus many overrides means the system is used but does not fit.' },
            { icon: 'warning', title: 'Read defect counts with test counts', text: 'Fewer reported defects can simply mean less testing.' },
            { icon: 'refresh', title: 'Act on what you learn', text: 'Every measure should be able to change a decision about the system. If none could, stop collecting it.' },
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
            { title: 'Record a starting point first', text: 'Count raw values, local components and known accessibility defects before migration begins.' },
            { title: 'Pick measures that match the problems', text: 'Inconsistency suggests adoption and design-to-code consistency; repeated accessibility bugs suggest defect counts.' },
            { title: 'Report per product', text: 'Totals hide the product that is stuck.' },
            { title: 'Set targets after the starting point', text: 'Never before it. A target without a starting point is a guess.' },
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
            'Three or four measures, each tied to a problem you named.',
            'A starting point recorded for each one.',
            'An owner and a schedule for each one.',
            'Speed is always read alongside quality.',
            'Each review ends with a change to the system or to the measure.',
          ],
        },
      ],
    },
  ],
};
