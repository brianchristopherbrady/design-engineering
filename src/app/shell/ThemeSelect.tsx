import { useId } from 'react';
import { Select } from '@/design-system/primitives';
import { useTheme, type ThemePreference } from '../providers/ThemeProvider';
import styles from './AppShell.module.css';

const options: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ThemeSelect() {
  const { preference, setPreference } = useTheme();
  const id = useId();
  return (
    <div className={styles.themeSelect}>
      <label htmlFor={id} className={styles.themeLabel}>
        Theme
      </label>
      <Select
        id={id}
        className={styles.themeControl}
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
