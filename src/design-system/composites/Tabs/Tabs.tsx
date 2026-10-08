import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  /** Stable id, unique within the tab set. */
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  /** Accessible name of the tab list. */
  label: string;
  items: readonly TabItem[];
  /** Initially selected tab. Defaults to the first. */
  defaultSelectedId?: string;
  /** Called after the selection changes. */
  onSelectedChange?: (id: string) => void;
}

/**
 * Tabs following the ARIA tabs pattern: one Tab stop for the list, arrow keys (and Home/End)
 * move and select, and the selected panel is the next Tab stop. Unselected panels stay
 * mounted but hidden, so their state survives switching.
 */
export function Tabs({ label, items, defaultSelectedId, onSelectedChange }: TabsProps) {
  const baseId = useId();
  const [selectedId, setSelectedId] = useState(defaultSelectedId ?? items[0]?.id);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const select = (id: string) => {
    setSelectedId(id);
    tabRefs.current.get(id)?.focus();
    onSelectedChange?.(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = items.findIndex((item) => item.id === selectedId);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key];
    let target: TabItem | undefined;
    if (next !== undefined) target = items[(index + next + items.length) % items.length];
    else if (event.key === 'Home') target = items[0];
    else if (event.key === 'End') target = items.at(-1);
    if (!target) return;
    event.preventDefault();
    select(target.id);
  };

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => select(item.id)}
              onKeyDown={onKeyDown}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          tabIndex={0}
          hidden={item.id !== selectedId}
          className={styles.panel}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
