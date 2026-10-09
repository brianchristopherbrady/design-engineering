import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './ContainerOverlay.module.css';

interface Box {
  name: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

function measure(root: HTMLElement, anchor: HTMLElement): Box[] {
  const origin = anchor.getBoundingClientRect();
  return [root, ...root.querySelectorAll<HTMLElement>('*')]
    .filter((element) => getComputedStyle(element).containerType !== 'normal')
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const name = getComputedStyle(element).containerName;
      return {
        name: name && name !== 'none' ? name : 'unnamed',
        top: rect.top - origin.top,
        left: rect.left - origin.left,
        width: rect.width,
        height: rect.height,
      };
    });
}

/**
 * When enabled, outlines every query container in its children with the container's name and
 * current inline size, and lists them as text. A documentation aid: it reads computed styles
 * and never changes the components it inspects.
 */
export function ContainerInspector({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    const anchor = anchorRef.current;
    const root = contentRef.current;
    if (!enabled || !anchor || !root || typeof ResizeObserver === 'undefined') return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setBoxes(measure(root, anchor)));
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(root);
    const mutation = new MutationObserver(update);
    mutation.observe(root, { subtree: true, childList: true, attributes: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  const rem = typeof document === 'undefined' ? 16 : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const groups = new Map<string, number[]>();
  for (const box of boxes) groups.set(box.name, [...(groups.get(box.name) ?? []), Math.round(box.width)]);
  const describe = ([name, widths]: [string, number[]]) => {
    const min = Math.min(...widths);
    const max = Math.max(...widths);
    const size = min === max ? `${min}px (${(min / rem).toFixed(1)}rem)` : `${min}–${max}px`;
    return widths.length === 1 ? `${name} ${size}` : `${widths.length} × ${name} at ${size}`;
  };
  return (
    <>
      <div ref={anchorRef} className={styles.anchor}>
        <div ref={contentRef}>{children}</div>
        {enabled && (
          <div className={styles.layer} aria-hidden="true">
            {boxes.map((box, index) => (
              <div key={index} className={styles.box} style={{ top: box.top, left: box.left, width: box.width, height: box.height }}>
                <span className={styles.label}>
                  {box.name} · {Math.round(box.width)}px
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {enabled && (
        <p className={styles.summary} role="status" data-testid="container-summary">
          {boxes.length === 0
            ? 'No query containers in the preview.'
            : `Query containers: ${[...groups].map(describe).join('; ')}.`}
        </p>
      )}
    </>
  );
}
