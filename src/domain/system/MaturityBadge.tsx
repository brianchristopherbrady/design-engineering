import { Badge, type BadgeProps } from '@/design-system/primitives';
import type { Tone } from '@/design-system/tokens';
import { maturityLabels, type Maturity } from './catalog';

const tones: Record<Maturity, Tone> = { experimental: 'info', beta: 'warning', stable: 'success', deprecated: 'danger' };

/** Maturity as a badge. The label carries the meaning; the tone repeats it. */
export function MaturityBadge({ maturity, ...rest }: { maturity: Maturity } & Omit<BadgeProps, 'tone' | 'children'>) {
  return (
    <Badge tone={tones[maturity]} {...rest}>
      {maturityLabels[maturity]}
    </Badge>
  );
}
