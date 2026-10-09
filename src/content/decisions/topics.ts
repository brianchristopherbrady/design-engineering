import type { ComponentType } from 'react';
import { implementation } from './articles/implementation';
import { operating } from './articles/operating';
import { planning } from './articles/planning';
import { sharing } from './articles/sharing';
import { decisionContent, decisionSections } from './DecisionArticle';
import type { Decision } from './types';

export interface DecisionTopic {
  /** Catalog id; the title and summary come from the catalog entry. */
  id: string;
  question: string;
  answer: string;
  sections: readonly { id: string; label: string }[];
  Content: ComponentType;
}

export const decisions: readonly Decision[] = [planning, sharing, implementation, operating];

export const decisionTopics: readonly DecisionTopic[] = decisions.map((decision) => ({
  id: decision.id,
  question: decision.question,
  answer: decision.answer,
  sections: decisionSections(decision),
  Content: decisionContent(decision),
}));

export function findDecisionTopic(id: string): DecisionTopic | undefined {
  return decisionTopics.find((topic) => topic.id === id);
}
