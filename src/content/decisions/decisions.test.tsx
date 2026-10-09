import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { decisions, decisionTopics } from './topics';
import type { Block } from './types';

const blocksOf = (blocks: readonly Block[]): Block[] => blocks.flatMap((block) => (block.kind === 'details' ? [block, ...block.items.flatMap((item) => blocksOf(item.blocks))] : [block]));

describe('design decisions', () => {
  it('states one question and a short answer on every page', () => {
    for (const decision of decisions) {
      expect(decision.question.endsWith('?'), decision.id).toBe(true);
      expect(decision.answer.split(/(?<=\.)\s/).length, decision.id).toBeLessThanOrEqual(4);
    }
  });

  it('labels hypothetical and proposed material', () => {
    const tables = decisions.flatMap((decision) => decision.sections.flatMap((section) => blocksOf(section.blocks))).filter((block) => block.kind === 'table');
    const labelled = tables.filter((table) => table.kind === 'table' && table.evidence);
    expect(labelled.length).toBeGreaterThanOrEqual(5);
    const code = decisions.flatMap((decision) => decision.sections.flatMap((section) => blocksOf(section.blocks))).filter((block) => block.kind === 'code');
    for (const block of code) expect(block.kind === 'code' && block.evidence).toBe('conceptual');
  });

  it.each(decisionTopics.map((topic) => [topic.id, topic] as const))('renders %s with its question and every section', (_, topic) => {
    render(<topic.Content />);
    expect(screen.getByText(topic.question)).toBeInTheDocument();
    for (const section of topic.sections) expect(screen.getByRole('heading', { level: 2, name: section.label })).toBeInTheDocument();
  });

  it('updates the sharing comparison when a constraint changes', async () => {
    const user = userEvent.setup();
    const sharing = decisionTopics.find((topic) => topic.id === 'sharing');
    if (!sharing) throw new Error('No sharing page');
    render(<sharing.Content />);
    expect(screen.queryByText(/Native and web code cannot be shared directly/)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'The mobile product is' }), 'native');
    expect(screen.getByText(/Native and web code cannot be shared directly/)).toBeInTheDocument();
  });
});
