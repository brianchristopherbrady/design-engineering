/**
 * The token dependency policy: which tokens may alias or read which, how each rule is enforced
 * and which exceptions were accepted. The token architecture page renders this file, and
 * scripts/tokens/policy.test.mjs checks the stylesheets and the manifest against it.
 * Self-contained on purpose: the policy test imports it without the app's path aliases.
 */

export type PolicyScope = 'common' | 'system';
export type EnforcementKind = 'build' | 'lint' | 'test' | 'review';

export interface PolicyEnforcement {
  kind: EnforcementKind;
  path: string;
  detail: string;
}

export interface TokenPolicyRule {
  id: TokenPolicyRuleId;
  title: string;
  rule: string;
  rationale: string;
  /** `common`: widely shared practice. `system`: a convention this system chose, with tradeoffs. */
  scope: PolicyScope;
  enforcement: readonly PolicyEnforcement[];
}

export const tokenPolicyRuleIds = [
  'tier-direction',
  'palette-isolation',
  'invariant-reference',
  'direct-scale-reads',
  'component-alias',
  'component-ownership',
  'modifier-lanes',
] as const;
export type TokenPolicyRuleId = (typeof tokenPolicyRuleIds)[number];

const pipeline = 'scripts/tokens/pipeline.mjs';
const policyTest = 'scripts/tokens/policy.test.mjs';

export const tokenPolicy: readonly TokenPolicyRule[] = [
  {
    id: 'tier-direction',
    title: 'Aliases point down',
    rule: 'A token aliases its own tier or a lower one: component to semantic or reference, semantic to semantic or reference, reference to reference.',
    rationale: 'Every value keeps one path back to its source, and retuning a component token can never change a role that other components read.',
    scope: 'common',
    enforcement: [{ kind: 'build', path: pipeline, detail: 'checkTierPolicy fails the token build.' }],
  },
  {
    id: 'palette-isolation',
    title: 'Colors go through roles',
    rule: 'Only semantic tokens alias palette colors (color.*). Component color tokens alias semantic roles, and no stylesheet reads a --color-* variable or a raw color.',
    rationale: 'Themes and products work by re-pointing roles. A component that read a palette color would ignore both.',
    scope: 'common',
    enforcement: [
      { kind: 'build', path: pipeline, detail: 'checkTierPolicy rejects a component color that aliases a palette.' },
      { kind: 'lint', path: 'scripts/architecture/check-styles.mjs', detail: 'Rejects --color-* variables and raw color literals in stylesheets.' },
    ],
  },
  {
    id: 'invariant-reference',
    title: 'Reference scales never vary',
    rule: 'No theme, product or density context may override a reference token, so every reference token has the same value in all permutations.',
    rationale: 'This is what makes a direct scale read predictable. Anything a context must change needs a semantic role or a component token, which is where the override files point.',
    scope: 'system',
    enforcement: [
      { kind: 'build', path: pipeline, detail: 'An override of a reference token fails the build.' },
      { kind: 'test', path: policyTest, detail: 'Every reference token in the manifest depends on no modifier.' },
    ],
  },
  {
    id: 'direct-scale-reads',
    title: 'Direct scale reads are for fixed values',
    rule: 'Stylesheets and component tokens may use non-color reference scales (space, size, radius, border-width, font, duration, easing) for values that should stay the same in every theme, product and density: hairline borders, a spinner ring, the gap between an icon and its label.',
    rationale: 'Wrapping every fixed value in a semantic token adds names without adding choices. The cost is that such a value cannot be retuned per product without first promoting it, so every direct read is listed on the token architecture page for review.',
    scope: 'system',
    enforcement: [
      { kind: 'review', path: 'src/content/foundations/TokenPolicy.tsx', detail: 'Inventory of every direct reference read, generated from the stylesheets.' },
      { kind: 'test', path: policyTest, detail: 'No stylesheet reads a reference color.' },
    ],
  },
  {
    id: 'component-alias',
    title: 'Component tokens are aliases',
    rule: 'A component token never holds a literal value. It names a decision by pointing at a semantic role or a reference scale.',
    rationale: 'The decision stays reviewable as a choice between existing values, and a literal cannot slip past the contrast tests that cover the roles.',
    scope: 'system',
    enforcement: [{ kind: 'build', path: pipeline, detail: 'checkTierPolicy rejects literal component tokens.' }],
  },
  {
    id: 'component-ownership',
    title: 'A component reads its own tokens',
    rule: 'Inside the design system, a stylesheet reads only its own component tokens and the shared families listed below. Product and documentation code may read a component token to match that component in a composition.',
    rationale: 'Component tokens are a component’s styling contract. Reading another component’s tokens couples the two without either one declaring it.',
    scope: 'system',
    enforcement: [{ kind: 'test', path: policyTest, detail: 'Fails on an undeclared cross-component read.' }],
  },
  {
    id: 'modifier-lanes',
    title: 'Each modifier keeps to its lane',
    rule: 'Theme defines color and elevation roles. Product overrides only brand roles and shape. Density overrides only control size, button padding and the spacing scale.',
    rationale: 'Independent axes are what let twelve permutations come from a few small files without combinations that need individual review.',
    scope: 'system',
    enforcement: [
      { kind: 'build', path: pipeline, detail: 'Override contexts may only replace tokens that already exist.' },
      { kind: 'test', path: policyTest, detail: 'Every token a product or density overrides is inside that modifier’s lane.' },
    ],
  },
];

/** Component token families that several design-system components share, and who may read them. */
export const sharedTokenFamilies: Readonly<Record<string, readonly string[]>> = {
  input: ['Input', 'Select', 'Switch'],
};

export interface PolicyException {
  rule: TokenPolicyRuleId;
  file: string;
  /** Token path that is read or overridden. */
  token: string;
  reason: string;
}

/** Accepted departures from a rule, each with its reason. The policy test allows exactly these. */
export const policyExceptions: readonly PolicyException[] = [
  {
    rule: 'component-ownership',
    file: 'src/design-system/composites/EmptyState/EmptyState.module.css',
    token: 'card.radius',
    reason: 'An empty state stands in for a card or list, so its outline follows the card corner, including each product’s shape.',
  },
];

/** Path prefixes each override modifier may change. A token outside its lane fails the policy test. */
export const modifierLanes: Readonly<Record<'product' | 'density', readonly string[]>> = {
  product: [
    'action.primary.',
    'text.link',
    'focus.ring',
    'surface.accent',
    'tone.brand.',
    'control.radius',
    'badge.radius',
    'card.radius',
    'dialog.radius',
    'radio-group.card-radius',
  ],
  density: ['control.height.', 'control.padding-inline', 'button.padding-inline.', 'spacing.'],
};

export interface StylesheetRead {
  file: string;
  line: number;
  /** Custom property name, such as `--button-radius`. */
  cssVar: string;
}

/** Every `var(--token)` a stylesheet reads, ignoring comments and private `--_` properties. */
export function stylesheetReads(file: string, css: string): StylesheetRead[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
  return [...source.matchAll(/var\(\s*(--[\w-]+)/g)]
    .filter((match) => !match[1]?.startsWith('--_'))
    .map((match) => ({ file, line: source.slice(0, match.index).split('\n').length, cssVar: match[1] ?? '' }));
}

/** The design-system component a stylesheet belongs to, from its folder or file name. */
export function componentOfStylesheet(file: string): string | undefined {
  const match = /^src\/design-system\/(?:primitives|composites)\/(\w+)\/|^src\/design-system\/layout\/(\w+)\.module\.css$/.exec(file);
  return match?.[1] ?? match?.[2];
}

export interface OwnershipFinding extends StylesheetRead {
  path: string;
  owner: string;
  exception?: PolicyException;
}

/**
 * Cross-component reads of component tokens inside the design system. `componentPathOf` maps a
 * custom property to its token path when that token is in the component tier.
 */
export function crossComponentReads(reads: readonly StylesheetRead[], componentPathOf: (cssVar: string) => string | undefined): OwnershipFinding[] {
  return reads.flatMap((read) => {
    const component = componentOfStylesheet(read.file);
    const path = componentPathOf(read.cssVar);
    if (!component || !path) return [];
    const family = path.split('.')[0] ?? '';
    const own = component.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    if (family === own || sharedTokenFamilies[family]?.includes(component)) return [];
    const exception = policyExceptions.find((candidate) => candidate.rule === 'component-ownership' && candidate.file === read.file && candidate.token === path);
    return [{ ...read, path, owner: family, exception }];
  });
}

/** Whether a token path is inside a modifier's lane. */
export const inLane = (modifier: keyof typeof modifierLanes, path: string) =>
  modifierLanes[modifier].some((prefix) => (prefix.endsWith('.') ? path.startsWith(prefix) : path === prefix));
