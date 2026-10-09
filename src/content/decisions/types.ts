import type { ComponentType } from 'react';
import type { SourceId } from '@/domain/decisions';

/** Whether an example shows this project's real implementation or a labelled illustration. */
export type Evidence = 'implemented' | 'hypothetical' | 'proposed' | 'conceptual';

/** Text may use `code`, **strong** and Markdown-style links. */
export type Block =
  | { kind: 'text'; paragraphs: readonly string[] }
  | { kind: 'list'; ordered?: boolean; items: readonly string[] }
  | { kind: 'steps'; items: readonly { title: string; text: string; output?: string }[] }
  | {
      kind: 'table';
      caption: string;
      evidence?: Evidence;
      /** Scroll sideways with readable columns. */
      wide?: boolean;
      /** Show each row as a card, so no column is hidden off-screen. */
      stacked?: boolean;
      columns: readonly string[];
      rows: readonly (readonly string[])[];
    }
  | { kind: 'note'; title: string; text: string }
  | { kind: 'visual'; evidence?: Evidence; caption?: string; Visual: ComponentType }
  | { kind: 'code'; evidence: Evidence; caption: string; language: string; code: string }
  | { kind: 'details'; items: readonly { summary: string; blocks: readonly Block[] }[] }
  | { kind: 'evidence'; items: readonly { label: string; href: string; shows: string }[] };

export interface DecisionSection {
  id: string;
  title: string;
  blocks: readonly Block[];
}

export interface Decision {
  /** Catalog id; the page title and summary come from the catalog entry. */
  id: string;
  question: string;
  answer: string;
  sections: readonly DecisionSection[];
  sources?: readonly SourceId[];
}
