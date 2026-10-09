import { useState, type CSSProperties } from 'react';
import { ScrollRegion, Stack } from '@/design-system/layout';
import { Text } from '@/design-system/primitives';
import { closeDistance, formatDistance, rampSteps, statusTones } from './brand';
import { ChoiceGroup } from './ChoiceGroup';
import { simulateVision, visionTypes, type Vision } from './color';
import styles from './ThemeStudio.module.css';
import type { ThemeStudioState } from './useThemeStudio';

export const visionLabels: Record<Vision, string> = {
  typical: 'Typical',
  protanopia: 'Protanopia',
  deuteranopia: 'Deuteranopia',
  tritanopia: 'Tritanopia',
};

const swatch = (color: string) => ({ '--_swatch': color }) as CSSProperties;

/**
 * The brand's strong fill beside each status fill, as seen with typical vision and with three
 * simulated dichromacies, plus the whole ramp under each simulation.
 */
export function VisionPanel({ studio }: { studio: ThemeStudioState }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const checks = studio.status[theme];
  const close = checks.filter((check) => check.close);
  const cell = (tone: (typeof statusTones)[number], vision: Vision) => checks.find((check) => check.tone === tone && check.vision === vision);
  const closeByTone = statusTones
    .map((tone) => ({ tone, visions: close.filter((check) => check.tone === tone).map((check) => visionLabels[check.vision].toLowerCase()) }))
    .filter(({ visions }) => visions.length > 0)
    .map(({ tone, visions }) => `${tone} (${visions.length === visionTypes.length ? 'every vision type' : visions.join(', ')})`);

  return (
    <Stack gap="large">
      <div className={styles.visionHeader}>
        <ChoiceGroup
          legend="Theme"
          value={theme}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          onChange={setTheme}
        />
        <Text variant="bodySmall" className={styles.visionVerdict}>
          {close.length === 0
            ? `In the ${theme} theme the brand stays clearly apart from every status color, with typical vision and all three simulations.`
            : `${close.length} of ${checks.length} pairs are close in the ${theme} theme: ${closeByTone.join('; ')}. Status messages here always carry an icon and text, so color is never the only cue, but a brand this close makes primary actions harder to tell from alerts.`}
        </Text>
      </div>

      <div className={styles.tableBlock}>
        <p id="studio-vision-caption" className={styles.tableCaption}>
          Distance from each status fill, {theme} theme
        </p>
        <ScrollRegion aria-labelledby="studio-vision-caption">
          <table className={`${styles.table} ${styles.visionTable}`} aria-labelledby="studio-vision-caption">
            <thead>
              <tr>
                <th scope="col">Status</th>
                {visionTypes.map((vision) => (
                  <th key={vision} scope="col">
                    {visionLabels[vision]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statusTones.map((tone) => (
                <tr key={tone}>
                  <th scope="row" className={styles.capitalize}>
                    {tone}
                  </th>
                  {visionTypes.map((vision) => {
                    const check = cell(tone, vision);
                    if (!check) return <td key={vision} />;
                    return (
                      <td key={vision}>
                        <span className={styles.comparison} data-close={check.close || undefined}>
                          <span className={styles.pairSwatch} aria-hidden="true">
                            <span style={swatch(check.brand)} />
                            <span style={swatch(check.status)} />
                          </span>
                          <span className={styles.number}>{formatDistance(check.distance)}</span>
                          {check.close && <span className={styles.flag}>Close</span>}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
        <Text variant="bodySmall" tone="muted">
          Each cell shows the brand’s strong fill beside the status fill as that vision type sees them, and the ΔEOK
          between them. Below {closeDistance} is flagged as close.
        </Text>
      </div>

      <div className={styles.simulations}>
        <p className={styles.caption}>The ramp, simulated</p>
        <dl className={styles.simulationList}>
          {visionTypes.map((vision) => (
            <div key={vision} className={styles.simulation}>
              <dt className={styles.simulationLabel}>{visionLabels[vision]}</dt>
              <dd className={styles.simulationValue}>
                <span className={styles.simulationRamp} role="img" aria-label={`The 12 ramp steps with ${visionLabels[vision].toLowerCase()} vision`}>
                  {rampSteps.map((step) => (
                    <span key={step} style={swatch(simulateVision(studio.ramp[step], vision))} />
                  ))}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Stack>
  );
}
