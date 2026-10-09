import { Stack } from '@/design-system/layout';
import { Link, Text } from '@/design-system/primitives';
import { DocSection } from '@/features/docs';
import { articleHref, BlockView, InShort, Sources } from './Blocks';
import type { Article } from './types';
import styles from './wiki.module.css';

export function articleSections(article: Article) {
  return [...article.sections.map((section) => ({ id: section.id, label: section.title })), ...(article.sources?.length ? [{ id: 'sources', label: 'Sources' }] : [])];
}

export function articleContent(article: Article) {
  return function ArticleContent() {
    return <WikiArticle article={article} />;
  };
}

export function WikiArticle({ article }: { article: Article }) {
  return (
    <div className={styles.article}>
      <Stack gap="extraLarge">
        <InShort items={article.inShort} />
        {article.sections.map((section) => (
          <DocSection key={section.id} id={section.id} title={section.title}>
            {section.blocks.map((block, index) => (
              <BlockView key={index} block={block} />
            ))}
            {section.id === 'existing' && article.id !== 'migration' && !section.blocks.some((block) => block.kind === 'related' && block.ids.includes('migration')) && (
              <Text variant="bodySmall" tone="muted">
                The full step-by-step plan is in <Link href={articleHref('migration')}>Migrating existing products</Link>.
              </Text>
            )}
          </DocSection>
        ))}
        {article.sources?.length ? (
          <DocSection id="sources" title="Sources">
            <Sources ids={article.sources} />
          </DocSection>
        ) : null}
      </Stack>
    </div>
  );
}
