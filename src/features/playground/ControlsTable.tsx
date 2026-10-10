import { useId, type ReactNode } from 'react';
import { Icon, iconNames, Input, Select } from '@/design-system/primitives';
import type { AnyControl, AnyStory, ControlValue, ControlValues, PropApi, UnsetKind } from './types';
import styles from './ControlsTable.module.css';

const unsetKindLabels: Record<UnsetKind, string> = { token: 'token default', inherit: 'inherited', default: 'API default' };

/** A value as it would be written in JSX, so `"medium"` and `2` read like the documentation. */
const literal = (value: ControlValue) => (typeof value === 'string' ? `"${value}"` : String(value));
const unquote = (text: string) => text.replace(/^"(.*)"$/, '$1');

/**
 * Quiet facts under a prop's description: its type and documented default, what an unset value
 * falls back to, and the example's starting value when that differs from the API default.
 */
function metadata(control: AnyControl, api: PropApi | undefined): ReactNode[] {
  const items: ReactNode[] = [];
  const type = control.kind === 'select' ? undefined : (api?.type ?? (control.kind === 'switch' ? 'boolean' : undefined));
  if (type) {
    items.push(
      <span key="type">
        Type <code>{type}</code>
      </span>,
    );
  }
  const unset = control.kind === 'select' && control.unsetLabel ? control : undefined;
  if (unset) {
    items.push(
      <span key="unset">
        Unset: {unset.unsetLabel} ({unsetKindLabels[unset.unsetKind]})
      </span>,
    );
  } else if (api?.defaultValue) {
    items.push(
      <span key="default">
        Default <code>{api.defaultValue}</code>
      </span>,
    );
  }
  const start = control.defaultValue;
  if (start !== undefined && (api?.defaultValue !== undefined || unset) && unquote(api?.defaultValue ?? '') !== String(start)) {
    items.push(
      <span key="start">
        Example starts at <code>{literal(start)}</code>
      </span>,
    );
  }
  return items;
}

interface EditorProps {
  control: AnyControl;
  value: ControlValue;
  onChange: (value: ControlValue) => void;
  labelledBy: string;
  describedBy: string;
}

/** Two native radios, `false` and `true`, so the current value is always stated rather than implied. */
function BooleanControl({ value, onChange, labelledBy, describedBy }: Omit<EditorProps, 'control'>) {
  const name = useId();
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} aria-describedby={describedBy} className={styles.boolean}>
      {[false, true].map((option) => (
        <label key={String(option)} className={styles.booleanOption}>
          <input
            type="radio"
            className={styles.booleanInput}
            name={name}
            value={String(option)}
            checked={Boolean(value) === option}
            onChange={() => onChange(option)}
          />
          <Icon name="check" className={styles.booleanCheck} />
          {String(option)}
        </label>
      ))}
    </div>
  );
}

function Editor({ control, value, onChange, labelledBy, describedBy }: EditorProps) {
  const named = { 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, className: styles.field };
  switch (control.kind) {
    case 'switch':
      return <BooleanControl value={value} onChange={onChange} labelledBy={labelledBy} describedBy={describedBy} />;
    case 'text':
      return <Input {...named} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
    case 'icon':
      return (
        <Select {...named} value={String(value ?? '')} onChange={(event) => onChange(event.target.value || undefined)}>
          <option value="">None</option>
          {iconNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      );
    case 'select':
      return (
        <Select
          {...named}
          value={value === undefined ? '' : String(value)}
          onChange={(event) => onChange(control.options.find((option) => String(option) === event.target.value))}
        >
          {control.unsetLabel && <option value="">Unset: {control.unsetLabel}</option>}
          {control.options.map((option) => (
            <option key={option} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </Select>
      );
  }
}

function ControlRow({ control, value, api, onChange }: { control: AnyControl; value: ControlValue; api: PropApi | undefined; onChange: (value: ControlValue) => void }) {
  const id = useId();
  const meta = metadata(control, api);
  const ids = { name: `${id}-name`, description: `${id}-description`, meta: `${id}-meta` };
  return (
    // Explicit roles keep the table semantics when narrow layouts restyle the rows as blocks.
    <tr role="row" className={styles.row}>
      <th role="rowheader" scope="row" className={styles.prop}>
        <code id={ids.name} className={styles.name}>
          {control.prop}
        </code>
        <span id={ids.description} className={styles.description}>
          {control.description}
        </span>
        {meta.length > 0 && (
          <span id={ids.meta} className={styles.meta}>
            {meta}
          </span>
        )}
      </th>
      <td className={styles.control}>
        <Editor
          control={control}
          value={value}
          onChange={onChange}
          labelledBy={ids.name}
          describedBy={meta.length > 0 ? `${ids.description} ${ids.meta}` : ids.description}
        />
      </td>
    </tr>
  );
}

export interface ControlsTableProps {
  story: AnyStory;
  values: ControlValues;
  /** Documented facts about the component's props, where the reference has them. */
  api?: readonly PropApi[];
  onChange: (prop: string, value: ControlValue) => void;
  /** Id of the heading that names the table. */
  labelledBy: string;
}

/** One row per editable prop: the public name and its documentation beside the control that sets it. */
export function ControlsTable({ story, values, api, onChange, labelledBy }: ControlsTableProps) {
  return (
    <table role="table" className={styles.table} aria-labelledby={labelledBy}>
      <thead className={styles.head}>
        <tr role="row">
          <th role="columnheader" scope="col">
            Prop
          </th>
          <th role="columnheader" scope="col">
            Control
          </th>
        </tr>
      </thead>
      <tbody>
        {story.controls.map((control) => (
          <ControlRow
            key={control.prop}
            control={control}
            value={values[control.prop]}
            api={api?.find((prop) => prop.name === control.prop)}
            onChange={(value) => onChange(control.prop, value)}
          />
        ))}
      </tbody>
    </table>
  );
}
