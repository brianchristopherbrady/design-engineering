import type { CSSProperties } from 'react';
import { brandRoles, type BrandRole } from './brand';
import { wcagContrast } from './color';
import styles from './ThemeStudio.module.css';
import type { ThemeStudioState } from './useThemeStudio';

/** Top of the chroma axis: a little above the most chroma sRGB can show at any lightness. */
const chromaAxis = 0.34;

const percent = (value: number) => `${Math.round(value * 100)}%`;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const vars = (values: Record<string, string | number>) =>
  Object.fromEntries(Object.entries(values).map(([name, value]) => [`--_${name}`, String(value)])) as CSSProperties;

/** White or near-black, whichever reads better on the swatch. */
export const inkFor = (hex: string) => (wcagContrast('#ffffff', hex) >= wcagContrast('#0b0c0e', hex) ? '#ffffff' : '#0b0c0e');

/** OKLCH lightness and chroma per step, with the sRGB ceiling that limits chroma. */
export function RampChart({ studio }: { studio: ThemeStudioState }) {
  const steps = studio.analysis;
  const first = steps[0];
  const last = steps.at(-1);
  const peak = steps.reduce((best, step) => (step.c > best.c ? step : best));
  const reduced = steps.filter((step) => step.reduced);
  const label = [
    first && last ? `Lightness falls in even steps from ${percent(first.l)} to ${percent(last.l)}.` : '',
    `Chroma peaks at ${peak.c.toFixed(3)} at step ${peak.step}.`,
    reduced.length
      ? `Steps ${reduced.map((step) => step.step).join(', ')} asked for more chroma than sRGB can show and were reduced.`
      : 'Every step fits sRGB at the chroma it asked for.',
  ].join(' ');
  const line = steps.map((step, index) => `${index + 0.5},${1 - step.l}`).join(' ');

  return (
    <figure className={styles.chart}>
      <div className={styles.plot} role="img" aria-label={label}>
        <div className={styles.band}>
          <span className={styles.bandLabel}>Lightness</span>
          <svg className={styles.line} viewBox={`0 0 ${steps.length} 1`} preserveAspectRatio="none" aria-hidden="true">
            <polyline points={line} vectorEffect="non-scaling-stroke" />
          </svg>
          {steps.map((step) => (
            <span key={step.step} className={styles.column}>
              <span className={styles.dot} style={vars({ l: step.l, swatch: step.hex })} />
            </span>
          ))}
        </div>
        <div className={styles.band}>
          <span className={styles.bandLabel}>Chroma</span>
          {steps.map((step) => (
            <span
              key={step.step}
              className={styles.column}
              style={vars({
                c: clamp(step.c / chromaAxis),
                ceiling: clamp(step.ceiling / chromaAxis),
                requested: clamp(step.requested / chromaAxis),
                swatch: step.hex,
              })}
            >
              <span className={styles.ceiling} />
              {step.reduced && <span className={styles.requested} />}
              <span className={styles.bar} />
            </span>
          ))}
        </div>
      </div>
      <div className={styles.axis} aria-hidden="true">
        {steps.map((step) => (
          <span key={step.step}>{step.step}</span>
        ))}
      </div>
      <figcaption className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} aria-hidden="true" /> OKLCH lightness, fixed per step
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendBar} aria-hidden="true" /> Chroma delivered
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendCeiling} aria-hidden="true" /> Most chroma sRGB can show
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendRequested} aria-hidden="true" /> Asked for, then reduced to fit
        </span>
      </figcaption>
    </figure>
  );
}

/** The twelve steps with their hex, lightness and chroma. */
export function RampStrip({ studio, label }: { studio: ThemeStudioState; label: string }) {
  return (
    <div className={styles.stripFrame}>
      <ol className={styles.strip} aria-label={label}>
        {studio.analysis.map((step) => (
          <li key={step.step} className={styles.stripStep}>
            <span className={styles.stripSwatch} style={vars({ swatch: step.hex, ink: inkFor(step.hex) })}>
              {step.step}
            </span>
            <code className={styles.stripHex}>{step.hex}</code>
            <span className={styles.stripMeta}>L {percent(step.l)}</span>
            <span className={styles.stripMeta}>C {step.c.toFixed(3)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const roleUse: Record<BrandRole, string> = {
  strong: 'Primary buttons, filled brand badges, switch track',
  stronger: 'Primary button hover',
  strongest: 'Primary button pressed',
  'on-strong': 'Labels and icons on the three strong steps',
  text: 'Links and brand-colored text',
  subtle: 'Tinted brand surface',
  border: 'Brand outlines and the focus ring',
};

/** Which ramp step each brand role took in each theme, and what the role is for. */
export function RoleMap({ studio }: { studio: ThemeStudioState }) {
  const cell = (theme: 'light' | 'dark', role: BrandRole) => {
    const step = studio.roles[theme].roles[role];
    const hex = studio.ramp[step];
    return (
      <td>
        <span className={styles.roleValue}>
          <span className={styles.roleChip} style={vars({ swatch: hex })} aria-hidden="true" />
          <span>{step}</span>
          <code className={styles.muted}>{hex}</code>
        </span>
      </td>
    );
  };
  return (
    <div className={styles.scroller} tabIndex={0} role="region" aria-labelledby="studio-roles-caption">
      <table className={`${styles.table} ${styles.roleTable}`}>
        <caption id="studio-roles-caption" className={styles.tableCaption}>
          Brand roles by theme
        </caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Light</th>
            <th scope="col">Dark</th>
            <th scope="col">Used for</th>
          </tr>
        </thead>
        <tbody>
          {brandRoles.map((role) => (
            <tr key={role}>
              <th scope="row">
                <code>{role}</code>
              </th>
              {cell('light', role)}
              {cell('dark', role)}
              <td className={styles.muted}>{roleUse[role]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
