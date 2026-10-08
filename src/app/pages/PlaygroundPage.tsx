import { useSearchParams } from 'react-router';
import { Inline } from '@/design-system/layout';
import { Icon, Link } from '@/design-system/primitives';
import { playgroundStories } from '@/content/components';
import { findEntry } from '@/domain/system';
import { Playground } from '@/features/playground';
import { paths } from '../paths';
import { DocPage } from './DocPage';

export function PlaygroundPage() {
  const [search, setSearch] = useSearchParams();
  const requested = search.get('component');
  const storyId = playgroundStories.some((story) => story.id === requested) ? (requested ?? '') : (playgroundStories[0]?.id ?? '');

  return (
    <DocPage
      title="Playground"
      eyebrow="Design system"
      width="wide"
      description="Choose a component, change its public props with the controls, and copy the matching code. The preview is its own query container: resize it to test narrow layouts without resizing the window."
    >
      <Playground
        stories={playgroundStories}
        storyId={storyId}
        onStoryChange={(id) => setSearch({ component: id }, { replace: true, preventScrollReset: true })}
        renderLinks={(story) => (
          <Inline gap="medium">
            <Link href={paths.component(story.id)} variant="standalone">
              {findEntry(story.id)?.name ?? story.component} documentation <Icon name="arrowRight" />
            </Link>
            <Link href={`${paths.component(story.id)}#source`} variant="standalone">
              Source <Icon name="arrowRight" />
            </Link>
          </Inline>
        )}
      />
    </DocPage>
  );
}
