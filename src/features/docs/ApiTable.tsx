import { useId } from 'react';
import { ScrollRegion } from '@/design-system/layout';
import type { PropDoc } from './docTypes';
import styles from './ApiTable.module.css';

export interface ApiTableProps {
  caption: string;
  props: PropDoc[];
}

/** Props reference. Scrolls inside its own region on narrow screens instead of widening the page. */
export function ApiTable({ caption, props }: ApiTableProps) {
  const captionId = useId();
  return (
    <ScrollRegion className={styles.scroller} aria-labelledby={captionId}>
      <table className={styles.table}>
        <caption id={captionId} className={styles.caption}>
          {caption}
        </caption>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <th scope="row">
                <code>{prop.name}</code>
                {prop.required && <span className={styles.required}> required</span>}
              </th>
              <td>
                <code>{prop.type}</code>
              </td>
              <td className={styles.default}>{prop.defaultValue ? <code>{prop.defaultValue}</code> : '—'}</td>
              <td>{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}
