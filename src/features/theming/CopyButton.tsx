import { useEffect, useState } from 'react';
import { Button, Icon, VisuallyHidden } from '@/design-system/primitives';

type CopyState = 'idle' | 'copied' | 'failed';

/** Copies text to the clipboard and says so, visibly on the button and to assistive technology. */
export function CopyButton({ text, label = 'Copy' }: { text: string | (() => string); label?: string }) {
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(typeof text === 'function' ? text() : text);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  return (
    <>
      <Button size="small" iconStart={state === 'copied' ? <Icon name="check" /> : undefined} onClick={() => void copy()}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}
      </Button>
      <VisuallyHidden role="status">
        {state === 'copied' ? 'Copied to the clipboard.' : state === 'failed' ? 'Copy failed. Select the text and copy it instead.' : ''}
      </VisuallyHidden>
    </>
  );
}
