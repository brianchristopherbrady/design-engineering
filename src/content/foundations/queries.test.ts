import { describe, expect, it } from 'vitest';
import { parseQueries } from './queries';

describe('parseQueries', () => {
  it('finds named and unnamed container queries, media queries and their explanatory comments', () => {
    const css = [
      '@layer product {',
      '  /* 28rem: room for the summary beside a button. */',
      '  @container entry (min-inline-size: 28rem) {',
      '    .layout { display: grid; }',
      '  }',
      '  @container (width > 40rem) { .x { color: red; } }',
      '  @media (width >= 64rem) { .y { display: none; } }',
      '  @media (prefers-reduced-motion: reduce) { * { animation: none; } }',
      '}',
    ].join('\n');
    expect(parseQueries('a.css', css)).toEqual([
      { file: 'a.css', line: 3, kind: 'container', target: 'entry', condition: '(min-inline-size: 28rem)', reason: '28rem: room for the summary beside a button.' },
      { file: 'a.css', line: 6, kind: 'container', target: 'nearest', condition: '(width > 40rem)', reason: '' },
      { file: 'a.css', line: 7, kind: 'media', target: 'viewport', condition: '(width >= 64rem)', reason: '' },
      { file: 'a.css', line: 8, kind: 'media', target: 'viewport', condition: '(prefers-reduced-motion: reduce)', reason: '' },
    ]);
  });
});
