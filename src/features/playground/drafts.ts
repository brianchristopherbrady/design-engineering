import { decodePreview, decodeProps, encodePreview, encodeProps, type PlaygroundConfig, type PreviewSettings } from './config';
import type { AnyStory, ControlValues } from './types';

const storageKey = 'system-lab:playground';

/** Per-component prop drafts and the last preview settings, stored in the same encoding as the URL. */
interface Remembered {
  v: 1;
  preview: string;
  drafts: Record<string, string>;
}

const empty: Remembered = { v: 1, preview: '', drafts: {} };

function isRemembered(value: unknown): value is Remembered {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Remembered>;
  return (
    candidate.v === 1 &&
    typeof candidate.preview === 'string' &&
    typeof candidate.drafts === 'object' &&
    candidate.drafts !== null &&
    Object.values(candidate.drafts).every((draft) => typeof draft === 'string')
  );
}

/** Reads the store. Unavailable storage and malformed data both read as empty. */
function read(): Remembered {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null');
    return isRemembered(parsed) ? parsed : empty;
  } catch {
    return empty;
  }
}

export function rememberedProps(story: AnyStory): ControlValues {
  return decodeProps(story, new URLSearchParams(read().drafts[story.id] ?? ''));
}

export function rememberedPreview(): PreviewSettings {
  return decodePreview(new URLSearchParams(read().preview));
}

/** Records the example as the draft for its component and as the preview to use next time. */
export function remember(config: PlaygroundConfig, story: AnyStory): void {
  const stored = read();
  const next: Remembered = {
    v: 1,
    preview: new URLSearchParams(encodePreview(config.preview)).toString(),
    drafts: { ...stored.drafts, [story.id]: new URLSearchParams(encodeProps(story, config.props)).toString() },
  };
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Storage unavailable: the example still works for this visit, and the URL still holds it.
  }
}
