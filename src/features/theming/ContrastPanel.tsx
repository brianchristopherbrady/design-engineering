import { useId } from 'react';
import { Grid, Inline } from '@/design-system/layout';
import { Badge, Text } from '@/design-system/primitives';
import type { ContrastCheck } from './brand';
import styles from './ThemeStudio.module.css';
import type { ThemeStudioState } from './useThemeStudio';

function Checks({ caption, checks }: { caption: string; checks: ContrastCheck[] }) {
  const captionId = useId();
  const passed = checks.filter((check) => check.pass).length;
  return (
    <div className={styles.scroller} tabIndex={0} role="region" aria-labelledby={captionId}>
      <table className={styles.table}>
        <caption id={captionId} className={styles.tableCaption}>
          {caption} · {passed}/{checks.length} pass
        </caption>
        <thead>
          <tr>
            <th scope="col">Pair</th>
            <th scope="col">WCAG 2</th>
            <th scope="col">APCA Lc</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.label}>
              <th scope="row">
                <span className={styles.pair}>
                  <span className={styles.chip} style={{ backgroundColor: check.background, color: check.foreground }} aria-hidden="true">
                    {check.minimum < 4.5 ? <span className={styles.mark} /> : 'Aa'}
                  </span>
                  {check.label}
                </span>
              </th>
              <td>
                <Inline gap="extraSmall" wrap={false}>
                  <span className={styles.number}>{check.ratio.toFixed(2)}:1</span>
                  <Badge size="small" tone={check.pass ? 'success' : 'danger'}>
                    {check.pass ? `Pass ≥ ${check.minimum}` : `Fail < ${check.minimum}`}
                  </Badge>
                </Inline>
              </td>
              <td className={styles.number}>{check.apca.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Every brand pair the roles create, against the theme's real surfaces, in both themes. */
export function ContrastPanel({ studio }: { studio: ThemeStudioState }) {
  const failures = studio.summary.total - studio.summary.passed;
  return (
    <>
      <Text role="status" variant="bodySmall">
        {failures === 0
          ? `All ${studio.summary.total} brand pairs pass WCAG 2 AA in both themes.`
          : `${failures} of ${studio.summary.total} brand pairs fail WCAG 2 AA. Try a different hue or chroma.`}
      </Text>
      <Grid minColumnWidth="large" gap="large">
        <Checks caption="Light theme" checks={studio.roles.light.checks} />
        <Checks caption="Dark theme" checks={studio.roles.dark.checks} />
      </Grid>
    </>
  );
}
