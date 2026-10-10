import { useCallback, useEffect, useMemo } from 'react';
import { useHref, useLocation, useNavigate, useSearchParams } from 'react-router';
import { parseSearch, toSearchParams, type PlaygroundConfig } from './config';
import { remember, rememberedPreview, rememberedProps } from './drafts';
import type { AnyStory } from './types';

type History = 'push' | 'replace';

/**
 * The Playground's single state: read from the URL, written back to it, and mirrored into a
 * per-browser draft store. A configured URL always wins; without one, the remembered draft for
 * the requested component (or the fallback) fills in, and the URL is then rewritten to match.
 */
export function usePlaygroundConfig(stories: readonly AnyStory[], fallbackId: string) {
  const [search] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pathHref = useHref(location.pathname);

  const storyFor = useCallback(
    (id: string) => stories.find((story) => story.id === id) ?? stories.find((story) => story.id === fallbackId) ?? stories[0],
    [stories, fallbackId],
  );

  const parsed = useMemo(() => parseSearch(search, stories, fallbackId), [search, stories, fallbackId]);
  const config = useMemo<PlaygroundConfig | undefined>(() => {
    if (parsed.kind === 'configured') return parsed.config;
    const story = storyFor(parsed.component);
    return story && { component: story.id, props: rememberedProps(story), preview: rememberedPreview() };
  }, [parsed, storyFor]);
  const story = config && storyFor(config.component);

  const write = useCallback(
    (next: PlaygroundConfig, history: History) => {
      const nextStory = storyFor(next.component);
      if (!nextStory) return;
      void navigate(
        { search: `?${toSearchParams(next, nextStory).toString()}`, hash: location.hash },
        { replace: history === 'replace', preventScrollReset: true },
      );
    },
    [navigate, location.hash, storyFor],
  );

  // A bare or legacy URL becomes the configured URL for what is shown, without a new history entry.
  useEffect(() => {
    if (parsed.kind === 'component' && config) write(config, 'replace');
  }, [parsed, config, write]);

  useEffect(() => {
    if (config && story) remember(config, story);
  }, [config, story]);

  /** Routine edits replace the history entry, so Back leaves the Playground instead of undoing each change. */
  const update = useCallback((next: PlaygroundConfig) => write(next, 'replace'), [write]);

  /** Switching component is navigation: it adds an entry, and restores that component's draft. */
  const selectStory = useCallback(
    (id: string) => {
      const next = storyFor(id);
      if (next && config) write({ component: next.id, props: rememberedProps(next), preview: config.preview }, 'push');
    },
    [config, storyFor, write],
  );

  /** An absolute link to an example, under the deployment's base path. */
  const linkFor = useCallback(
    (example: PlaygroundConfig) => {
      const exampleStory = storyFor(example.component);
      const query = exampleStory ? `?${toSearchParams(example, exampleStory).toString()}` : '';
      return new URL(`${pathHref}${query}`, window.location.origin).href;
    },
    [pathHref, storyFor],
  );

  return { config, story, update, selectStory, linkFor };
}
