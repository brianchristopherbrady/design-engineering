import type { DensityName, ProductName } from '@/design-system/tokens';

export interface ProductProfile {
  id: ProductName;
  name: string;
  /** Who the product serves; explains why its brand and shape differ. */
  audience: string;
  /** What the product context overrides. Everything else is inherited from the system. */
  overrides: string;
}

/** The products themed from this one system. Ids are the product modifier's contexts. */
export const productProfiles: Record<ProductName, ProductProfile> = {
  'system-lab': {
    id: 'system-lab',
    name: 'System Lab',
    audience: 'The design system itself and its documentation.',
    overrides: 'Nothing: the base mappings.',
  },
  harbor: {
    id: 'harbor',
    name: 'Harbor',
    audience: 'A financial operations tool used all day by analysts.',
    overrides: 'Teal brand roles, tighter corners on controls, badges, cards and dialogs.',
  },
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    audience: 'A consumer app used in short, friendly sessions.',
    overrides: 'Violet brand roles, pill-shaped controls and badges, soft extra-large card corners.',
  },
};

export const densityLabels: Record<DensityName, string> = {
  comfortable: 'Comfortable',
  compact: 'Compact',
};
