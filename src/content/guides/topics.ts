import type { ComponentType } from 'react';
import { wikiGroups } from '@/domain/system';
import { articles } from './articles';
import type { Article } from './wiki/types';
import { articleContent, articleSections } from './wiki/WikiArticle';

export interface GuideTopic {
  /** Catalog id; title and summary come from the catalog entry. */
  id: string;
  group: string;
  sections: readonly { id: string; label: string }[];
  Content: ComponentType;
}

const groups = wikiGroups.map((group) => ({
  heading: group.heading,
  articles: group.ids.map((id) => articles.find((article) => article.id === id)).filter((article): article is Article => article !== undefined),
}));

export const guideTopics: readonly GuideTopic[] = groups.flatMap((group) =>
  group.articles.map((article) => ({ id: article.id, group: group.heading, sections: articleSections(article), Content: articleContent(article) })),
);

export const guideGroups: readonly { heading: string; ids: readonly string[] }[] = groups.map((group) => ({
  heading: group.heading,
  ids: group.articles.map((article) => article.id),
}));

export function findGuideTopic(id: string): GuideTopic | undefined {
  return guideTopics.find((topic) => topic.id === id);
}

/** The articles before and after one, in reading order. */
export function neighbors(id: string): { previous?: GuideTopic; next?: GuideTopic } {
  const index = guideTopics.findIndex((topic) => topic.id === id);
  return index < 0 ? {} : { previous: guideTopics[index - 1], next: guideTopics[index + 1] };
}
