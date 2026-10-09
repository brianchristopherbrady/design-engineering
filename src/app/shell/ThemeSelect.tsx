import { useId, useState } from 'react';
import { Icon, Select } from '@/design-system/primitives';
import { densityNames, productNames, type DensityName, type ProductName } from '@/design-system/tokens';
import { densityLabels, productProfiles } from '@/domain/system';
import { useTheme, type ThemePreference } from '../providers/ThemeProvider';
import styles from './AppShell.module.css';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function Setting<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className={styles.themeSelect}>
      <label htmlFor={id} className={styles.themeLabel}>
        {label}
      </label>
      <Select id={id} className={styles.themeControl} value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/**
 * Site-wide display settings: the three token modifiers, applied to the whole page. On narrow
 * screens they fold behind a one-line summary that opens them in place.
 */
export function ThemeSelect() {
  const { preference, setPreference, product, setProduct, density, setDensity } = useTheme();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const summary = [
    productProfiles[product].name,
    themeOptions.find((option) => option.value === preference)?.label,
    densityLabels[density],
  ].join(' · ');
  return (
    <>
      <button
        type="button"
        className={styles.settingsToggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.themeLabel}>Display</span>{' '}
        <span className={styles.settingsSummary}>{summary}</span>
        <Icon name={open ? 'close' : 'plus'} className={styles.settingsIcon} />
      </button>
      <div id={panelId} className={[styles.settingsPanel, open && styles.open].filter(Boolean).join(' ')}>
        <Setting<ProductName>
          label="Product"
          value={product}
          options={productNames.map((name) => ({ value: name, label: productProfiles[name].name }))}
          onChange={setProduct}
        />
        <Setting<ThemePreference> label="Theme" value={preference} options={themeOptions} onChange={setPreference} />
        <Setting<DensityName>
          label="Density"
          value={density}
          options={densityNames.map((name) => ({ value: name, label: densityLabels[name] }))}
          onChange={setDensity}
        />
      </div>
    </>
  );
}
