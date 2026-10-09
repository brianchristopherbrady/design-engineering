import type { ComponentType } from 'react';
import type { IconName } from '@/design-system/primitives';
import type { SourceId } from '@/domain/planning';

/** A short titled point; `text` may use `backticks` for code. */
export interface Point {
  title: string;
  text: string;
  icon?: IconName;
}

export type Block =
  | { kind: 'text'; paragraphs: readonly string[] }
  | { kind: 'points'; items: readonly Point[] }
  | { kind: 'steps'; items: readonly Point[] }
  | { kind: 'doDont'; items: readonly { dont: string; do: string }[] }
  | { kind: 'checklist'; items: readonly string[] }
  | { kind: 'table'; caption: string; columns: readonly string[]; rows: readonly (readonly string[])[] }
  | { kind: 'note'; title: string; text: string }
  | { kind: 'visual'; caption?: string; Visual: ComponentType }
  | { kind: 'details'; items: readonly { summary: string; body: readonly string[] }[] }
  | { kind: 'related'; ids: readonly string[] };

export interface ArticleSection {
  id: string;
  title: string;
  blocks: readonly Block[];
}

export interface Article {
  /** Catalog id; the page title and summary come from the catalog entry. */
  id: string;
  /** Three or so takeaways shown before everything else. */
  inShort: readonly string[];
  sections: readonly ArticleSection[];
  sources?: readonly SourceId[];
}
