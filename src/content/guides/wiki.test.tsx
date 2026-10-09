import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sources } from '@/domain/planning';
import { entriesOfKind, findEntry, wikiGroups } from '@/domain/system';
import { guideTopics } from './topics';
import { articles } from './articles';

describe('wiki articles', () => {
  it('lists every article once, in the reading order of the groups', () => {
    expect(guideTopics.map((topic) => topic.id)).toEqual(wikiGroups.flatMap((group) => group.ids));
    expect(articles.map((article) => article.id).sort()).toEqual(entriesOfKind('guide').map((entry) => entry.id).sort());
  });

  it('gives every article a short summary and unique section ids', () => {
    for (const article of articles) {
      expect(article.inShort.length, article.id).toBeGreaterThanOrEqual(2);
      const ids = article.sections.map((section) => section.id);
      expect(new Set(ids).size, article.id).toBe(ids.length);
      expect(ids, article.id).not.toContain('sources');
    }
  });

  it('explains how to bring existing products along in every article but the migration plan itself', () => {
    const missing = articles.filter((article) => article.id !== 'migration' && !article.sections.some((section) => section.id === 'existing')).map((article) => article.id);
    expect(missing).toEqual([]);
  });

  it('ends every article about a part of the system with a checklist', () => {
    const parts = wikiGroups.filter((group) => group.heading !== 'Introduction').flatMap((group) => group.ids);
    for (const id of parts) {
      const article = articles.find((candidate) => candidate.id === id);
      expect(article?.sections.at(-1)?.blocks.some((block) => block.kind === 'checklist'), id).toBe(true);
    }
  });

  it('links only to articles and sources that exist', () => {
    const sourceIds = new Set<string>(sources.map((source) => source.id));
    for (const article of articles) {
      for (const id of article.sources ?? []) expect(sourceIds.has(id), `${article.id}: ${id}`).toBe(true);
      for (const block of article.sections.flatMap((section) => section.blocks)) {
        if (block.kind === 'related') for (const id of block.ids) expect(findEntry(id)?.kind, `${article.id} links to ${id}`).toBe('guide');
      }
    }
  });

  it.each(guideTopics.map((topic) => [topic.id, topic] as const))('renders %s with a heading for every section', (_, topic) => {
    render(<topic.Content />);
    for (const section of topic.sections) expect(screen.getByRole('heading', { level: 2, name: section.label })).toBeInTheDocument();
  });
});
