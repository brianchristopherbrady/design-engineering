import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Field } from '@/design-system/composites';
import { Button, Heading, iconNames, Input, Select, Switch, Text } from '@/design-system/primitives';
import { acceptedValues, buildProps, buildSnippet, initialValues, presetValues } from './engine';
import type { AnyControl, AnyStory, ControlValue, ControlValues } from './types';
import styles from './Playground.module.css';

const themes = ['inherit', 'light', 'dark'] as const;
type PreviewTheme = (typeof themes)[number];
const themeLabels: Record<PreviewTheme, string> = { inherit: 'Same as site', light: 'Light', dark: 'Dark' };

const widthPresets = [
  { label: 'Narrow', px: 320 },
  { label: 'Medium', px: 600 },
  { label: 'Wide', px: 960 },
] as const;
const minWidth = 240;
const maxWidth = 1280;

export interface PlaygroundProps {
  stories: readonly AnyStory[];
  storyId: string;
  onStoryChange: (id: string) => void;
  /** Links for the selected story, such as its documentation and source. */
  renderLinks: (story: AnyStory) => ReactNode;
}

/**
 * Storybook-style workbench. All playground state lives here, outside the components it
 * renders: the components only ever receive ordinary props.
 */
export function Playground({ stories, storyId, onStoryChange, renderLinks }: PlaygroundProps) {
  const story = stories.find((candidate) => candidate.id === storyId) ?? stories[0];
  if (!story) return null;
  return (
    <div className={styles.playground}>
      <div className={styles.picker}>
        <Field label="Component">
          {(control) => (
            <Select {...control} value={story.id} onChange={(event) => onStoryChange(event.target.value)}>
              {stories.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.component}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <div className={styles.pickerText}>
          <Text>{story.summary}</Text>
          {renderLinks(story)}
        </div>
      </div>
      <Workbench key={story.id} story={story} />
    </div>
  );
}

function Workbench({ story }: { story: AnyStory }) {
  const [values, setValues] = useState<ControlValues>(() => initialValues(story));
  const [theme, setTheme] = useState<PreviewTheme>('inherit');
  const [width, setWidth] = useState<number | null>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const ids = { preview: useId(), controls: useId(), usage: useId(), props: useId() };

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setMeasured(Math.round(entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const props = buildProps(story, values);
  const snippet = buildSnippet(story, values);
  const setValue = (prop: string, value: ControlValue) => {
    setCopied(false);
    setValues((current) => ({ ...current, [prop]: value }));
  };

  return (
    <div className={styles.workbench}>
      <section aria-labelledby={ids.preview} className={styles.previewPanel}>
        <Heading level={2} size="small" id={ids.preview}>
          Preview
        </Heading>
        <div className={styles.toolbar}>
          <div className={styles.toolGroup} role="group" aria-label="Presets">
            {story.presets.map((preset) => (
              <Button key={preset.name} size="small" onClick={() => setValues(presetValues(story, preset.name))}>
                {preset.name}
              </Button>
            ))}
            <Button size="small" appearance="ghost" onClick={() => setValues(initialValues(story))}>
              Reset controls
            </Button>
          </div>
          <div className={styles.toolGroup}>
            <Field label="Preview theme">
              {(control) => (
                <Select {...control} value={theme} onChange={(event) => setTheme(event.target.value as PreviewTheme)}>
                  {themes.map((option) => (
                    <option key={option} value={option}>
                      {themeLabels[option]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Preview width" description={measured === null ? undefined : `${measured}px`}>
              {(control) => (
                <input
                  {...control}
                  type="range"
                  className={styles.range}
                  min={minWidth}
                  max={maxWidth}
                  step={8}
                  value={width ?? maxWidth}
                  aria-valuetext={width === null ? 'Fill available width' : `${width} pixels`}
                  onChange={(event) => setWidth(Number(event.target.value))}
                />
              )}
            </Field>
          </div>
          <div className={styles.toolGroup} role="group" aria-label="Preview width presets">
            {widthPresets.map((preset) => (
              <Button key={preset.label} size="small" aria-pressed={width === preset.px} onClick={() => setWidth(preset.px)}>
                {preset.label} ({preset.px}px)
              </Button>
            ))}
            <Button size="small" aria-pressed={width === null} onClick={() => setWidth(null)}>
              Fill
            </Button>
          </div>
        </div>
        <div className={styles.stage}>
          <div
            ref={frameRef}
            className={styles.frame}
            data-theme={theme === 'inherit' ? undefined : theme}
            data-testid="playground-preview"
            style={{ inlineSize: width === null ? '100%' : `${width}px` }}
          >
            {story.render(props)}
          </div>
        </div>
        {story.previewNote && (
          <Text variant="bodySmall" tone="muted">
            {story.previewNote}
          </Text>
        )}
      </section>

      <section aria-labelledby={ids.controls} className={styles.controlsPanel}>
        <Heading level={2} size="small" id={ids.controls}>
          Controls
        </Heading>
        <div className={styles.controls}>
          {story.controls.map((control) => (
            <ControlField
              key={control.prop}
              control={control}
              value={values[control.prop]}
              onChange={(value) => setValue(control.prop, value)}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby={ids.usage} className={styles.usagePanel}>
        <div className={styles.usageHeader}>
          <Heading level={2} size="small" id={ids.usage}>
            Usage
          </Heading>
          <Button
            size="small"
            onClick={() => {
              void navigator.clipboard?.writeText(snippet).then(() => setCopied(true));
            }}
          >
            Copy code
          </Button>
          <span role="status" className={styles.copied}>
            {copied ? 'Copied' : ''}
          </span>
        </div>
        <pre className={styles.code} tabIndex={0} role="region" aria-labelledby={ids.usage}>
          <code data-testid="playground-snippet">{snippet}</code>
        </pre>
      </section>

      <section aria-labelledby={ids.props} className={styles.propsPanel}>
        <Heading level={2} size="small" id={ids.props}>
          Props
        </Heading>
        <div className={styles.tableScroller} tabIndex={0} role="region" aria-label={`${story.component} controlled props`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Accepted values</th>
                <th scope="col">Initial</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {story.controls.map((control) => (
                <tr key={control.prop}>
                  <th scope="row">
                    <code>{control.prop}</code>
                  </th>
                  <td>
                    <code>{acceptedValues(control)}</code>
                  </td>
                  <td>
                    <code>{control.defaultValue === undefined ? (control.kind === 'select' && control.unsetLabel) || 'unset' : String(control.defaultValue)}</code>
                  </td>
                  <td>{control.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ControlField({
  control,
  value,
  onChange,
}: {
  control: AnyControl;
  value: ControlValue;
  onChange: (value: ControlValue) => void;
}) {
  switch (control.kind) {
    case 'switch':
      return (
        <Switch
          label={<code>{control.prop}</code>}
          description={control.description}
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
      );
    case 'text':
      return (
        <Field label={<code>{control.prop}</code>} description={control.description}>
          {(field) => <Input {...field} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />}
        </Field>
      );
    case 'icon':
      return (
        <Field label={<code>{control.prop}</code>} description={control.description}>
          {(field) => (
            <Select {...field} value={String(value ?? '')} onChange={(event) => onChange(event.target.value || undefined)}>
              <option value="">None</option>
              {iconNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      );
    case 'select':
      return (
        <Field label={<code>{control.prop}</code>} description={control.description}>
          {(field) => (
            <Select
              {...field}
              value={value === undefined ? '' : String(value)}
              onChange={(event) =>
                onChange(control.options.find((option) => String(option) === event.target.value))
              }
            >
              {control.unsetLabel && <option value="">Unset: {control.unsetLabel}</option>}
              {control.options.map((option) => (
                <option key={option} value={String(option)}>
                  {String(option)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      );
  }
}
