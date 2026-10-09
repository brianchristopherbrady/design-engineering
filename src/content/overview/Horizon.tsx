import { useId } from 'react';
import styles from './Horizon.module.css';

export interface HorizonReadout {
  label: string;
  value: number;
}

/** Deterministic star field, so the scene is identical on every render and in every test run. */
const stars = (() => {
  let seed = 2001;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 64 }, () => ({
    x: Math.round(random() * 1200),
    y: Math.round(random() * 280),
    r: Number((0.5 + random() * 1.1).toFixed(2)),
    o: Number((0.25 + random() * 0.65).toFixed(2)),
  }));
})();

/**
 * The Overview's opening scene: a sun rising over a planet's limb, drawn as a nested dark
 * theme so it reads as a window onto space in either site theme. The readouts below it
 * summarize the system; the scene itself is decorative.
 */
export function Horizon({ readouts }: { readouts: readonly HorizonReadout[] }) {
  const id = useId();
  const corona = `${id}-corona`;
  const limb = `${id}-limb`;
  const flare = `${id}-flare`;
  const haze = `${id}-haze`;

  return (
    <div className={styles.horizon} data-theme="dark">
      <svg className={styles.scene} viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={corona} cx="600" cy="290" r="340" gradientUnits="userSpaceOnUse">
            <stop offset="0" className={styles.sunStop} />
            <stop offset="0.035" className={styles.coronaHot} />
            <stop offset="0.16" className={styles.coronaWarm} />
            <stop offset="0.48" className={styles.coronaFaint} />
            <stop offset="1" className={styles.coronaNone} />
          </radialGradient>
          <linearGradient id={limb} x1="0" x2="1200" y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" className={styles.limbNone} />
            <stop offset="0.5" className={styles.limbFull} />
            <stop offset="1" className={styles.limbNone} />
          </linearGradient>
          <linearGradient id={flare} x1="140" x2="1060" y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" className={styles.flareNone} />
            <stop offset="0.5" className={styles.flareFull} />
            <stop offset="1" className={styles.flareNone} />
          </linearGradient>
          <filter id={haze} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <g className={styles.stars}>
          {stars.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.r} opacity={star.o} />
          ))}
        </g>

        <g className={styles.sun}>
          <circle cx="600" cy="290" r="340" fill={`url(#${corona})`} />
        </g>

        <circle cx="600" cy="1890" r="1600" className={styles.atmosphere} stroke={`url(#${limb})`} filter={`url(#${haze})`} />
        <circle cx="600" cy="1890" r="1600" className={styles.planet} stroke={`url(#${limb})`} />

        <g className={styles.flare}>
          <ellipse cx="600" cy="290" rx="460" ry="1.25" fill={`url(#${flare})`} />
          <circle cx="600" cy="290" r="3.5" className={styles.core} />
        </g>
      </svg>

      <dl className={styles.readouts}>
        {readouts.map((readout) => (
          <div key={readout.label} className={styles.readout}>
            <dt className={styles.label}>{readout.label}</dt>
            <dd className={styles.value}>{readout.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
