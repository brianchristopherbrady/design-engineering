import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Disclosure, Field } from '@/design-system/composites';
import { ScrollRegion, ThemeScope, useThemeScope } from '@/design-system/layout';
import { Button, Heading, iconNames, Input, Select, Switch, Text } from '@/design-system/primitives';
import { densityNames, productNames, themeNames, type ModifierInput, type ThemeName } from '@/design-system/tokens';
import { densityLabels, productProfiles } from '@/domain/system';
import { inherit, previewWidth, withCapturedAppearance, type Inheritable, type PlaygroundConfig, type PreviewSettings } from './config';
import { acceptedValues, buildProps, buildSnippet, initialValues, presetValues } from './engine';
import { ContainerInspector } from './ContainerOverlay';
import type { AnyControl, AnyStory, ControlValue, ControlValues } from './types';
import styles from './Playground.module.css';

type Modifier = keyof ModifierInput;

const modifiers: readonly Modifier[] = ['product', 'theme', 'density'];
const themeLabels: Record<ThemeName, string> = { light: 'Light', dark: 'Dark' };
const modifierLabel = (modifier: Modifier, input: ModifierInput) =>
  modifier === 'product' ? productProfiles[input.product].name : modifier === 'theme' ? themeLabels[input.theme] : densityLabels[input.density];

const widthPresets = [
  { label: 'Narrow', px: 320 },
  { label: 'Medium', px: 600 },
  { label: 'Wide', px: 960 },
] as const;

export interface PlaygroundProps {
  stories: readonly AnyStory[];
  /** The example to show: component, props and preview settings. */
  config: PlaygroundConfig;
  /** An edit to the example. */
  onConfigChange: (config: PlaygroundConfig) => void;
  /** A different component, whose own draft the owner restores. */
  onStoryChange: (id: string) => void;
  /** An absolute URL that reproduces an example. */
  linkFor: (config: PlaygroundConfig) => string;
  /** Links for the selected story, such as its documentation and source. */
  renderLinks: (story: AnyStory) => ReactNode;
}

/**
 * Storybook-style workbench. Its state is the configuration it receives, kept outside the
 * components it renders: the components only ever receive ordinary props.
 */
export function Playground({ stories, config, onConfigChange, onStoryChange, linkFor, renderLinks }: PlaygroundProps) {
  const story = stories.find((candidate) => candidate.id === config.component) ?? stories[0];
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
      <dl className={styles.scopes} aria-label="What each set of settings changes">
        <div>
          <dt>Site appearance</dt>
          <dd>The header controls restyle the whole site.</dd>
        </div>
        <div>
          <dt>Preview settings</dt>
          <dd>Product, theme, density and width for this example only.</dd>
        </div>
        <div>
          <dt>Component props</dt>
          <dd>The selected component’s public API.</dd>
        </div>
      </dl>
      <Workbench key={story.id} story={story} config={config} onConfigChange={onConfigChange} linkFor={linkFor} />
    </div>
  );
}

type Share = { status: 'copied' | 'failed'; url: string } | null;

function Workbench({
  story,
  config,
  onConfigChange,
  linkFor,
}: {
  story: AnyStory;
  config: PlaygroundConfig;
  onConfigChange: (config: PlaygroundConfig) => void;
  linkFor: (config: PlaygroundConfig) => string;
}) {
  const site = useThemeScope();
  const values = config.props;
  const overrides = config.preview;
  const { width } = overrides;
  const [measured, setMeasured] = useState<number | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [share, setShare] = useState<Share>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const manualLinkRef = useRef<HTMLInputElement>(null);
  const ids = { preview: useId(), controls: useId(), presets: useId(), usage: useId(), shareHelp: useId() };

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setMeasured(Math.round(entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const preview: ModifierInput = {
    theme: overrides.theme === inherit ? site.theme : overrides.theme,
    product: overrides.product === inherit ? site.product : overrides.product,
    density: overrides.density === inherit ? site.density : overrides.density,
  };
  const overridden = modifiers.filter((modifier) => overrides[modifier] !== inherit);
  const context = [...modifiers.map((modifier) => modifierLabel(modifier, preview)), measured === null ? null : `${measured}px`]
    .filter(Boolean)
    .join(' · ');

  const exampleLink = linkFor(withCapturedAppearance(config, site));
  // Feedback belongs to the link it was about; any later change makes it stale.
  const shareFeedback = share?.url === exampleLink ? share : null;

  useEffect(() => {
    if (shareFeedback?.status !== 'failed') return;
    manualLinkRef.current?.focus();
    manualLinkRef.current?.select();
  }, [shareFeedback?.status]);

  const copyLink = () => {
    const url = exampleLink;
    if (typeof navigator.clipboard?.writeText !== 'function') {
      setShare({ status: 'failed', url });
      return;
    }
    navigator.clipboard.writeText(url).then(
      () => setShare({ status: 'copied', url }),
      () => setShare({ status: 'failed', url }),
    );
  };

  const setValues = (props: ControlValues) => onConfigChange({ ...config, props });
  const setPreview = (changes: Partial<PreviewSettings>) => onConfigChange({ ...config, preview: { ...config.preview, ...changes } });
  const props = buildProps(story, values);
  const snippet = buildSnippet(story, values);
  const setValue = (prop: string, value: ControlValue) => setValues({ ...values, [prop]: value });

  return (
    <div className={styles.workbench}>
      <section aria-labelledby={ids.preview} className={styles.previewPanel}>
        <div className={styles.previewHeader}>
          <Heading level={2} size="small" id={ids.preview}>
            Preview
          </Heading>
          <Button size="small" aria-describedby={ids.shareHelp} onClick={copyLink}>
            Copy example link
          </Button>
        </div>
        <Text variant="bodySmall" tone="muted" id={ids.shareHelp}>
          Copies this example’s props and current preview appearance.
        </Text>
        <Text variant="bodySmall" role="status">
          {shareFeedback?.status === 'copied' ? 'Example link copied.' : ''}
          {shareFeedback?.status === 'failed' ? 'The link could not be copied automatically. Select it below and copy it.' : ''}
        </Text>
        {shareFeedback?.status === 'failed' && (
          <Field label="Example link">
            {(control) => (
              <Input {...control} ref={manualLinkRef} readOnly value={shareFeedback.url} onFocus={(event) => event.currentTarget.select()} />
            )}
          </Field>
        )}
        <div className={styles.stage}>
          <ContainerInspector enabled={overrides.outlines}>
            <ThemeScope
              ref={frameRef}
              className={styles.frame}
              theme={overrides.theme === inherit ? undefined : overrides.theme}
              product={overrides.product === inherit ? undefined : overrides.product}
              density={overrides.density === inherit ? undefined : overrides.density}
              data-testid="playground-preview"
              // A fixed width never exceeds the stage, so a wide request cannot overflow a narrow screen.
              style={{ inlineSize: width === null ? '100%' : `min(${width}px, 100%)` }}
            >
              {story.render(props)}
            </ThemeScope>
          </ContainerInspector>
        </div>
        {story.previewNote && (
          <Text variant="bodySmall" tone="muted">
            {story.previewNote}
          </Text>
        )}

        <Disclosure
          className={styles.settings}
          summary={
            <span className={styles.settingsSummary}>
              <span>Preview settings</span>
              <span className={styles.context} data-testid="preview-context">
                {context}
                <span className={styles.contextSource}>
                  {overridden.length === 0 ? 'Same as site' : `Overrides ${overridden.join(', ')}`}
                </span>
              </span>
            </span>
          }
        >
          <div className={styles.toolbar}>
            <div className={styles.scopeGroup}>
              <ScopeSelect
                label="Preview product"
                value={overrides.product}
                options={productNames.map((name) => [name, productProfiles[name].name] as const)}
                onChange={(product) => setPreview({ product })}
              />
              <ScopeSelect
                label="Preview theme"
                value={overrides.theme}
                options={themeNames.map((name) => [name, themeLabels[name]] as const)}
                onChange={(theme) => setPreview({ theme })}
              />
              <ScopeSelect
                label="Preview density"
                value={overrides.density}
                options={densityNames.map((name) => [name, densityLabels[name]] as const)}
                onChange={(density) => setPreview({ density })}
              />
              <Field
                label="Preview width"
                description={measured === null ? undefined : `${measured}px`}
                className={styles.widthField}
              >
                {(control) => (
                  <input
                    {...control}
                    type="range"
                    className={styles.range}
                    min={previewWidth.min}
                    max={previewWidth.max}
                    step={8}
                    value={width ?? previewWidth.max}
                    aria-valuetext={width === null ? 'Fill available width' : `${width} pixels`}
                    onChange={(event) => setPreview({ width: Number(event.target.value) })}
                  />
                )}
              </Field>
            </div>
            <div className={styles.segmented} role="group" aria-label="Preview width presets">
              {widthPresets.map((preset) => (
                <Button key={preset.label} size="small" aria-pressed={width === preset.px} onClick={() => setPreview({ width: preset.px })}>
                  {preset.label} ({preset.px}px)
                </Button>
              ))}
              <Button size="small" aria-pressed={width === null} onClick={() => setPreview({ width: null })}>
                Fill
              </Button>
            </div>
            <Switch
              label="Show query containers"
              description="Outline every container the preview's components query, with its live width."
              checked={overrides.outlines}
              onChange={(event) => setPreview({ outlines: event.target.checked })}
            />
          </div>
        </Disclosure>

        {story.inheritsScope && <ScopeChain story={story} site={site} preview={preview} overrides={overrides} values={values} />}
      </section>

      <section aria-labelledby={ids.controls} className={styles.controlsPanel}>
        <Heading level={2} size="small" id={ids.controls}>
          Component props
        </Heading>
        {story.presets.length > 0 && (
          <div className={styles.presets} role="group" aria-labelledby={ids.presets}>
            <Text as="p" variant="caption" tone="muted" id={ids.presets}>
              Example presets
            </Text>
            <Text variant="bodySmall" tone="muted">
              Each fills in several component props.
            </Text>
            <div className={styles.toolGroup}>
              {story.presets.map((preset) => (
                <Button key={preset.name} size="small" onClick={() => setValues(presetValues(story, preset.name))}>
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div>
          <Button size="small" appearance="ghost" onClick={() => setValues(initialValues(story))}>
            Reset component props
          </Button>
        </div>
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
              void navigator.clipboard?.writeText(snippet).then(() => setCopiedSnippet(snippet));
            }}
          >
            Copy code
          </Button>
          <span role="status" className={styles.copied}>
            {copiedSnippet === snippet ? 'Copied' : ''}
          </span>
        </div>
        <ScrollRegion as="pre" className={styles.code} data-theme="dark" aria-labelledby={ids.usage}>
          <code data-testid="playground-snippet">{snippet}</code>
        </ScrollRegion>
      </section>

      <div className={styles.propsPanel}>
        <Disclosure summary={`Props reference (${story.controls.length} props)`}>
          <ScrollRegion aria-label={`${story.component} controlled props`}>
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
          </ScrollRegion>
        </Disclosure>
      </div>
    </div>
  );
}

/** Where each modifier comes from for a component that inherits its scope: site, then preview, then its own props. */
function ScopeChain({
  story,
  site,
  preview,
  overrides,
  values,
}: {
  story: AnyStory;
  site: ModifierInput;
  preview: ModifierInput;
  overrides: Record<Modifier, string>;
  values: ControlValues;
}) {
  const own = (modifier: Modifier) => values[modifier] as ModifierInput[Modifier] | undefined;
  const result = (modifier: Modifier): ModifierInput => ({ ...preview, [modifier]: own(modifier) ?? preview[modifier] });
  return (
    <div className={styles.chain}>
      <ScrollRegion axis="inline" aria-label={`Where ${story.component} gets each setting`}>
        <table className={styles.table}>
          <caption className={styles.chainCaption}>Where {story.component} gets each setting</caption>
          <thead>
            <tr>
              <th scope="col">Setting</th>
              <th scope="col">Site</th>
              <th scope="col">Preview</th>
              <th scope="col">{story.component}</th>
            </tr>
          </thead>
          <tbody>
            {modifiers.map((modifier) => (
              <tr key={modifier}>
                <th scope="row">
                  <code>{modifier}</code>
                </th>
                <td>{modifierLabel(modifier, site)}</td>
                <td>
                  {modifierLabel(modifier, preview)}{' '}
                  <span className={styles.source}>{overrides[modifier] === inherit ? 'from site' : 'preview setting'}</span>
                </td>
                <td>
                  {modifierLabel(modifier, result(modifier))}{' '}
                  <span className={styles.source}>{own(modifier) === undefined ? 'from preview' : 'prop'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
      <Text variant="bodySmall" tone="muted">
        An unset {story.component} prop inherits from the scope around it, here the preview, which follows the site unless a
        preview setting overrides it. That is different from an unset Button <code>radius</code>, which uses the{' '}
        <code>button.radius</code> component token.
      </Text>
    </div>
  );
}

function ScopeSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: Inheritable<T>;
  options: readonly (readonly [T, string])[];
  onChange: (value: Inheritable<T>) => void;
}) {
  return (
    <Field label={label}>
      {(control) => (
        <Select {...control} value={value} onChange={(event) => onChange(event.target.value as Inheritable<T>)}>
          <option value={inherit}>Same as site</option>
          {options.map(([option, text]) => (
            <option key={option} value={option}>
              {text}
            </option>
          ))}
        </Select>
      )}
    </Field>
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
