import { useState, type CSSProperties } from 'react';
import { Field } from '@/design-system/composites';
import { Button, Icon, Input, Text } from '@/design-system/primitives';
import { closeDistance, formatDistance, shapeNames, shapes } from './brand';
import { ChoiceGroup } from './ChoiceGroup';
import { CopyButton } from './CopyButton';
import styles from './ThemeStudio.module.css';
import { studioPresets, type ThemeStudioState } from './useThemeStudio';

const swatch = (color: string) => ({ '--_swatch': color }) as CSSProperties;

/** Brand color, presets, product id and shape: every input the studio has. */
export function StudioControls({ studio }: { studio: ThemeStudioState }) {
  const [brandTouched, setBrandTouched] = useState(false);
  const showBrandProblem = (brandTouched || studio.brandDraft.length >= 7) && studio.brandProblem;
  return (
    <div className={styles.console}>
      <div className={styles.inputs}>
        <Field
          label="Brand color"
          description="Any sRGB color as hex. Hue and chroma are kept; lightness is rebuilt."
          error={showBrandProblem || undefined}
        >
          {(control) => (
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.picker}
                value={studio.brand}
                aria-label="Brand color picker"
                onChange={(event) => studio.setBrandInput(event.target.value)}
              />
              <Input
                {...control}
                className={styles.hexInput}
                value={studio.brandDraft}
                spellCheck={false}
                autoComplete="off"
                onBlur={() => setBrandTouched(true)}
                onChange={(event) => studio.setBrandInput(event.target.value)}
              />
            </div>
          )}
        </Field>
        <Field label="Product id" description="Becomes the data-product value and the token names." error={studio.idProblem}>
          {(control) => (
            <Input
              {...control}
              className={styles.hexInput}
              value={studio.idDraft}
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => studio.setIdInput(event.target.value)}
            />
          )}
        </Field>
        <div className={styles.shapeField}>
          <ChoiceGroup
            legend="Shape"
            value={studio.shape}
            options={shapeNames.map((name) => ({ value: name, label: shapes[name].label }))}
            onChange={studio.setShape}
          />
          <Text variant="bodySmall" tone="muted">
            {shapes[studio.shape].description}
          </Text>
        </div>
      </div>

      <div className={styles.consoleFooter}>
        <div className={styles.presets} role="group" aria-labelledby="studio-presets-label">
          <span id="studio-presets-label" className={styles.caption}>
            Presets
          </span>
          {studioPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={styles.preset}
              aria-pressed={studio.brand === preset.brand && studio.id === preset.id}
              onClick={() => studio.applyPreset(preset)}
            >
              <span className={styles.presetSwatch} style={swatch(preset.brand)} aria-hidden="true" />
              {preset.id.charAt(0).toUpperCase() + preset.id.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <CopyButton text={() => window.location.href} label="Copy link" />
          <Button size="small" appearance="ghost" iconStart={<Icon name="refresh" />} onClick={studio.reset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

const percent = (value: number) => `${Math.round(value * 100)}%`;

/** The studio's verdict at a glance, as instrument readouts. */
export function StudioReadouts({ studio }: { studio: ThemeStudioState }) {
  const { summary } = studio;
  const peak = studio.analysis.reduce((best, step) => (step.c > best.c ? step : best));
  const readouts = [
    { label: 'Hue', value: `${Math.round(studio.oklch.h)}°`, detail: studio.hue },
    { label: 'Peak chroma', value: peak.c.toFixed(3), detail: `step ${peak.step}, L ${percent(peak.l)}` },
    {
      label: 'WCAG 2 AA',
      value: `${summary.passed}/${summary.total}`,
      detail: summary.passed === summary.total ? 'every pair passes' : `${summary.total - summary.passed} failing`,
      state: summary.passed === summary.total ? 'pass' : 'fail',
    },
    {
      label: 'Nearest status',
      value: formatDistance(summary.closest.distance),
      detail: `ΔEOK to ${summary.closest.tone}, ${summary.closest.close ? 'close' : 'distinct'}`,
      state: summary.closest.distance < closeDistance ? 'warn' : 'pass',
    },
  ];
  return (
    <dl className={styles.readouts}>
      {readouts.map((readout) => (
        <div key={readout.label} className={styles.readout} data-state={readout.state}>
          <dt className={styles.caption}>{readout.label}</dt>
          <dd className={styles.readoutValue}>{readout.value}</dd>
          <dd className={styles.readoutDetail}>{readout.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
