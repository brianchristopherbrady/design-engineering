import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultPreview } from './config';
import { remember, rememberedPreview, rememberedProps } from './drafts';
import { initialValues } from './engine';
import { defineStory } from './types';

const story = (id: string) =>
  defineStory<{ size?: 'small' | 'large'; padding?: 'small' | 'large' }>({
    id,
    component: id,
    summary: '',
    imports: [],
    controls: [
      { kind: 'select', prop: 'size', options: ['small', 'large'], defaultValue: 'small', description: '' },
      { kind: 'select', prop: 'padding', options: ['small', 'large'], defaultValue: undefined, unsetLabel: 'token', unsetKind: 'token', description: '' },
    ],
    presets: [],
    render: () => null,
  });
const button = story('button');
const card = story('card');
const key = 'system-lab:playground';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('playground drafts', () => {
  it('remembers a draft per component and the last preview settings', () => {
    remember({ component: 'button', props: { ...initialValues(button), size: 'large' }, preview: { ...defaultPreview, theme: 'dark' } }, button);
    remember({ component: 'card', props: { ...initialValues(card), padding: 'small' }, preview: { ...defaultPreview, width: 320 } }, card);
    expect(rememberedProps(button).size).toBe('large');
    expect(rememberedProps(card).padding).toBe('small');
    expect(rememberedPreview()).toEqual({ ...defaultPreview, width: 320 });
  });

  it('reads malformed or foreign data as nothing remembered', () => {
    for (const value of ['not json', '{"v":2,"preview":"","drafts":{}}', '{"v":1,"preview":"","drafts":{"button":5}}', 'null']) {
      window.localStorage.setItem(key, value);
      expect(rememberedProps(button)).toEqual(initialValues(button));
      expect(rememberedPreview()).toEqual(defaultPreview);
    }
  });

  it('keeps working when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(() => remember({ component: 'button', props: initialValues(button), preview: defaultPreview }, button)).not.toThrow();
    expect(rememberedProps(button)).toEqual(initialValues(button));
  });
});
