import { useId } from 'react';
import styles from './Lens.module.css';

/**
 * The red eye: a glass lens in a metal ring with a glowing iris and a bright pinpoint.
 * Decorative everywhere it appears. `detail` adds a specular highlight and a slow, one-time
 * waking glow for large sizes.
 */
export function Lens({ className, detail = false }: { className?: string; detail?: boolean }) {
  const id = useId();
  const iris = `${id}-iris`;
  const ring = `${id}-ring`;
  return (
    <svg
      className={[styles.lens, detail && styles.detail, className].filter(Boolean).join(' ')}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={iris}>
          <stop offset="0" className={styles.core} />
          <stop offset="0.2" className={styles.flare} />
          <stop offset="0.6" className={styles.iris} />
          <stop offset="1" className={styles.fade} />
        </radialGradient>
        <linearGradient id={ring} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles.ringLight} />
          <stop offset="1" className={styles.ringShade} />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15.25" className={styles.housing} stroke={`url(#${ring})`} />
      <circle cx="16" cy="16" r="12.5" className={styles.glass} />
      <circle cx="16" cy="16" r="9" fill={`url(#${iris})`} className={styles.glow} />
      {detail && <path d="M9.2 11.4a8.4 8.4 0 0 1 6.2-4.6" className={styles.highlight} />}
    </svg>
  );
}
