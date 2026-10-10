import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { withCustomProperties } from '../../layout';
import { Button, Heading, Icon, Text } from '../../primitives';
import {
  borderValue,
  elevationValue,
  radiusValue,
  spaceValue,
  surfaceValue,
  type BorderStrength,
  type Elevation,
  type Radius,
  type Space,
  type Surface,
} from '../../tokens';
import styles from './Dialog.module.css';

export const dialogSizes = ['small', 'medium', 'large'] as const;
export type DialogSize = (typeof dialogSizes)[number];

export interface DialogOwnProps {
  /** Whether the dialog is shown. The dialog is always controlled. */
  open: boolean;
  /** Called for Escape, the close button, any native close and, with `dismissOnBackdrop`, a backdrop click. Set `open` to false in response. */
  onClose: () => void;
  /** Visible title; also the dialog's accessible name. */
  title: ReactNode;
  /** Short text under the title; also the dialog's accessible description. */
  description?: ReactNode;
  /** Maximum inline size from the `dialog.width.*` tokens. Always shrinks to fit the viewport. */
  size?: DialogSize;
  /** Background role. Omit to use `dialog.background`. */
  surface?: Surface;
  /** Padding. Omit to use `dialog.padding`. */
  padding?: Space;
  /** Corner radius. Omit to use `dialog.radius`. */
  radius?: Radius;
  /** Border strength. Omit to use `dialog.border`. */
  border?: BorderStrength;
  /** Shadow depth. Omit to use `dialog.elevation`. */
  elevation?: Elevation;
  /** Extra header content next to the title, such as a status badge. */
  header?: ReactNode;
  /** Actions row. Put the least destructive action first in source order. */
  footer?: ReactNode;
  /** Element to focus on open. Defaults to the first focusable element (the close button). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Accessible name of the close button. */
  closeLabel?: string;
  /**
   * Call `onClose` when a click starts and ends on the backdrop outside the dialog. Off by default, so a
   * stray click cannot discard input. Escape and the close button work either way.
   */
  dismissOnBackdrop?: boolean;
  children?: ReactNode;
}

export type DialogProps = DialogOwnProps;

export const dialogDefaults = { size: 'medium', closeLabel: 'Close', dismissOnBackdrop: false } as const satisfies Partial<DialogOwnProps>;

const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Whether a pointer position on the dialog element lies outside its box, which means on the ::backdrop. */
function onBackdrop(dialog: HTMLDialogElement, x: number, y: number) {
  const box = dialog.getBoundingClientRect();
  return x < box.left || x > box.right || y < box.top || y > box.bottom;
}

/**
 * A modal dialog built on the native `<dialog>` element and `showModal()`, which provide the
 * inert background, top-layer rendering and Escape handling. This component adds controlled
 * state, labelling, initial focus, Tab wrapping and focus restoration.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  size = dialogDefaults.size,
  surface,
  padding,
  radius,
  border,
  elevation,
  header,
  footer,
  initialFocus,
  closeLabel = dialogDefaults.closeLabel,
  dismissOnBackdrop = dialogDefaults.dismissOnBackdrop,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  const initialFocusRef = useRef(initialFocus);

  useEffect(() => {
    onCloseRef.current = onClose;
    initialFocusRef.current = initialFocus;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !dismissOnBackdrop) return;
    // Where the press began, so pressing inside and releasing on the backdrop is not a dismissal.
    let pressedOnBackdrop = false;
    const press = (event: PointerEvent) => {
      pressedOnBackdrop = event.target === dialog && onBackdrop(dialog, event.clientX, event.clientY);
    };
    const click = (event: MouseEvent) => {
      const started = pressedOnBackdrop;
      pressedOnBackdrop = false;
      if (started && event.target === dialog && onBackdrop(dialog, event.clientX, event.clientY)) onCloseRef.current();
    };
    dialog.addEventListener('pointerdown', press);
    dialog.addEventListener('click', click);
    return () => {
      dialog.removeEventListener('pointerdown', press);
      dialog.removeEventListener('click', click);
    };
  }, [dismissOnBackdrop]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    const target = initialFocusRef.current?.current ?? dialog.querySelector<HTMLElement>(focusable);
    target?.focus();

    return () => {
      if (dialog.open) dialog.close();
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={[styles.dialog, styles[size]].join(' ')}
      style={withCustomProperties({
        '--_background': surface && surfaceValue(surface),
        '--_padding': padding && spaceValue(padding),
        '--_radius': radius && radiusValue(radius),
        '--_border': border && borderValue(border),
        '--_elevation': elevation && elevationValue(elevation),
      })}
      onCancel={(event) => {
        // Platform close requests (Escape, back gestures): keep React in charge of the open state.
        event.preventDefault();
        onCloseRef.current();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Tab' && !event.defaultPrevented) {
          // showModal() makes the page inert but lets Tab leave for the browser UI; wrap within the dialog instead.
          const tabbable = [...event.currentTarget.querySelectorAll<HTMLElement>(focusable)].filter(
            (element) => !element.matches(':disabled') && element.getClientRects().length > 0,
          );
          const first = tabbable[0];
          const last = tabbable.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
          return;
        }
        // Escape is handled here as well, because synthetic key events do not always reach close watchers.
        if (event.key !== 'Escape' || event.defaultPrevented) return;
        event.preventDefault();
        onCloseRef.current();
      }}
      onClose={(event) => {
        // A native close (such as a form with method="dialog") while React still says open.
        // Ignore it if the dialog was reopened before the queued event arrived.
        if (open && !event.currentTarget.open) onCloseRef.current();
      }}
    >
      {open && (
        <div className={styles.frame}>
          <div className={styles.header}>
            <div className={styles.heading}>
              <Heading level={2} size="medium" id={titleId}>
                {title}
              </Heading>
              {header}
              {description && (
                <Text id={descriptionId} tone="muted">
                  {description}
                </Text>
              )}
            </div>
            <Button appearance="ghost" size="small" border="none" onClick={() => onCloseRef.current()} aria-label={closeLabel}>
              <Icon name="close" size="small" />
            </Button>
          </div>
          {children && <div className={styles.body}>{children}</div>}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
