import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Icon, type IconName } from '../../primitives';
import styles from './Alert.module.css';

export const alertTones = ['info', 'success', 'warning', 'danger'] as const;
export type AlertTone = (typeof alertTones)[number];

export interface AlertOwnProps {
  /** Status role. The icon and title repeat the meaning, so color is never the only cue. */
  tone?: AlertTone;
  /** Short summary of what happened. */
  title: ReactNode;
  /** Detail and guidance. */
  children?: ReactNode;
  /** Recovery or follow-up actions, such as Retry. */
  actions?: ReactNode;
}

export type AlertProps = AlertOwnProps & Omit<ComponentPropsWithRef<'div'>, keyof AlertOwnProps>;

export const alertDefaults = { tone: 'info' } as const satisfies Partial<AlertOwnProps>;

const icons: Record<AlertTone, IconName> = { info: 'info', success: 'success', warning: 'warning', danger: 'danger' };

/**
 * A message about the state of the page or an operation. Static by default: pass role="alert"
 * or role="status" only when the message appears in response to an action and must be announced.
 */
export function Alert({ tone = alertDefaults.tone, title, children, actions, className, ...rest }: AlertProps) {
  return (
    <div className={[styles.alert, styles[tone], className].filter(Boolean).join(' ')} {...rest}>
      <Icon name={icons[tone]} size="medium" className={styles.icon} />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {children && <div className={styles.body}>{children}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
