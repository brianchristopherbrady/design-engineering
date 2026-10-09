import { useId } from 'react';
import { Tabs } from '@/design-system/composites';
import { Badge, Button, Icon, Text } from '@/design-system/primitives';
import { ScrollRegion } from '@/design-system/layout';
import type { ExportFile } from './brand';
import { CopyButton } from './CopyButton';
import styles from './ThemeStudio.module.css';
import type { ThemeStudioState } from './useThemeStudio';

function download(file: ExportFile) {
  const url = URL.createObjectURL(new Blob([file.content], { type: file.filename.endsWith('.json') ? 'application/json' : 'text/plain' }));
  const anchor = Object.assign(document.createElement('a'), { href: url, download: file.filename });
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function ExportView({ file }: { file: ExportFile }) {
  const pathId = useId();
  return (
    <div className={styles.exportFile}>
      <div className={styles.exportHeader}>
        <div className={styles.exportTarget}>
          <Badge size="small" tone={file.action === 'create' ? 'brand' : 'neutral'}>
            {file.action === 'create' ? 'New file' : 'Merge into'}
          </Badge>
          <code id={pathId} className={styles.exportPath}>
            {file.path}
          </code>
        </div>
        <div className={styles.actions}>
          <CopyButton text={file.content} />
          <Button size="small" appearance="ghost" iconStart={<Icon name="download" />} onClick={() => download(file)}>
            Download
          </Button>
        </div>
      </div>
      <ScrollRegion axis="both" as="pre" className={styles.code} data-theme="dark" aria-labelledby={pathId}>
        <code>{file.content}</code>
      </ScrollRegion>
    </div>
  );
}

/** The generated sources, one tab per destination, each ready to copy or download. */
export function ExportPanel({ studio }: { studio: ThemeStudioState }) {
  return (
    <>
      <Text variant="bodySmall" tone="muted">
        Six pieces for <code>{studio.id}</code>: one new token file, four objects to merge into existing sources, and the
        profile TypeScript requires for every product.
      </Text>
      <Tabs
        label="Generated sources"
        items={studio.files.map((file) => ({ id: file.key, label: file.label, content: <ExportView file={file} /> }))}
      />
    </>
  );
}
