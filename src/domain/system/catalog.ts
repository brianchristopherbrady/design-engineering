/**
 * The system's own inventory. The site's navigation, the Components index and the
 * resource directory demos all read this list, so the demo data is the real content.
 */
export const entryKinds = ['decision', 'component', 'foundation', 'pattern'] as const;
export const entryLayers = ['Decision', 'Layout', 'Primitive', 'Composite', 'Foundation', 'Pattern'] as const;
export const maturities = ['experimental', 'beta', 'stable', 'deprecated'] as const;

export type EntryKind = (typeof entryKinds)[number];
export type EntryLayer = (typeof entryLayers)[number];
export type Maturity = (typeof maturities)[number];

export interface CatalogEntry {
  /** URL slug, unique across the catalog. */
  id: string;
  name: string;
  kind: EntryKind;
  layer: EntryLayer;
  maturity: Maturity;
  summary: string;
  tags: readonly string[];
  /** ISO date of the last documented change. */
  updatedAt: string;
  /** Main implementation file, relative to the repository root. */
  sourcePath: string;
}

export const kindLabels: Record<EntryKind, string> = {
  decision: 'Design decision',
  component: 'Component',
  foundation: 'Foundation',
  pattern: 'Pattern',
};

export const maturityLabels: Record<Maturity, string> = {
  experimental: 'Experimental',
  stable: 'Stable',
  beta: 'Beta',
  deprecated: 'Deprecated',
};

const ds = 'src/design-system';

export const catalog: readonly CatalogEntry[] = [
  // Design decisions
  { id: 'planning', name: 'Planning a system', kind: 'decision', layer: 'Decision', maturity: 'stable', summary: 'From users, workflows and inconsistencies to principles, scoped requirements, a pilot and a measurement plan, with one principle traced to its validation.', tags: ['requirements', 'principles', 'pilot'], updatedAt: '2026-10-09', sourcePath: 'src/content/decisions/articles/planning.tsx' },
  { id: 'sharing', name: 'Sharing across products', kind: 'decision', layer: 'Decision', maturity: 'stable', summary: 'What a consumer mobile product and a professional desktop application should share, layer by layer, with a comparison that shows how constraints change the trade-offs.', tags: ['multi-product', 'architecture'], updatedAt: '2026-10-09', sourcePath: 'src/content/decisions/articles/sharing.tsx' },
  { id: 'implementation', name: 'Choosing an implementation approach', kind: 'decision', layer: 'Decision', maturity: 'stable', summary: 'Framework components, separate implementations, shared tokens and CSS, or Web Components with adapters, and the decisions each one requires.', tags: ['web components', 'frameworks'], updatedAt: '2026-10-09', sourcePath: 'src/content/decisions/articles/implementation.ts' },
  { id: 'operating', name: 'Operating and measuring a system', kind: 'decision', layer: 'Decision', maturity: 'stable', summary: 'Ownership, contribution, versioning, migration and a few measures, separating what this project checks from what has not been measured.', tags: ['governance', 'migration', 'measurement'], updatedAt: '2026-10-09', sourcePath: 'src/content/decisions/articles/operating.ts' },
  // Layout
  { id: 'box', name: 'Box', kind: 'component', layer: 'Layout', maturity: 'stable', summary: 'A plain surface with token-based padding, background, border and radius.', tags: ['surface', 'spacing'], updatedAt: '2026-10-06', sourcePath: `${ds}/layout/Box.tsx` },
  { id: 'stack', name: 'Stack', kind: 'component', layer: 'Layout', maturity: 'stable', summary: 'Vertical flow with one gap between children.', tags: ['spacing', 'flow'], updatedAt: '2026-10-06', sourcePath: `${ds}/layout/Stack.tsx` },
  { id: 'inline', name: 'Inline', kind: 'component', layer: 'Layout', maturity: 'stable', summary: 'Horizontal flow that wraps, for clusters of actions, tags and metadata.', tags: ['spacing', 'wrapping'], updatedAt: '2026-10-06', sourcePath: `${ds}/layout/Inline.tsx` },
  { id: 'grid', name: 'Grid', kind: 'component', layer: 'Layout', maturity: 'stable', summary: 'Equal columns: a fixed count, as many as fit, or as many as fit up to a cap.', tags: ['columns', 'responsive', 'spacing'], updatedAt: '2026-10-06', sourcePath: `${ds}/layout/Grid.tsx` },
  { id: 'container', name: 'Container', kind: 'component', layer: 'Layout', maturity: 'stable', summary: 'Centers content at a maximum width with fluid gutters and can name a query container.', tags: ['page', 'container queries'], updatedAt: '2026-09-18', sourcePath: `${ds}/layout/Container.tsx` },
  { id: 'theme-scope', name: 'ThemeScope', kind: 'component', layer: 'Layout', maturity: 'beta', summary: 'Re-themes a region by theme, product and density, inheriting whatever it does not set.', tags: ['theming', 'multi-brand', 'density'], updatedAt: '2026-10-08', sourcePath: `${ds}/layout/ThemeScope.tsx` },
    { id: 'scroll-region', name: 'ScrollRegion', kind: 'component', layer: 'Layout', maturity: 'beta', summary: 'Lets wide tables and code scroll inside the page, as a named region keyboard users can scroll.', tags: ['overflow', 'reflow', 'keyboard'], updatedAt: '2026-10-08', sourcePath: `${ds}/layout/ScrollRegion.tsx` },
    // Primitives
  { id: 'text', name: 'Text', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'Running text in one of the typography styles, with tone and alignment.', tags: ['typography'], updatedAt: '2026-10-06', sourcePath: `${ds}/primitives/Text/Text.tsx` },
  { id: 'heading', name: 'Heading', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'A section heading whose outline level and visual size are chosen separately.', tags: ['typography', 'outline'], updatedAt: '2026-10-06', sourcePath: `${ds}/primitives/Heading/Heading.tsx` },
  { id: 'button', name: 'Button', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'A native button with appearance, size, border, radius, loading and icon options.', tags: ['action', 'form', 'icon'], updatedAt: '2026-10-07', sourcePath: `${ds}/primitives/Button/Button.tsx` },
  { id: 'badge', name: 'Badge', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'A short label for status or category in six tones and three appearances.', tags: ['status', 'tone'], updatedAt: '2026-10-07', sourcePath: `${ds}/primitives/Badge/Badge.tsx` },
  { id: 'icon', name: 'Icon', kind: 'component', layer: 'Primitive', maturity: 'beta', summary: 'A stroke icon from a small fixed set, decorative unless given a label.', tags: ['icon', 'graphics'], updatedAt: '2026-10-07', sourcePath: `${ds}/primitives/Icon/Icon.tsx` },
  { id: 'link', name: 'Link', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'Navigation to another location, routed client-side without depending on a router.', tags: ['navigation'], updatedAt: '2026-09-18', sourcePath: `${ds}/primitives/Link/Link.tsx` },
  { id: 'input', name: 'Input', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'Single-line text entry, styled from the control and input tokens.', tags: ['form'], updatedAt: '2026-10-06', sourcePath: `${ds}/primitives/Input/Input.tsx` },
  { id: 'select', name: 'Select', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'A styled native select for choosing one option from a short list.', tags: ['form'], updatedAt: '2026-10-06', sourcePath: `${ds}/primitives/Select/Select.tsx` },
  { id: 'checkbox', name: 'Checkbox', kind: 'component', layer: 'Primitive', maturity: 'beta', summary: 'A native checkbox with its label and optional description.', tags: ['form', 'boolean'], updatedAt: '2026-10-07', sourcePath: `${ds}/primitives/Checkbox/Checkbox.tsx` },
  { id: 'switch', name: 'Switch', kind: 'component', layer: 'Primitive', maturity: 'beta', summary: 'An on/off setting that applies immediately, built on a native checkbox.', tags: ['form', 'boolean', 'settings'], updatedAt: '2026-10-07', sourcePath: `${ds}/primitives/Switch/Switch.tsx` },
  { id: 'progress', name: 'Progress', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'Determinate progress with a visible, associated label.', tags: ['status', 'feedback'], updatedAt: '2026-09-18', sourcePath: `${ds}/primitives/Progress/Progress.tsx` },
  { id: 'skeleton', name: 'Skeleton', kind: 'component', layer: 'Primitive', maturity: 'beta', summary: 'A placeholder shape for content that is loading.', tags: ['loading', 'feedback'], updatedAt: '2026-10-07', sourcePath: `${ds}/primitives/Skeleton/Skeleton.tsx` },
  { id: 'visually-hidden', name: 'VisuallyHidden', kind: 'component', layer: 'Primitive', maturity: 'stable', summary: 'Text for assistive technology that takes no visual space.', tags: ['accessibility'], updatedAt: '2026-09-18', sourcePath: `${ds}/primitives/VisuallyHidden/VisuallyHidden.tsx` },
  // Composites
  { id: 'card', name: 'Card', kind: 'component', layer: 'Composite', maturity: 'stable', summary: 'A bounded surface with header, body and footer regions and token-backed styling props.', tags: ['surface', 'elevation'], updatedAt: '2026-10-07', sourcePath: `${ds}/composites/Card/Card.tsx` },
  { id: 'dialog', name: 'Dialog', kind: 'component', layer: 'Composite', maturity: 'beta', summary: 'A modal dialog on the native dialog element with labelling and focus restoration.', tags: ['overlay', 'focus', 'confirmation'], updatedAt: '2026-10-07', sourcePath: `${ds}/composites/Dialog/Dialog.tsx` },
  { id: 'alert', name: 'Alert', kind: 'component', layer: 'Composite', maturity: 'beta', summary: 'A message about the page or an operation, with an icon, title and actions.', tags: ['status', 'feedback', 'error'], updatedAt: '2026-10-07', sourcePath: `${ds}/composites/Alert/Alert.tsx` },
  { id: 'tabs', name: 'Tabs', kind: 'component', layer: 'Composite', maturity: 'beta', summary: 'Switches between related panels with the ARIA tabs keyboard pattern.', tags: ['navigation', 'keyboard'], updatedAt: '2026-10-07', sourcePath: `${ds}/composites/Tabs/Tabs.tsx` },
  { id: 'disclosure', name: 'Disclosure', kind: 'component', layer: 'Composite', maturity: 'beta', summary: 'Shows and hides secondary content on native details and summary, optionally rendering it only when open.', tags: ['disclosure', 'keyboard', 'progressive'], updatedAt: '2026-10-08', sourcePath: `${ds}/composites/Disclosure/Disclosure.tsx` },
  { id: 'field', name: 'Field', kind: 'component', layer: 'Composite', maturity: 'stable', summary: 'Wires one control to its label, description and error message.', tags: ['form', 'validation'], updatedAt: '2026-10-06', sourcePath: `${ds}/composites/Field/Field.tsx` },
  { id: 'page-header', name: 'PageHeader', kind: 'component', layer: 'Composite', maturity: 'stable', summary: 'The introduction of a page: one focusable h1 with context, description and actions.', tags: ['page', 'outline'], updatedAt: '2026-10-06', sourcePath: `${ds}/composites/PageHeader/PageHeader.tsx` },
  { id: 'empty-state', name: 'EmptyState', kind: 'component', layer: 'Composite', maturity: 'stable', summary: 'Explains why a region is empty and offers a next step.', tags: ['feedback', 'empty'], updatedAt: '2026-10-06', sourcePath: `${ds}/composites/EmptyState/EmptyState.tsx` },
  { id: 'radio-group', name: 'RadioGroup', kind: 'component', layer: 'Composite', maturity: 'beta', summary: 'One choice from a short set, on native radios, as a plain list or as selectable cards with descriptions.', tags: ['form', 'choice', 'keyboard'], updatedAt: '2026-10-08', sourcePath: `${ds}/composites/RadioGroup/RadioGroup.tsx` },
  // Foundations
  { id: 'tokens', name: 'Token architecture', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Reference, semantic and component tiers, and how a value travels from source to CSS.', tags: ['tokens', 'pipeline'], updatedAt: '2026-10-05', sourcePath: `${ds}/tokens/source/system-lab.resolver.json` },
  { id: 'color', name: 'Color', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Palettes, semantic color roles, tones and verified contrast pairs.', tags: ['tokens', 'contrast', 'tone'], updatedAt: '2026-10-05', sourcePath: `${ds}/tokens/source/reference.tokens.json` },
  { id: 'typography', name: 'Typography', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Font families, the type scale and the composite text styles.', tags: ['tokens', 'type'], updatedAt: '2026-10-05', sourcePath: `${ds}/tokens/source/semantic.tokens.json` },
  { id: 'spacing', name: 'Spacing', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'The space scale and the named gap vocabulary shared by every layout primitive.', tags: ['tokens', 'layout'], updatedAt: '2026-10-05', sourcePath: `${ds}/tokens/vocabulary.ts` },
  { id: 'borders-and-radii', name: 'Borders and radii', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Border widths, border color strengths and corner radii.', tags: ['tokens', 'shape'], updatedAt: '2026-10-05', sourcePath: `${ds}/tokens/source/reference.tokens.json` },
  { id: 'elevation', name: 'Elevation', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Shadow levels and the stronger dark-theme variants they map to.', tags: ['tokens', 'depth'], updatedAt: '2026-10-05', sourcePath: `${ds}/tokens/source/theme.light.tokens.json` },
  { id: 'motion', name: 'Motion', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Durations, easing curves and the reduced-motion rule.', tags: ['tokens', 'animation'], updatedAt: '2026-10-05', sourcePath: `${ds}/styles/base.css` },
  { id: 'themes', name: 'Themes', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Light and dark mappings of the same semantic roles, scoped by data-theme.', tags: ['tokens', 'dark mode'], updatedAt: '2026-10-05', sourcePath: `${ds}/tokens/source/theme.dark.tokens.json` },
  { id: 'responsive', name: 'Responsive behavior', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'When to use container queries, viewport queries and intrinsic layout.', tags: ['layout', 'container queries'], updatedAt: '2026-10-06', sourcePath: `${ds}/layout/Grid.module.css` },
  { id: 'products', name: 'Products and modes', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Theme, product and density modifiers: compose any of twelve permutations, see exactly what a product overrides, and add a new one.', tags: ['tokens', 'multi-brand', 'density', 'dark mode'], updatedAt: '2026-10-08', sourcePath: `${ds}/tokens/source/system-lab.resolver.json` },
  { id: 'theme-studio', name: 'Theme studio', kind: 'foundation', layer: 'Foundation', maturity: 'stable', summary: 'Generate a complete product theme from one brand color: OKLCH ramp, contrast-checked roles, shape, color-vision checks and ready-to-merge sources.', tags: ['color', 'oklch', 'contrast', 'apca', 'color vision', 'multi-brand'], updatedAt: '2026-10-08', sourcePath: 'src/features/theming/brand.ts' },
  // Patterns
  { id: 'resource-directory', name: 'Resource directory', kind: 'pattern', layer: 'Pattern', maturity: 'stable', summary: 'A searchable, filterable list with loading, empty, no-results and error states.', tags: ['search', 'states', 'list'], updatedAt: '2026-10-07', sourcePath: 'src/content/patterns/ResourceDirectory.tsx' },
  { id: 'resource-detail', name: 'Resource detail', kind: 'pattern', layer: 'Pattern', maturity: 'stable', summary: 'A detail page with tabs, metadata and a confirmed destructive action that can fail.', tags: ['dialog', 'states', 'tabs'], updatedAt: '2026-10-08', sourcePath: 'src/content/patterns/ResourceDetail.tsx' },
  { id: 'activity-dashboard', name: 'Activity dashboard', kind: 'pattern', layer: 'Pattern', maturity: 'stable', summary: 'Summary metrics and a recent-changes feed that adapt to their container.', tags: ['dashboard', 'states', 'container queries'], updatedAt: '2026-10-08', sourcePath: 'src/content/patterns/ActivityDashboard.tsx' },
  { id: 'form-validation', name: 'Form validation', kind: 'pattern', layer: 'Pattern', maturity: 'stable', summary: 'Submit-time validation with an error summary, inline messages and focus management.', tags: ['form', 'validation', 'focus'], updatedAt: '2026-10-06', sourcePath: 'src/content/patterns/FormValidation.tsx' },
];

export function findEntry(id: string): CatalogEntry | undefined {
  return catalog.find((entry) => entry.id === id);
}

export function entriesOfKind(kind: EntryKind): CatalogEntry[] {
  return catalog.filter((entry) => entry.kind === kind && entry.maturity !== 'deprecated');
}
