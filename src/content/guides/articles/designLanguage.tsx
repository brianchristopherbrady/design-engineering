import type { Article } from '../wiki/types';
import styles from '../wiki/wiki.module.css';

const steps = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

function SpacingScale() {
  return (
    <ol className={styles.scale} aria-label="A spacing scale, smallest to largest">
      {steps.map((step) => (
        <li key={step}>
          <code>{step}</code>
          <span className={styles.scaleBar} style={{ inlineSize: `var(--space-${step})` }} />
        </li>
      ))}
    </ol>
  );
}

export const designLanguage: Article = {
  id: 'design-language',
  inShort: [
    'The design language is how your products look, move and speak.',
    'Agree on it with quick, cheap artifacts before anyone designs full screens.',
    'Write it down as scales, and give every step a job, so it is ready to become tokens.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What it includes',
      blocks: [
        {
          kind: 'points',
          items: [
            { title: 'Color', text: 'Brand, neutral and status colors, each with a job: text, surfaces, borders, actions or feedback.' },
            { title: 'Typography', text: 'Typefaces, a scale of sizes, weights and line heights.' },
            { title: 'Space', text: 'A spacing scale for padding, gaps and layout.' },
            { title: 'Shape', text: 'Corner radius, border widths and shadows.' },
            { title: 'Icons', text: 'One icon set, its sizes, and when an icon needs a text label.' },
            { title: 'Motion', text: 'How long things take to move, how they ease, and when they should not move at all.' },
            { title: 'Voice and tone', text: 'How the product speaks: the words for actions, errors and empty screens.' },
          ],
        },
        {
          kind: 'visual',
          Visual: SpacingScale,
          caption: 'A spacing scale. Every gap in the product uses one of these steps, so nobody has to pick a number by eye.',
        },
      ],
    },
    {
      id: 'why',
      title: 'Why it matters',
      blocks: [
        {
          kind: 'points',
          items: [
            { icon: 'star', title: 'Recognition', text: 'People recognize and trust products that look and speak alike.' },
            { icon: 'check', title: 'Fewer one-off choices', text: 'A scale answers “how much space?” before anyone asks.' },
            { icon: 'arrowRight', title: 'The input to tokens', text: 'Tokens can only name decisions that someone has already made.' },
          ],
        },
      ],
    },
    {
      id: 'how',
      title: 'How to agree on it',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Gather what exists', text: 'Pull every color, font size and spacing value from the interface inventory and the code.' },
            { title: 'Run a 20-second gut test', text: 'Show stakeholders 20 to 30 websites for 20 seconds each. Everyone scores each one, then discuss the highest, lowest and most divisive scores.' },
            { title: 'Explore with style tiles', text: 'Make two or three one-page boards of color, type and texture, without page layouts. Ask which fits, and why.' },
            { title: 'Try it on real parts', text: 'Make an element collage: real buttons, fields and cards in the chosen style, still without full pages.' },
            { title: 'Write it down as scales', text: 'Turn the choices into scales, such as spacing of 4, 8, 12, 16, 24, 32 and 48 pixels, and give each step a job.' },
            { title: 'Check accessibility early', text: 'Check text and control contrast against WCAG 2.2 before anything is built.' },
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
            { dont: '“Blue `#2B6CB0` is for links.”', do: '“Action color: links and primary buttons only, never decoration.”' },
            { dont: 'Spacing chosen by eye on each screen.', do: 'Every gap uses a step from the spacing scale.' },
            { dont: 'Each engineer writes their own error messages.', do: 'Errors say what happened and what to do next, in plain words.' },
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
          paragraphs: ['Products that grew without a system often have dozens of nearly identical grays and font sizes. You do not need a redesign to fix that.'],
        },
        {
          kind: 'steps',
          items: [
            { title: 'Group the look-alikes', text: 'Sort the values you found into groups that look the same to a user.' },
            { title: 'Keep one per group', text: 'Keep the most-used value, or the one that passes contrast checks. List the rest as retired.' },
            { title: 'Keep what works', text: 'Keep the existing brand where it works. A design system is not a redesign unless you decide it is.' },
            { title: 'Redesigning anyway? Agree first', text: 'If a redesign is planned, agree on the new language before migrating, so teams change their code once, not twice.' },
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
            'Color, type, space, shape, icons, motion and voice are each written down.',
            'Every value has a job, not just a name.',
            'Text and controls meet WCAG 2.2 contrast minimums.',
            'Retired values are listed, so people know not to use them.',
            'Product leads agree it matches what ships, or what will.',
          ],
        },
      ],
    },
  ],
  sources: ['atomic', 'tokens', 'wcag'],
};
