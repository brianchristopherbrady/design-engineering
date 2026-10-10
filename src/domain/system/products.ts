import type { DensityName, ProductName } from '@/design-system/tokens';

export interface ProductProfile {
  id: ProductName;
  name: string;
  /** Who the product serves; explains why its brand, typefaces and shape differ. */
  audience: string;
  /** What the product context overrides. Everything else is inherited from the system. */
  overrides: string;
}

/** The products themed from this one system. Ids are the product modifier's contexts. */
export const productProfiles: Record<ProductName, ProductProfile> = {
  'system-lab': {
    id: 'system-lab',
    name: 'Design System Lab',
    audience: 'The design system itself and its documentation.',
    overrides: 'Nothing: the base mappings.',
  },
  harbor: {
    id: 'harbor',
    name: 'Harbor',
    audience: 'Professional tools: people working at a desk all day, scanning and acting on dense lists.',
    overrides: 'Teal brand roles, IBM Plex Sans throughout, tighter corners on controls, badges, cards and dialogs.',
  },
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    audience: 'Consumer apps: people visiting a few times a year, on phones and desktops, who need guidance.',
    overrides: 'Violet brand roles, Fraunces headings over Nunito text, pill-shaped controls and badges, soft extra-large card corners.',
  },
};

export const densityLabels: Record<DensityName, string> = {
  comfortable: 'Comfortable',
  compact: 'Compact',
};
