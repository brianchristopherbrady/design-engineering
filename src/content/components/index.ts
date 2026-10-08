import type { ComponentDoc } from '@/features/docs';
import { compositeDocs } from './docs/composites';
import { layoutDocs } from './docs/layout';
import { primitiveDocs } from './docs/primitives';

export const componentDocs: readonly ComponentDoc[] = [...layoutDocs, ...primitiveDocs, ...compositeDocs];

export function findComponentDoc(id: string): ComponentDoc | undefined {
  return componentDocs.find((doc) => doc.id === id);
}

export { findStory, playgroundStories } from './stories';
